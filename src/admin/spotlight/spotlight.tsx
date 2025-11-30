'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FaTrash, FaHome, FaCheck, FaTimes, FaEye, FaEyeSlash, FaSpinner, FaPrint, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './spotlight.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import Loader from '@/custom/loader/loader';

// Dynamically import PrintCard to avoid SSR issues
const PrintCard = dynamic(() => import('./printcard/printcard'), {
    ssr: false,
    loading: () => <div><Loader /></div>,
});

interface Spotlight {
    id: string;
    name: string;
    award_type: 'weekly' | 'monthly' | 'yearly';
    message: string;
    date: string;
    is_show_on_home_page: boolean;
    like_count: number;
    image_url: string;
    created_date: string;
}

const BUCKET = 'star-of-week-images';

const buildPublicUrl = (pathOrUrl?: string) => {
    if (!pathOrUrl) return '/assets/default-avatar.png';
    if (pathOrUrl.startsWith('http')) return pathOrUrl;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    if (supabaseUrl) {
        return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${pathOrUrl}`;
    }
    return pathOrUrl;
};

const getStoragePathFromPublicUrl = (url?: string) => {
    if (!url) return null;
    try {
        const match = url.match(new RegExp(`${BUCKET}/(.+)$`));
        return match ? match[1] : null;
    } catch {
        return null;
    }
};

const Spotlight = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        message: '',
        award_type: 'weekly',
        is_show_on_home_page: false,
        date: new Date().toISOString().split('T')[0] // Add date field
    });

    // Spotlight list management
    const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
    const [spotlightsLoading, setSpotlightsLoading] = useState(true);
    const [filterType, setFilterType] = useState<'all' | 'weekly' | 'monthly' | 'yearly'>('all');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedForDelete, setSelectedForDelete] = useState<Spotlight | null>(null);
    const [showHomepageModal, setShowHomepageModal] = useState(false);
    const [selectedForHomepage, setSelectedForHomepage] = useState<Spotlight | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [homepageLoading, setHomepageLoading] = useState(false);

    // ✨ CONFLICT MODAL STATE - When trying to add to homepage when one already exists GLOBALLY ✨
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictData, setConflictData] = useState<{
        newCard: Spotlight | null;
        existingCard: Spotlight | null;
    }>({ newCard: null, existingCard: null });
    const [conflictLoading, setConflictLoading] = useState(false);

    // Print modal state
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedForPrint, setSelectedForPrint] = useState<Spotlight | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Set mounted state
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch all spotlights
    const fetchSpotlights = useCallback(async () => {
        try {
            setSpotlightsLoading(true);
            const { data, error } = await supabase
                .from('awards')
                .select('*')
                .order('created_date', { ascending: false });

            if (error) {
                console.error('Fetch error:', error);
                toast.error('Failed to fetch spotlights');
                setSpotlights([]);
                return;
            }

            const processed: Spotlight[] = (data || []).map((d: any) => ({
                ...d,
                image_url: buildPublicUrl(d.image_url)
            }));
            setSpotlights(processed);
        } catch (err) {
            console.error('fetchSpotlights error:', err);
            toast.error('Error fetching spotlights');
        } finally {
            setSpotlightsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            fetchSpotlights();
        }
    }, [isMounted, fetchSpotlights]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Please enter student name');
            return;
        }
        if (!formData.date) {
            toast.error('Please select a date');
            return;
        }
        if (!formData.message.trim()) {
            toast.error('Please enter achievement message');
            return;
        }
        if (!imageFile && !imagePreview) {
            toast.error('Please select an image');
            return;
        }

        try {
            setLoading(true);
            let imagePath = '';

            // Upload image if new file selected
            if (imageFile) {
                const fileName = `${Date.now()}-${imageFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from(BUCKET)
                    .upload(fileName, imageFile);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    toast.error('Failed to upload image');
                    return;
                }
                imagePath = fileName;
            }

            // Insert spotlight with date
            const { error: insertError } = await supabase.from('awards').insert([
                {
                    name: formData.name,
                    message: formData.message,
                    award_type: formData.award_type,
                    is_show_on_home_page: formData.is_show_on_home_page,
                    image_url: imagePath,
                    date: formData.date, // Use the selected date
                    like_count: 0
                }
            ]);

            if (insertError) {
                console.error('Insert error:', insertError);
                toast.error('Failed to create spotlight');
                return;
            }

            toast.success('Spotlight created successfully!');
            setFormData({
                name: '',
                message: '',
                award_type: 'weekly',
                is_show_on_home_page: false,
                date: new Date().toISOString().split('T')[0]
            });
            setImageFile(null);
            setImagePreview(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            await fetchSpotlights();
        } catch (err) {
            console.error('Submit error:', err);
            toast.error('Error creating spotlight');
        } finally {
            setLoading(false);
        }
    };

    // Delete spotlight
    const handleDelete = async () => {
        if (!selectedForDelete) return;

        try {
            setDeleteLoading(true);

            // Delete image if exists
            const imagePath = getStoragePathFromPublicUrl(selectedForDelete.image_url);
            if (imagePath) {
                await supabase.storage.from(BUCKET).remove([imagePath]);
            }

            // Delete spotlight
            const { error } = await supabase
                .from('awards')
                .delete()
                .eq('id', selectedForDelete.id);

            if (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete spotlight');
                return;
            }

            toast.success('Spotlight deleted successfully!');
            setShowDeleteModal(false);
            setSelectedForDelete(null);
            await fetchSpotlights();
        } catch (err) {
            console.error('Delete error:', err);
            toast.error('Error deleting spotlight');
        } finally {
            setDeleteLoading(false);
        }
    };

    // ✨ HANDLE HOMEPAGE BUTTON CLICK - Check for GLOBAL conflicts (only ONE homepage badge across ALL types) ✨
    const handleHomepageClick = (spotlight: Spotlight) => {
        // If already on homepage, just show regular toggle modal to remove it
        if (spotlight.is_show_on_home_page) {
            setSelectedForHomepage(spotlight);
            setShowHomepageModal(true);
            return;
        }

        // ✨ Find if ANY card has homepage badge (not just same type) ✨
        const existingHomepageCard = spotlights.find((s) => s.is_show_on_home_page);

        if (existingHomepageCard) {
            // ✨ CONFLICT DETECTED - Another card ALREADY has homepage badge ✨
            console.log('⚠️ CONFLICT: Another card already on homepage');
            setConflictData({
                newCard: spotlight,
                existingCard: existingHomepageCard
            });
            setShowConflictModal(true);
        } else {
            // ✨ NO CONFLICT - Show regular modal to add ✨
            setSelectedForHomepage(spotlight);
            setShowHomepageModal(true);
        }
    };

    // ✨ HANDLE CONFLICT RESOLUTION - Replace existing card with new one ✨
    const handleReplaceHomepageCard = async () => {
        if (!conflictData.newCard || !conflictData.existingCard) return;

        try {
            setConflictLoading(true);

            // Remove homepage badge from existing card
            const { error: removeError } = await supabase
                .from('awards')
                .update({ is_show_on_home_page: false })
                .eq('id', conflictData.existingCard.id);

            if (removeError) throw removeError;

            // Add homepage badge to new card
            const { error: addError } = await supabase
                .from('awards')
                .update({ is_show_on_home_page: true })
                .eq('id', conflictData.newCard.id);

            if (addError) throw addError;

            toast.success(
                `✨ Homepage badge moved! ${conflictData.newCard.name} is now featured!`
            );
            setShowConflictModal(false);
            setConflictData({ newCard: null, existingCard: null });
            await fetchSpotlights();
        } catch (err) {
            console.error('Replace error:', err);
            toast.error('Error replacing homepage badge');
        } finally {
            setConflictLoading(false);
        }
    };

    // ✨ HANDLE CONFLICT CANCELLATION ✨
    const handleCancelConflict = () => {
        setShowConflictModal(false);
        setConflictData({ newCard: null, existingCard: null });
    };

    // Toggle homepage visibility
    const handleHomepageToggle = async () => {
        if (!selectedForHomepage) return;

        try {
            setHomepageLoading(true);

            const newValue = !selectedForHomepage.is_show_on_home_page;

            // If setting to true, remove homepage badge from ALL other spotlights first
            if (newValue) {
                const { error: updateError } = await supabase
                    .from('awards')
                    .update({ is_show_on_home_page: false })
                    .neq('id', selectedForHomepage.id);

                if (updateError) throw updateError;
            }

            // Update current spotlight
            const { error } = await supabase
                .from('awards')
                .update({ is_show_on_home_page: newValue })
                .eq('id', selectedForHomepage.id);

            if (error) {
                console.error('Update error:', error);
                toast.error('Failed to update spotlight');
                return;
            }

            toast.success(
                newValue ? '✨ Homepage badge added!' : '🚫 Homepage badge removed!'
            );
            setShowHomepageModal(false);
            setSelectedForHomepage(null);
            await fetchSpotlights();
        } catch (err) {
            console.error('Homepage toggle error:', err);
            toast.error('Error updating spotlight');
        } finally {
            setHomepageLoading(false);
        }
    };

    // Filter spotlights
    const filteredSpotlights =
        filterType === 'all'
            ? spotlights
            : spotlights.filter((a) => a.award_type === filterType);

    // Don't render until mounted on client
    if (!isMounted) {
        return <Loader isVisible={true} message="Loading Spotlight..." fullScreen={true} />;
    }

    if (spotlightsLoading || loading || homepageLoading) {
        return <Loader isVisible={true} message="Loading..." fullScreen={true} />;
    }

    const getTodayDate = (): string => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <div className={styles.staroftheweek}>
            <HeadingTitle text='Spotlight Dashboard' />
            <div className={styles.adminContainer}>
                {/* Create Spotlight Form */}
                <motion.div
                    className={styles.formSection}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2>✨ Create New Spotlight</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            {/* Image Upload */}
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label htmlFor="image">Student Photo *</label>
                                <div className={styles.imageUploadWrapper}>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        id="image"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={styles.fileInput}
                                    />
                                    <label htmlFor="image" className={styles.fileLabel}>
                                        {imagePreview ? (
                                            <div className={styles.imagePreviewContainer}>
                                                <Image
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    width={150}
                                                    height={150}
                                                    className={styles.previewImage}
                                                />
                                                <span>Click to change image</span>
                                            </div>
                                        ) : (
                                            <div className={styles.uploadPlaceholder}>
                                                <span>📷 Upload Image</span>
                                                <small>Max 5MB</small>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            {/* Student Name */}
                            <div className={styles.formGroup}>
                                <label htmlFor="name">Student Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Enter student name"
                                    disabled={loading}
                                />
                            </div>

                            {/* Spotlight Date */}
                            <div className={styles.formGroup}>
                                <label htmlFor="spotlightDate">Spotlight Date *</label>
                                <input
                                    type="date"
                                    id="spotlightDate"
                                    value={formData.date}
                                    onChange={(e) =>
                                        setFormData({ ...formData, date: e.target.value })
                                    }
                                    disabled={loading}
                                    className={styles.dateInput}
                                    max={getTodayDate()}
                                />
                            </div>

                            {/* Spotlight Type */}
                            <div className={styles.formGroup}>
                                <label htmlFor="award_type">Spotlight Type *</label>
                                <select
                                    id="award_type"
                                    value={formData.award_type}
                                    onChange={(e) =>
                                        setFormData({ ...formData, award_type: e.target.value as any })
                                    }
                                    className={styles.selectInput}
                                    disabled={loading}
                                >
                                    <option value="weekly">Star of the Week</option>
                                    <option value="monthly">Star of the Month</option>
                                    <option value="yearly">Star of the Year</option>
                                </select>
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            {/* Achievement Message */}
                            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                <label htmlFor="message">Achievement Message *</label>
                                <textarea
                                    id="message"
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({ ...formData, message: e.target.value })
                                    }
                                    placeholder="Describe why this student deserves the spotlight..."
                                    rows={4}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className={styles.formRow}>
                            {/* Homepage Checkbox */}
                            <div className={styles.formGroup}>
                                <label htmlFor="homepage" className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        id="homepage"
                                        checked={formData.is_show_on_home_page}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                is_show_on_home_page: e.target.checked
                                            })
                                        }
                                        disabled={loading}
                                    />
                                    <span>Show on Homepage</span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            className={styles.submitButton}
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className={styles.spinnerIcon} />
                                    Creating...
                                </>
                            ) : (
                                'Create Spotlight'
                            )}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Spotlights List Section */}
                <motion.div
                    className={styles.spotlightsSection}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className={styles.sectionHeader}>
                        <h2>📜 All Spotlight ({spotlights.length})</h2>
                    </div>

                    {/* Filter Buttons */}
                    <div className={styles.filterButtons}>
                        {(['all', 'weekly', 'monthly', 'yearly'] as const).map((type) => (
                            <motion.button
                                key={type}
                                type="button"
                                className={`${styles.filterButton} ${filterType === type ? styles.active : ''
                                    }`}
                                onClick={() => setFilterType(type)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {type === 'all'
                                    ? '🎯 All'
                                    : type === 'weekly'
                                        ? '⭐ Weekly'
                                        : type === 'monthly'
                                            ? '✨ Monthly'
                                            : '🏆 Yearly'}
                                <span className={styles.count}>
                                    ({type === 'all'
                                        ? spotlights.length
                                        : spotlights.filter((a) => a.award_type === type).length}
                                    )
                                </span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Spotlights Grid */}
                    {spotlightsLoading ? (
                        <Loader />
                    ) : filteredSpotlights.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>😴 No Spotlight found</p>
                        </div>
                    ) : (
                        <motion.div
                            className={styles.spotlightsGrid}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                        >
                            <AnimatePresence>
                                {filteredSpotlights.map((spotlight) => (
                                    <motion.div
                                        key={spotlight.id}
                                        className={styles.spotlightCard}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ y: -8 }}
                                    >
                                        {/* Badge for homepage */}
                                        {spotlight.is_show_on_home_page && (
                                            <motion.div
                                                className={styles.homePageBadge}
                                                animate={{ scale: [1, 1.05, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <FaHome /> Homepage
                                            </motion.div>
                                        )}

                                        {/* Image */}
                                        <div className={styles.cardImage}>
                                            <Image
                                                src={spotlight.image_url}
                                                alt={spotlight.name}
                                                width={280}
                                                height={220}
                                                className={styles.image}
                                                unoptimized
                                            />
                                        </div>

                                        {/* Card Content */}
                                        <div className={styles.cardContent}>
                                            <h3>{spotlight.name}</h3>
                                            <div className={styles.spotlightMeta}>
                                                <span className={styles.type}>
                                                    {spotlight.award_type === 'weekly'
                                                        ? '🌟 Weekly'
                                                        : spotlight.award_type === 'monthly'
                                                            ? '⭐ Monthly'
                                                            : '✨ Yearly'}
                                                </span>
                                                <span className={styles.likes}>
                                                    ❤️ {spotlight.like_count}
                                                </span>
                                            </div>
                                            <p className={styles.message}>{spotlight.message}</p>
                                            <p className={styles.date}>
                                                {new Date(spotlight.date).toLocaleDateString()}
                                            </p>
                                        </div>

                                        {/* Card Actions */}
                                        <div className={styles.cardActions}>
                                            <motion.button
                                                type="button"
                                                className={`${styles.actionBtn} ${styles.printBtn}`}
                                                onClick={() => {
                                                    setSelectedForPrint(spotlight);
                                                    setShowPrintModal(true);
                                                }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                title="Print certificate"
                                            >
                                                <FaPrint />
                                            </motion.button>

                                            <motion.button
                                                type="button"
                                                className={`${styles.actionBtn} ${styles.homepageBtn} ${spotlight.is_show_on_home_page ? styles.active : ''
                                                    }`}
                                                onClick={() => handleHomepageClick(spotlight)}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                title={
                                                    spotlight.is_show_on_home_page
                                                        ? 'Remove from homepage'
                                                        : 'Add to homepage'
                                                }
                                            >
                                                {spotlight.is_show_on_home_page ? (
                                                    <FaEye />
                                                ) : (
                                                    <FaEyeSlash />
                                                )}
                                            </motion.button>

                                            <motion.button
                                                type="button"
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                onClick={() => {
                                                    setSelectedForDelete(spotlight);
                                                    setShowDeleteModal(true);
                                                }}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                title="Delete spotlight"
                                            >
                                                <FaTrash />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </motion.div>
            </div>

            {/* Print Certificate Modal */}
            <AnimatePresence>
                {showPrintModal && (
                    <PrintCard
                        award={selectedForPrint}
                        isOpen={showPrintModal}
                        onClose={() => {
                            setShowPrintModal(false);
                            setSelectedForPrint(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && selectedForDelete && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <FaTrash className={styles.warningIcon} />
                                <h3>Delete Spotlight?</h3>
                            </div>
                            <p className={styles.modalBody}>
                                Are you sure you want to delete the spotlight for{' '}
                                <strong>{selectedForDelete.name}</strong>? This action cannot be
                                undone.
                            </p>
                            <div className={styles.modalActions}>
                                <motion.button
                                    type="button"
                                    className={`${styles.modalBtn} ${styles.cancelBtn}`}
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleteLoading}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className={`${styles.modalBtn} ${styles.confirmBtn}`}
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {deleteLoading ? (
                                        <>
                                            <FaSpinner className={styles.spinnerIcon} />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <FaTrash />
                                            Delete
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ✨ CONFLICT MODAL - ONLY ONE HOMEPAGE BADGE ALLOWED GLOBALLY ✨ */}
            <AnimatePresence>
                {showConflictModal && conflictData.newCard && conflictData.existingCard && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCancelConflict}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <FaExclamationTriangle className={styles.warningIcon} />
                                <h3>🎖️ Only One Homepage Badge!</h3>
                            </div>
                            <p className={styles.modalBody}>
                                <strong>{conflictData.existingCard.name}</strong> is currently featured on the homepage.
                            </p>
                            <p className={styles.modalBody}>
                                To feature <strong>{conflictData.newCard.name}</strong> instead, you must first remove the homepage badge from{' '}
                                <strong>{conflictData.existingCard.name}</strong>.
                            </p>

                            {/* Comparison Cards */}
                            <div className={styles.comparisonContainer}>
                                <div className={styles.comparisonCard}>
                                    <div className={styles.comparisonLabel}>Currently Featured</div>
                                    <Image
                                        src={conflictData.existingCard.image_url}
                                        alt={conflictData.existingCard.name}
                                        width={100}
                                        height={100}
                                        className={styles.comparisonImage}
                                        unoptimized
                                    />
                                    <div className={styles.comparisonName}>{conflictData.existingCard.name}</div>
                                    <div className={styles.comparisonType}>
                                        {conflictData.existingCard.award_type === 'weekly'
                                            ? '⭐ Weekly'
                                            : conflictData.existingCard.award_type === 'monthly'
                                                ? '✨ Monthly'
                                                : '🏆 Yearly'}
                                    </div>
                                </div>

                                <div className={styles.comparisonArrow}>↔️</div>

                                <div className={styles.comparisonCard}>
                                    <div className={styles.comparisonLabel}>Want to Feature</div>
                                    <Image
                                        src={conflictData.newCard.image_url}
                                        alt={conflictData.newCard.name}
                                        width={100}
                                        height={100}
                                        className={styles.comparisonImage}
                                        unoptimized
                                    />
                                    <div className={styles.comparisonName}>{conflictData.newCard.name}</div>
                                    <div className={styles.comparisonType}>
                                        {conflictData.newCard.award_type === 'weekly'
                                            ? '⭐ Weekly'
                                            : conflictData.newCard.award_type === 'monthly'
                                                ? '✨ Monthly'
                                                : '🏆 Yearly'}
                                    </div>
                                </div>
                            </div>

                            <div className={styles.infoBox}>
                                <p>💡 <strong>Tip:</strong> Click "Replace Badge" to automatically remove the badge from {conflictData.existingCard.name} and add it to {conflictData.newCard.name}.</p>
                            </div>

                            <div className={styles.modalActions}>
                                <motion.button
                                    type="button"
                                    className={`${styles.modalBtn} ${styles.cancelBtn}`}
                                    onClick={handleCancelConflict}
                                    disabled={conflictLoading}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className={`${styles.modalBtn} ${styles.confirmBtn}`}
                                    onClick={handleReplaceHomepageCard}
                                    disabled={conflictLoading}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {conflictLoading ? (
                                        <>
                                            <FaSpinner className={styles.spinnerIcon} />
                                            Replacing...
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck />
                                            Replace Badge
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Homepage Toggle Modal */}
            <AnimatePresence>
                {showHomepageModal && selectedForHomepage && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowHomepageModal(false)}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <FaHome className={styles.infoIcon} />
                                <h3>
                                    {selectedForHomepage.is_show_on_home_page
                                        ? 'Remove Homepage Badge'
                                        : 'Add Homepage Badge'}
                                </h3>
                            </div>
                            <p className={styles.modalBody}>
                                {selectedForHomepage.is_show_on_home_page ? (
                                    <>
                                        Remove the homepage badge from <strong>{selectedForHomepage.name}</strong>'s spotlight?
                                    </>
                                ) : (
                                    <>
                                        Add the homepage badge to <strong>{selectedForHomepage.name}</strong>'s spotlight?
                                    </>
                                )}
                            </p>
                            <div className={styles.modalActions}>
                                <motion.button
                                    type="button"
                                    className={`${styles.modalBtn} ${styles.cancelBtn}`}
                                    onClick={() => setShowHomepageModal(false)}
                                    disabled={homepageLoading}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className={`${styles.modalBtn} ${styles.confirmBtn}`}
                                    onClick={handleHomepageToggle}
                                    disabled={homepageLoading}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {homepageLoading ? (
                                        <>
                                            <FaSpinner className={styles.spinnerIcon} />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            {selectedForHomepage.is_show_on_home_page ? (
                                                <>
                                                    <FaTimes />
                                                    Remove
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheck />
                                                    Add
                                                </>
                                            )}
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Spotlight;
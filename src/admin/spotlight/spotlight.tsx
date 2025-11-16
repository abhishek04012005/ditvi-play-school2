'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FaTrash, FaHome, FaCheck, FaTimes, FaEye, FaEyeSlash, FaSpinner, FaPrint } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './spotlight.module.css';
import PrintCard from './printcard/printcard';
import HeadingTitle from '@/components/heading/headingtitle';

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
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        message: '',
        award_type: 'weekly',
        is_show_on_home_page: false
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

    // Print modal state
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedForPrint, setSelectedForPrint] = useState<Spotlight | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

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
        fetchSpotlights();
    }, [fetchSpotlights]);

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

            // Insert spotlight
            const { error: insertError } = await supabase.from('awards').insert([
                {
                    name: formData.name,
                    message: formData.message,
                    award_type: formData.award_type,
                    is_show_on_home_page: formData.is_show_on_home_page,
                    image_url: imagePath,
                    date: new Date().toISOString().split('T')[0],
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
                is_show_on_home_page: false
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

    // Toggle homepage visibility
    const handleHomepageToggle = async () => {
        if (!selectedForHomepage) return;

        try {
            setHomepageLoading(true);

            const newValue = !selectedForHomepage.is_show_on_home_page;

            // If setting to true, remove from other spotlights first
            if (newValue) {
                const { error: updateError } = await supabase
                    .from('awards')
                    .update({ is_show_on_home_page: false })
                    .eq('award_type', selectedForHomepage.award_type)
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
                newValue ? 'Spotlight added to homepage!' : 'Spotlight removed from homepage!'
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

    return (
        <div className={styles.staroftheweek}>
            <HeadingTitle text='Spotlight Dashboard' />
            <div className={styles.adminContainer}>
                {/* Header */}

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
                        <div className={styles.loadingContainer}>
                            <FaSpinner className={styles.spinnerLarge} />
                            <p>Loading Spotlight...</p>
                        </div>
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
                                            <div className={styles.homePageBadge}>
                                                <FaHome /> Homepage
                                            </div>
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
                                                onClick={() => {
                                                    setSelectedForHomepage(spotlight);
                                                    setShowHomepageModal(true);
                                                }}
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
                                        ? 'Remove from Homepage'
                                        : 'Add to Homepage'}
                                </h3>
                            </div>
                            <p className={styles.modalBody}>
                                {selectedForHomepage.is_show_on_home_page ? (
                                    <>
                                        Remove <strong>{selectedForHomepage.name}</strong>'s spotlight
                                        from the homepage?
                                    </>
                                ) : (
                                    <>
                                        Add <strong>{selectedForHomepage.name}</strong>'s spotlight to
                                        the homepage? This will remove any other{' '}
                                        {selectedForHomepage.award_type} spotlight from homepage.
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
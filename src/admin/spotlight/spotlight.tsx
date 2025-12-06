'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import {
    FaTrash,
    FaHome,
    FaCheck,
    FaTimes,
    FaEye,
    FaEyeSlash,
    FaSpinner,
    FaPrint,
    FaExclamationTriangle,
    FaPlus,
    FaSearch,
    FaSort,
    FaSortUp,
    FaSortDown,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa';
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
    award_type: string;
    message: string;
    date: string;
    is_show_on_home_page: boolean;
    like_count: number;
    image_url: string;
    created_date: string;
}

interface CustomSpotlightType {
    id: string;
    name: string;
    emoji: string;
    color: string;
    description: string;
    created_date: string;
    isDefault?: boolean; // Mark if it's a built-in default type
}

interface StatusCard {
    label: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    type: string;
    id: string;
}

type SortField = 'created_date' | 'name' | 'award_type' | 'date';
type SortOrder = 'asc' | 'desc';
type ItemsPerPage = 20 | 50 | 100;

const BUCKET = 'star-of-week-images';

// Default built-in spotlight types
const DEFAULT_SPOTLIGHT_TYPES: CustomSpotlightType[] = [
    {
        id: 'weekly',
        name: 'Star of the Week',
        emoji: '⭐',
        color: '#3b82f6',
        description: 'Weekly excellence',
        created_date: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'monthly',
        name: 'Star of the Month',
        emoji: '✨',
        color: '#f59e0b',
        description: 'Monthly achievement',
        created_date: new Date().toISOString(),
        isDefault: true
    },
    {
        id: 'yearly',
        name: 'Star of the Year',
        emoji: '🏆',
        color: '#10b981',
        description: 'Yearly accomplishment',
        created_date: new Date().toISOString(),
        isDefault: true
    }
];

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
        date: new Date().toISOString().split('T')[0]
    });

    // Spotlight list management
    const [spotlights, setSpotlights] = useState<Spotlight[]>([]);
    const [spotlightsLoading, setSpotlightsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField>('created_date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Custom spotlight types management
    const [customTypes, setCustomTypes] = useState<CustomSpotlightType[]>([]);
    const [typesLoading, setTypesLoading] = useState(true);
    const [showTypesModal, setShowTypesModal] = useState(false);
    const [newType, setNewType] = useState({ name: '', emoji: '⭐', color: '#6a4c93', description: '' });
    const [typeFormLoading, setTypeFormLoading] = useState(false);
    const [showDeleteTypeModal, setShowDeleteTypeModal] = useState(false);
    const [selectedTypeToDelete, setSelectedTypeToDelete] = useState<CustomSpotlightType | null>(null);
    const [typeDeleteLoading, setTypeDeleteLoading] = useState(false);

    // ✨ PAGINATION STATE
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(20);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedForDelete, setSelectedForDelete] = useState<Spotlight | null>(null);
    const [showHomepageModal, setShowHomepageModal] = useState(false);
    const [selectedForHomepage, setSelectedForHomepage] = useState<Spotlight | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [homepageLoading, setHomepageLoading] = useState(false);

    // ✨ CONFLICT MODAL STATE
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [conflictData, setConflictData] = useState<{
        newCard: Spotlight | null;
        existingCard: Spotlight | null;
    }>({ newCard: null, existingCard: null });
    const [conflictLoading, setConflictLoading] = useState(false);

    // Print modal state
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedForPrint, setSelectedForPrint] = useState<Spotlight | null>(null);
    const [pageLoading, setPageLoading] = useState(true);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Set mounted state
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Fetch custom spotlight types and combine with defaults
    const fetchCustomTypes = useCallback(async () => {
        try {
            setTypesLoading(true);
            let customTypesData: CustomSpotlightType[] = [];

            // Try to fetch custom types from database
            const { data, error } = await supabase
                .from('spotlight_types')
                .select('*')
                .order('created_date', { ascending: true });

            if (error) {
                if ('code' in error && error.code !== 'PGRST116') {
                    // Only log non-table-not-found errors
                    console.warn('Fetch custom types error:', error.message || String(error));
                }
                customTypesData = [];
            } else {
                customTypesData = data || [];
            }

            // Combine defaults with custom types
            const allTypes = [...DEFAULT_SPOTLIGHT_TYPES, ...customTypesData];
            setCustomTypes(allTypes);
        } catch (err) {
            console.warn('fetchCustomTypes error:', err instanceof Error ? err.message : String(err));
            setCustomTypes(DEFAULT_SPOTLIGHT_TYPES);
        } finally {
            setTypesLoading(false);
        }
    }, []);

    // Fetch all spotlights
    const fetchSpotlights = useCallback(async () => {
        try {
            setSpotlightsLoading(true);
            const { data, error } = await supabase
                .from('awards')
                .select('id, name, message, award_type, is_show_on_home_page, image_url, date, like_count, created_date')
                .order('created_date', { ascending: false });

            if (error) {
                const errorMsg = error.message || String(error);
                console.warn('Fetch spotlights error:', errorMsg);
                toast.error('Failed to fetch spotlights: ' + errorMsg);
                setSpotlights([]);
                return;
            }

            const processed: Spotlight[] = (data || []).map((d: any) => ({
                ...d,
                image_url: buildPublicUrl(d.image_url)
            }));
            setSpotlights(processed);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.warn('fetchSpotlights error:', errorMsg);
            toast.error('Error fetching spotlights: ' + errorMsg);
        } finally {
            setSpotlightsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            const initializePage = async () => {
                setPageLoading(true);
                await Promise.all([fetchCustomTypes(), fetchSpotlights()]);
                setPageLoading(false);
            };
            initializePage();
        }
    }, [isMounted, fetchSpotlights, fetchCustomTypes]);

    // ✨ RESET TO PAGE 1 WHEN FILTER/SEARCH CHANGES
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType]);

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

    const resetForm = () => {
        setFormData({
            name: '',
            message: '',
            award_type: customTypes.length > 0 ? customTypes[0].id : 'weekly',
            is_show_on_home_page: false,
            date: new Date().toISOString().split('T')[0]
        });
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Add custom spotlight type
    const handleAddType = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newType.name.trim()) {
            toast.error('Please enter spotlight type name');
            return;
        }

        try {
            setTypeFormLoading(true);
            const { data, error } = await supabase
                .from('spotlight_types')
                .insert([{
                    name: newType.name,
                    emoji: newType.emoji,
                    color: newType.color,
                    description: newType.description
                }])
                .select();

            if (error) {
                console.warn('Insert type error:', error.message || String(error));
                toast.error('Failed to create spotlight type');
                return;
            }

            toast.success('Spotlight type created successfully!');
            setNewType({ name: '', emoji: '⭐', color: '#6a4c93', description: '' });
            await fetchCustomTypes();
        } catch (err) {
            console.warn('Add type error:', err instanceof Error ? err.message : String(err));
            toast.error('Error creating spotlight type');
        } finally {
            setTypeFormLoading(false);
        }
    };

    // Delete custom spotlight type
    const handleDeleteType = async () => {
        if (!selectedTypeToDelete) return;

        // Prevent deletion of default types
        if (selectedTypeToDelete.isDefault) {
            toast.error('Cannot delete built-in spotlight types');
            setShowDeleteTypeModal(false);
            return;
        }

        // Check if type is in use
        const isInUse = spotlights.some(s => s.award_type === selectedTypeToDelete.id);
        if (isInUse) {
            toast.error('Cannot delete type that has associated spotlights');
            setShowDeleteTypeModal(false);
            return;
        }

        try {
            setTypeDeleteLoading(true);
            const { error } = await supabase
                .from('spotlight_types')
                .delete()
                .eq('id', selectedTypeToDelete.id);

            if (error) {
                console.warn('Delete type error:', error.message || String(error));
                toast.error('Failed to delete spotlight type');
                return;
            }

            toast.success('Spotlight type deleted successfully!');
            setShowDeleteTypeModal(false);
            setSelectedTypeToDelete(null);
            await fetchCustomTypes();
        } catch (err) {
            console.warn('Delete type error:', err instanceof Error ? err.message : String(err));
            toast.error('Error deleting spotlight type');
        } finally {
            setTypeDeleteLoading(false);
        }
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
        if (!formData.award_type) {
            toast.error('Please select a spotlight type');
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
                    const errorMsg = uploadError.message || String(uploadError);
                    console.warn('Upload error:', errorMsg);
                    toast.error('Failed to upload image: ' + errorMsg);
                    return;
                }
                imagePath = fileName;
            }

            // Validate award_type exists in customTypes
            const selectedType = customTypes.find(t => t.id === formData.award_type);
            if (!selectedType) {
                toast.error('Selected spotlight type is invalid');
                console.warn('Invalid award_type:', formData.award_type, 'Available types:', customTypes.map(t => t.id));
                return;
            }

            // Insert spotlight with date
            const { error: insertError } = await supabase.from('awards').insert([
                {
                    name: formData.name,
                    message: formData.message,
                    award_type: formData.award_type,
                    is_show_on_home_page: formData.is_show_on_home_page,
                    image_url: imagePath,
                    date: formData.date,
                    like_count: 0,
                    created_date: new Date().toISOString()
                }
            ]);

            if (insertError) {
                const errorMsg = insertError.message || insertError.details || String(insertError);
                console.warn('Insert error:', errorMsg);
                console.warn('Insert data:', {
                    award_type: formData.award_type,
                    availableTypes: customTypes.map(t => ({ id: t.id, name: t.name }))
                });
                toast.error('Failed to create spotlight: ' + errorMsg);
                return;
            }

            toast.success('Spotlight created successfully!');
            resetForm();
            setShowCreateModal(false);
            await fetchSpotlights();
        } catch (err) {
            console.warn('Submit error:', err instanceof Error ? err.message : String(err));
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

    // ✨ HANDLE HOMEPAGE BUTTON CLICK
    const handleHomepageClick = (spotlight: Spotlight) => {
        if (spotlight.is_show_on_home_page) {
            setSelectedForHomepage(spotlight);
            setShowHomepageModal(true);
            return;
        }

        const existingHomepageCard = spotlights.find((s) => s.is_show_on_home_page);

        if (existingHomepageCard) {
            console.log('⚠️ CONFLICT: Another card already on homepage');
            setConflictData({
                newCard: spotlight,
                existingCard: existingHomepageCard
            });
            setShowConflictModal(true);
        } else {
            setSelectedForHomepage(spotlight);
            setShowHomepageModal(true);
        }
    };

    // ✨ HANDLE CONFLICT RESOLUTION
    const handleReplaceHomepageCard = async () => {
        if (!conflictData.newCard || !conflictData.existingCard) return;

        try {
            setConflictLoading(true);

            const { error: removeError } = await supabase
                .from('awards')
                .update({ is_show_on_home_page: false })
                .eq('id', conflictData.existingCard.id);

            if (removeError) throw removeError;

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

            if (newValue) {
                const { error: updateError } = await supabase
                    .from('awards')
                    .update({ is_show_on_home_page: false })
                    .neq('id', selectedForHomepage.id);

                if (updateError) throw updateError;
            }

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

    // ✨ SORTING LOGIC
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return <FaSort />;
        return sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />;
    };

    // ✨ FILTERED AND SORTED DATA
    const sortedAndFilteredSpotlights = spotlights
        .filter(spotlight => {
            const name = spotlight.name.toLowerCase();
            const message = spotlight.message.toLowerCase();

            const matchesSearch =
                name.includes(searchTerm.toLowerCase()) ||
                message.includes(searchTerm.toLowerCase());

            const matchesFilter = filterType === 'all' || spotlight.award_type === filterType;

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            let aVal: any, bVal: any;

            if (sortField === 'name') {
                aVal = a.name;
                bVal = b.name;
            } else if (sortField === 'award_type') {
                aVal = a.award_type;
                bVal = b.award_type;
            } else if (sortField === 'date') {
                aVal = new Date(a.date).getTime();
                bVal = new Date(b.date).getTime();
            } else {
                aVal = new Date(a.created_date).getTime();
                bVal = new Date(b.created_date).getTime();
            }

            if (typeof aVal === 'string') {
                return sortOrder === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });

    // ✨ PAGINATION LOGIC
    const totalPages = Math.ceil(sortedAndFilteredSpotlights.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSpotlights = sortedAndFilteredSpotlights.slice(startIndex, endIndex);

    // Status cards data
    const statusCounts = {
        total: spotlights.length,
        ...customTypes.reduce((acc, type) => (
            { ...acc, [type.id]: spotlights.filter((s) => s.award_type === type.id).length }
        ), {})
    };

    const statusCards: StatusCard[] = [
        {
            label: 'Total Spotlights',
            count: statusCounts.total,
            icon: <FaHome />,
            color: '#6a4c93',
            bgColor: '#f3e8ff',
            type: 'total',
            id: 'total',
        },
        ...customTypes.map(type => ({
            label: `${type.emoji} ${type.name}`,
            count: (statusCounts as any)[type.id] || 0,
            icon: <span>{type.emoji}</span>,
            color: type.color,
            bgColor: `${type.color}15`,
            type: type.id,
            id: type.id,
        }))
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    };

    // ✨ HANDLE ITEMS PER PAGE CHANGE
    const handleItemsPerPageChange = (value: ItemsPerPage) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    // ✨ HANDLE PAGE CHANGE
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const tableElement = document.querySelector(`.${styles.tableWrapper}`);
            if (tableElement) {
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // Don't render until mounted on client
    if (!isMounted) {
        return <Loader isVisible={true} message="Loading Spotlight..." fullScreen={true} />;
    }

    if (pageLoading) {
        return <Loader isVisible={true} message="Loading..." fullScreen={true} />;
    }

    const getTodayDate = (): string => {
        return new Date().toISOString().split('T')[0];
    };

    return (
        <div className={styles.staroftheweek}>
            <HeadingTitle text='Spotlight Dashboard' />

            {/* ✨ STATUS CARDS ✨ */}
            <motion.div
                className={styles.statusCardsSection}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {statusCards.map((card) => (
                    <motion.div key={card.id} variants={itemVariants}>
                        <StatusCardComponent
                            card={card}
                            filter={filterType}
                            setFilter={setFilterType}
                        />
                    </motion.div>
                ))}
            </motion.div>

            <div className={styles.adminContainer}>
                {/* Dashboard Section */}
                <div className={styles.dashboard}>
                    <div className={styles.header}>
                        <div className={styles.headerLeft}>
                            <h2>📊 Spotlights Management</h2>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <motion.button
                                className={styles.createBtn}
                                onClick={() => setShowCreateModal(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaPlus /> Create Spotlight
                            </motion.button>
                        </div>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className={styles.controls}>
                        <div className={styles.searchBar}>
                            <FaSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by name or message..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="all">All Types</option>
                            {customTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.emoji} {type.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Photo</th>
                                    <th onClick={() => handleSort('name')}>
                                        Student Name {getSortIcon('name')}
                                    </th>
                                    <th onClick={() => handleSort('date')}>
                                        Spotlight Date {getSortIcon('date')}
                                    </th>
                                    <th onClick={() => handleSort('award_type')}>
                                        Type {getSortIcon('award_type')}
                                    </th>
                                    <th>Message</th>
                                    <th>Likes</th>
                                    <th>Homepage</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {spotlightsLoading ? (
                                    <tr>
                                        <td colSpan={8} className={styles.loading}>
                                            <FaSpinner className={styles.loadingIcon} /> Loading spotlights...
                                        </td>
                                    </tr>
                                ) : sortedAndFilteredSpotlights.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className={styles.noResults}>
                                            No spotlights found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedSpotlights.map((spotlight) => (
                                        <motion.tr
                                            key={spotlight.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td>
                                                <div className={styles.photoCell}>
                                                    <Image
                                                        src={spotlight.image_url}
                                                        alt={spotlight.name}
                                                        width={50}
                                                        height={50}
                                                        className={styles.photo}
                                                        unoptimized
                                                    />
                                                </div>
                                            </td>
                                            <td>
                                                <span className={styles.studentName}>{spotlight.name}</span>
                                            </td>
                                            <td>
                                                {new Date(spotlight.date).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td>
                                                {(() => {
                                                    const type = customTypes.find(t => t.id === spotlight.award_type);
                                                    return (
                                                        <span className={styles.badge} data-type={spotlight.award_type} style={{ color: type?.color, borderColor: type?.color }}>
                                                            {type ? `${type.emoji} ${type.name}` : spotlight.award_type}
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td>
                                                <span className={styles.message}>
                                                    {spotlight.message.substring(0, 50)}...
                                                </span>
                                            </td>
                                            <td>
                                                <span className={styles.likes}>❤️ {spotlight.like_count}</span>
                                            </td>
                                            <td>
                                                <motion.button
                                                    type="button"
                                                    className={`${styles.homepageToggleBtn} ${spotlight.is_show_on_home_page ? styles.active : ''
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
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
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
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ✨ PAGINATION SECTION ✨ */}
                    {sortedAndFilteredSpotlights.length > 0 && (
                        <div className={styles.paginationSection}>
                            <div className={styles.paginationInfo}>
                                <p className={styles.paginationText}>
                                    Showing <strong>{startIndex + 1}</strong> to{' '}
                                    <strong>{Math.min(endIndex, sortedAndFilteredSpotlights.length)}</strong> of{' '}
                                    <strong>{sortedAndFilteredSpotlights.length}</strong> spotlights
                                </p>
                            </div>

                            <div className={styles.paginationControls}>
                                {/* Items Per Page Selector */}
                                <div className={styles.itemsPerPageSelector}>
                                    <label htmlFor="itemsPerPage">Items per page:</label>
                                    <select
                                        id="itemsPerPage"
                                        value={itemsPerPage}
                                        onChange={(e) =>
                                            handleItemsPerPageChange(Number(e.target.value) as ItemsPerPage)
                                        }
                                        className={styles.itemsPerPageSelect}
                                    >
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>

                                {/* Pagination Buttons */}
                                <div className={styles.paginationButtons}>
                                    <motion.button
                                        className={styles.paginationBtn}
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                                        whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                                        title="Previous page"
                                    >
                                        <FaChevronLeft /> Previous
                                    </motion.button>

                                    <div className={styles.pageNumbers}>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            const showPage =
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1);

                                            if (!showPage) {
                                                if (page === currentPage - 2 || page === currentPage + 2) {
                                                    return (
                                                        <span key={`ellipsis-${page}`} className={styles.ellipsis}>
                                                            ...
                                                        </span>
                                                    );
                                                }
                                                return null;
                                            }

                                            return (
                                                <motion.button
                                                    key={page}
                                                    className={`${styles.pageBtn} ${page === currentPage ? styles.active : ''
                                                        }`}
                                                    onClick={() => handlePageChange(page)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    {page}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    <motion.button
                                        className={styles.paginationBtn}
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                                        whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                                        title="Next page"
                                    >
                                        Next <FaChevronRight />
                                    </motion.button>
                                </div>

                                {/* Page Info */}
                                <div className={styles.pageInfo}>
                                    <p>
                                        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ✨ CREATE SPOTLIGHT MODAL ✨ */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            className={styles.createModal}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.createModalHeader}>
                                <div>
                                    <h2>✨ Create New Spotlight</h2>
                                    <p>Add a new student achievement to the spotlight</p>
                                </div>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={loading}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Manage Custom Types Button */}
                            <div style={{ padding: '0 2rem', paddingTop: '1rem', borderBottom: '1px solid #e5e5e5', paddingBottom: '1rem' }}>
                                <motion.button
                                    type="button"
                                    className={styles.createBtn}
                                    onClick={() => setShowTypesModal(true)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Manage custom spotlight types"
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    ⚙️ Manage Spotlight Types
                                </motion.button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.createForm}>
                                <div className={styles.modalContent}>
                                    {/* Image Upload */}
                                    <div className={styles.formGroup}>
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

                                    {/* Form Grid */}
                                    <div className={styles.formGrid}>
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
                                            <label htmlFor="award_type">
                                                Spotlight Type * 
                                                <span style={{ fontSize: '0.75rem', color: '#666', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                                                    ({customTypes.length} available)
                                                </span>
                                            </label>
                                            <select
                                                id="award_type"
                                                value={formData.award_type}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, award_type: e.target.value })
                                                }
                                                className={styles.selectInput}
                                                disabled={loading || customTypes.length === 0}
                                                style={{
                                                    borderColor: customTypes.find(t => t.id === formData.award_type)?.color || '#e5e5e5',
                                                    borderWidth: '2px'
                                                }}
                                            >
                                                <option value="">-- Select a spotlight type --</option>
                                                {customTypes.map(type => (
                                                    <option key={type.id} value={type.id}>
                                                        {type.emoji} {type.name}
                                                        {type.isDefault ? ' (Built-in)' : ' (Custom)'}
                                                    </option>
                                                ))}
                                            </select>
                                            {formData.award_type && (
                                                <div style={{
                                                    marginTop: '0.75rem',
                                                    padding: '0.75rem 1rem',
                                                    borderRadius: '8px',
                                                    backgroundColor: `${customTypes.find(t => t.id === formData.award_type)?.color}15`,
                                                    border: `2px solid ${customTypes.find(t => t.id === formData.award_type)?.color}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}>
                                                    <span style={{ fontSize: '1.5rem' }}>
                                                        {customTypes.find(t => t.id === formData.award_type)?.emoji}
                                                    </span>
                                                    <div>
                                                        <div style={{ fontWeight: '700', color: customTypes.find(t => t.id === formData.award_type)?.color }}>
                                                            {customTypes.find(t => t.id === formData.award_type)?.name}
                                                        </div>
                                                        {customTypes.find(t => t.id === formData.award_type)?.description && (
                                                            <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                                                {customTypes.find(t => t.id === formData.award_type)?.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Achievement Message */}
                                    <div className={styles.formGroup}>
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

                                {/* Modal Actions */}
                                <div className={styles.createModalFooter}>
                                    <motion.button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        disabled={loading}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={loading}
                                        whileHover={{ scale: loading ? 1 : 1.02 }}
                                        whileTap={{ scale: loading ? 1 : 0.98 }}
                                    >
                                        {loading ? (
                                           <>
                                           Creating <FaSpinner className={styles.spinnerIcon} />
                                           </>
                                        ) : (
                                            <>
                                                <FaCheck /> Create Spotlight
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Print Certificate Modal */}
            <AnimatePresence>
                {showPrintModal && selectedForPrint && (
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

            {/* ✨ CONFLICT MODAL ✨ */}
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

            {/* ✨ MANAGE CUSTOM SPOTLIGHT TYPES MODAL ✨ */}
            <AnimatePresence>
                {showTypesModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTypesModal(false)}
                    >
                        <motion.div
                            className={styles.createModal}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.createModalHeader}>
                                <div>
                                    <h2>⚙️ Manage Spotlight Types</h2>
                                    <p>Create and manage custom spotlight types like "Best Reader", etc.</p>
                                </div>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setShowTypesModal(false)}
                                    disabled={typeFormLoading}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            <div className={styles.modalContent}>
                                {/* Add New Type Form */}
                                <form onSubmit={handleAddType}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="typeName">Type Name *</label>
                                        <input
                                            type="text"
                                            id="typeName"
                                            value={newType.name}
                                            onChange={(e) =>
                                                setNewType({ ...newType, name: e.target.value })
                                            }
                                            placeholder="e.g., Best Reader, Top Performer"
                                            disabled={typeFormLoading}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="typeEmoji">Emoji *</label>
                                        <input
                                            type="text"
                                            id="typeEmoji"
                                            value={newType.emoji}
                                            onChange={(e) =>
                                                setNewType({ ...newType, emoji: e.target.value.substring(0, 2) })
                                            }
                                            placeholder="🎓"
                                            maxLength={2}
                                            disabled={typeFormLoading}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="typeColor">Color *</label>
                                        <input
                                            type="color"
                                            id="typeColor"
                                            value={newType.color}
                                            onChange={(e) =>
                                                setNewType({ ...newType, color: e.target.value })
                                            }
                                            disabled={typeFormLoading}
                                            style={{ height: '45px', cursor: 'pointer' }}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="typeDescription">Description</label>
                                        <input
                                            type="text"
                                            id="typeDescription"
                                            value={newType.description}
                                            onChange={(e) =>
                                                setNewType({ ...newType, description: e.target.value })
                                            }
                                            placeholder="Brief description (optional)"
                                            disabled={typeFormLoading}
                                        />
                                    </div>

                                    <motion.button
                                        type="submit"
                                        className={styles.submitButton}
                                        disabled={typeFormLoading}
                                        whileHover={{ scale: typeFormLoading ? 1 : 1.02 }}
                                        whileTap={{ scale: typeFormLoading ? 1 : 0.98 }}
                                    >
                                        {typeFormLoading ? (
                                            <>
                                                <FaSpinner className={styles.spinnerIcon} />
                                                Adding...
                                            </>
                                        ) : (
                                            <>
                                                <FaPlus /> Add Type
                                            </>
                                        )}
                                    </motion.button>
                                </form>

                                {/* Existing Types List */}
                                <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e5e5e5' }}>
                                    <h3 style={{ marginBottom: '1rem', color: '#6a4c93' }}>📋 Existing Types</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {customTypes.map(type => (
                                            <div
                                                key={type.id}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    padding: '1rem',
                                                    borderRadius: '10px',
                                                    backgroundColor: `${type.color}10`,
                                                    border: `2px solid ${type.color}`,
                                                }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>
                                                        {type.emoji} {type.name}
                                                    </div>
                                                    {type.description && (
                                                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                                            {type.description}
                                                        </div>
                                                    )}
                                                </div>
                                                <motion.button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!type.isDefault) {
                                                            setSelectedTypeToDelete(type);
                                                            setShowDeleteTypeModal(true);
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        backgroundColor: type.isDefault ? '#ccc' : '#ef4444',
                                                        color: type.isDefault ? '#666' : 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: type.isDefault ? 'not-allowed' : 'pointer',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        opacity: type.isDefault ? 0.6 : 1,
                                                    }}
                                                    whileHover={{ scale: type.isDefault ? 1 : 1.05 }}
                                                    whileTap={{ scale: type.isDefault ? 1 : 0.95 }}
                                                    title={type.isDefault ? 'Built-in types cannot be deleted' : 'Delete this custom type'}
                                                >
                                                    {type.isDefault ? '🔒 Built-in' : <>
                                                        <FaTrash /> Delete
                                                    </>}
                                                </motion.button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Type Confirmation Modal */}
            <AnimatePresence>
                {showDeleteTypeModal && selectedTypeToDelete && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDeleteTypeModal(false)}
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
                                <h3>Delete Spotlight Type?</h3>
                            </div>
                            <p className={styles.modalBody}>
                                Are you sure you want to delete <strong>{selectedTypeToDelete.name}</strong>? This action cannot be undone.
                            </p>
                            <div className={styles.modalActions}>
                                <motion.button
                                    type="button"
                                    className={`${styles.modalBtn} ${styles.cancelBtn}`}
                                    onClick={() => setShowDeleteTypeModal(false)}
                                    disabled={typeDeleteLoading}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className={`${styles.modalBtn} ${styles.confirmBtn}`}
                                    onClick={handleDeleteType}
                                    disabled={typeDeleteLoading}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {typeDeleteLoading ? (
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
        </div>
    );
};

const StatusCardComponent = ({
    card,
    filter,
    setFilter,
}: {
    card: StatusCard;
    filter: string;
    setFilter: (filter: any) => void;
}) => {
    return (
        <motion.div
            className={`${styles.statusCard}`}
            whileHover={{ translateY: -6, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
            onClick={() => setFilter(card.type === 'total' ? 'all' : card.type)}
            style={{ cursor: 'pointer' }}
        >
            <div
                className={styles.statusCardBg}
                style={{ backgroundColor: card.bgColor }}
            ></div>
            <div className={styles.statusCardContent}>
                <div className={styles.statusCardHeader}>
                    <div
                        className={styles.statusCardIcon}
                        style={{ color: card.color, backgroundColor: card.bgColor }}
                    >
                        {card.icon}
                    </div>
                    {card.type !== 'total' && (
                        <div
                            className={styles.statusCardDot}
                            style={{ backgroundColor: card.color }}
                        ></div>
                    )}
                </div>
                <div className={styles.statusCardBody}>
                    <motion.div
                        className={styles.statusCardCount}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
                        style={{ color: card.color }}
                    >
                        {card.count}
                    </motion.div>
                    <p className={styles.statusCardLabel}>{card.label}</p>
                </div>
            </div>
        </motion.div>
    );
};

export default Spotlight;
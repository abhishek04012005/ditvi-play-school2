"use client";
import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgress } from '@mui/material';
import {
    SearchOutlined,
    SortOutlined,
    ArrowUpward,
    ArrowDownward,
    CheckCircleOutlined,
    PersonOutlined,
    NoteOutlined,
    CloseOutlined,
    CheckOutlined,
    AccessTimeOutlined,
    DescriptionOutlined,
    VisibilityOutlined,
    DownloadOutlined,
    PhoneOutlined,
    DeleteOutlined,
    ChevronLeft,
    ChevronRight,
    EditOutlined,
    WhatsApp,
    HistoryOutlined,
    AddOutlined,
    DashboardOutlined,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import { schoolDetails } from '@/json/schooldetails';
import toast from 'react-hot-toast';
import styles from './admission.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import Loader from '@/custom/loader/loader';
import { DownloadModal } from '../download/DownloadData';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AdmissionPDFTemplate from '@/components/admissionpdftemplate/admissionpdftemplate';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface NoteEntry {
    text: string;
    timestamp: string;
    id: string;
    userName?: string;
}

interface Admission {
    admission_number: ReactNode;
    id: string;
    child_first_name?: string;
    childFirstName?: string;
    child_name?: string;
    child_dob: string;
    dateOfBirth?: string;
    child_gender: string;
    gender?: string;
    category?: string;
    child_place_of_birth: string;
    placeOfBirth?: string;
    child_blood_group?: string;
    father_name?: string;
    mother_name?: string;
    parentFirstName?: string;
    parentLastName?: string;
    parent_first_name?: string;
    parent_last_name?: string;
    parent_address?: string;
    parent_mobile_number?: string;
    parentMobile?: string;
    parent_email?: string;
    parentEmail?: string;
    program_name?: string;
    program?: string;
    previous_school?: string;
    previousSchool?: string;
    admission_status: 'In Review' | 'Reviewed' | 'Interview Scheduled' | 'Confirmed' | 'Rejected' | 'Under Correction';
    admission_source?: 'enquiry' | 'social_media' | 'web' | 'offline';
    remark?: string;
    notes?: NoteEntry[] | null;
    created_at: string;
    photo_url?: string | null;
    birth_certificate_url?: string | null;
    aadhar_card_url?: string | null;
    parent_id_proof_url?: string | null;
}

interface StatusCard {
    label: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    status: 'In Review' | 'Reviewed' | 'Interview Scheduled' | 'Confirmed' | 'Rejected' | 'Under Correction';
    id: string;
}

type SortField = 'created_at' | 'child_name' | 'admission_status' | 'program_name';
type SortOrder = 'asc' | 'desc';
type ItemsPerPage = 20 | 50 | 100;



const getGoogleDriveURL = (url: string, type: 'image' | 'pdf' | 'document') => {
    if (!url) return url;

    let fileId = '';

    if (url.includes('id=')) {
        fileId = url.split('id=')[1]?.split('&')[0];
    } else if (url.includes('/d/')) {
        fileId = url.split('/d/')[1]?.split('/')[0];
    } else if (url.includes('drive.google.com')) {
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match) fileId = match[1];
    }

    if (!fileId) return url;

    if (type === 'image') {
        return `/api/proxy-drive-file?id=${fileId}&type=view`;
    } else if (type === 'pdf') {
        return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return `https://drive.google.com/uc?export=download&id=${fileId}`;
};

const getChildName = (admission: Admission): string => {
    return admission.child_first_name || admission.childFirstName || admission.child_name || 'N/A';
};

const getFatherName = (admission: Admission): string => {
    return admission.father_name || 'N/A';
};

const getMotherName = (admission: Admission): string => {
    return admission.mother_name || 'N/A';
};

const getParentEmail = (admission: Admission): string => {
    return admission.parent_email || admission.parentEmail || 'N/A';
};

const getParentMobile = (admission: Admission): string => {
    return admission.parent_mobile_number || admission.parentMobile || 'N/A';
};

const getProgram = (admission: Admission): string => {
    return admission.program_name || admission.program || 'N/A';
};

const getStatus = (admission: Admission): Admission['admission_status'] => {
    return admission.admission_status || 'In Review';
};

const getAdmissionSource = (admission: Admission): string => {
    const sourceMap: { [key: string]: string } = {
        'enquiry': '📞 Enquiry',
        'social_media': '📱 Social Media',
        'web': '🌐 Web',
        'offline': '🏢 Offline'
    };
    const source = admission.admission_source || 'enquiry';
    return sourceMap[source] || 'Unknown';
};

export default function AdminAdmission() {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'In Review' | 'Reviewed' | 'Interview Scheduled' | 'Confirmed' | 'Rejected' | 'Under Correction'>('all');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // ✨ PAGINATION STATE ✨
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(20);

    // Notes Modal State
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedAdmissionIdForNotes, setSelectedAdmissionIdForNotes] = useState<string | null>(null);
    const [newNoteText, setNewNoteText] = useState('');
    const [noteEntries, setNoteEntries] = useState<NoteEntry[]>([]);
    const [savingNote, setSavingNote] = useState(false);
    const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

    // Details Modal State
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedAdmissionIdForDetails, setSelectedAdmissionIdForDetails] = useState<string | null>(null);
    const [previewModal, setPreviewModal] = useState<{ url: string; type: 'image' | 'pdf' | 'document'; name: string } | null>(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const [downloadModalOpen, setDownloadModalOpen] = useState(false);
    const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
    const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
    const [previewAdmission, setPreviewAdmission] = useState<Admission | null>(null);

    useEffect(() => {
        const initializePage = async () => {
            setPageLoading(true);
            await fetchAdmissions();
            setPageLoading(false);
        };
        initializePage();
    }, []);

    // ✨ RESET TO PAGE 1 WHEN FILTER/SEARCH CHANGES ✨
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filter]);

    const fetchAdmissions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('admission')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;

            const processedData = (data || []).map((admission: any) => {
                let notes: NoteEntry[] = [];

                if (admission.notes && Array.isArray(admission.notes)) {
                    notes = admission.notes as NoteEntry[];
                } else if (typeof admission.notes === 'string') {
                    try {
                        notes = JSON.parse(admission.notes);
                    } catch (e) {
                        console.error('Error parsing notes:', e);
                        notes = [];
                    }
                }

                return {
                    ...admission,
                    notes: notes.length > 0 ? notes : null,
                };
            });

            setAdmissions(processedData);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to fetch admissions');
        } finally {
            setLoading(false);
        }
    };

    const handleAdmissionDownload = (startDate: Date, endDate: Date) => {
        return admissions.filter((admission) => {
            const admissionDate = new Date(admission.created_at);
            return admissionDate >= startDate && admissionDate <= endDate;
        });
    };

    const handleSourceChange = async (id: string, newSource: string) => {
        try {
            const typedSource = newSource as 'enquiry' | 'social_media' | 'web' | 'offline';
            const { data, error } = await supabase
                .from('admission')
                .update({ admission_source: typedSource })
                .eq('id', id)
                .select();

            if (error) {
                console.error('❌ Supabase error:', error);
                toast.error(`Failed: ${error.message || 'Unknown error'}`);
                return;
            }

            setAdmissions((prev) =>
                prev.map((adm) =>
                    adm.id === id ? { ...adm, admission_source: typedSource } : adm
                )
            );

            toast.success(`✅ Source changed to ${newSource}`);
        } catch (error: any) {
            console.error('❌ Error:', error);
            toast.error(`Error: ${error?.message || 'Unknown error'}`);
        }
    };

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
        if (sortField !== field) return <SortOutlined />;
        return sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />;
    };

    const sortedAndFilteredAdmissions = admissions
        .filter(admission => {
            const childName = getChildName(admission).toLowerCase();
            const fatherName = getFatherName(admission).toLowerCase();
            const motherName = getMotherName(admission).toLowerCase();
            const email = getParentEmail(admission).toLowerCase();
            const mobile = getParentMobile(admission);
            const admissionNumber = String(admission.admission_number).toLowerCase();

            const matchesSearch =
                childName.includes(searchTerm.toLowerCase()) ||
                fatherName.includes(searchTerm.toLowerCase()) ||
                motherName.includes(searchTerm.toLowerCase()) ||
                email.includes(searchTerm.toLowerCase()) ||
                admissionNumber.includes(searchTerm.toLowerCase()) ||
                mobile.includes(searchTerm);

            const matchesFilter = filter === 'all' || getStatus(admission) === filter;

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            if (sortField === 'created_at') {
                return sortOrder === 'asc'
                    ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
            const aVal = sortField === 'child_name' ? getChildName(a) : sortField === 'program_name' ? getProgram(a) : getStatus(a);
            const bVal = sortField === 'child_name' ? getChildName(b) : sortField === 'program_name' ? getProgram(b) : getStatus(b);
            return sortOrder === 'asc'
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });

    // ✨ PAGINATION LOGIC ✨
    const totalPages = Math.ceil(sortedAndFilteredAdmissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAdmissions = sortedAndFilteredAdmissions.slice(startIndex, endIndex);

    const statusCounts = {
        total: admissions.length,
        'In Review': admissions.filter((a) => getStatus(a) === 'In Review').length,
        'Reviewed': admissions.filter((a) => getStatus(a) === 'Reviewed').length,
        'Interview Scheduled': admissions.filter((a) => getStatus(a) === 'Interview Scheduled').length,
        'Confirmed': admissions.filter((a) => getStatus(a) === 'Confirmed').length,
        'Rejected': admissions.filter((a) => getStatus(a) === 'Rejected').length,
        'Under Correction': admissions.filter((a) => getStatus(a) === 'Under Correction').length,
    };

    const statusCards: StatusCard[] = [
        {
            label: 'Total Applications',
            count: statusCounts.total,
            icon: <PersonOutlined />,
            color: '#6a4c93',
            bgColor: '#f3e8ff',
            status: 'In Review',
            id: 'total',
        },
        {
            label: 'In Review',
            count: statusCounts['In Review'],
            icon: <DescriptionOutlined />,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            status: 'In Review',
            id: 'in-review',
        },
        {
            label: 'Reviewed',
            count: statusCounts['Reviewed'],
            icon: <CheckCircleOutlined />,
            color: '#f59e0b',
            bgColor: '#fffbf0',
            status: 'Reviewed',
            id: 'reviewed',
        },
        {
            label: 'Interview Scheduled',
            count: statusCounts['Interview Scheduled'],
            icon: <AccessTimeOutlined />,
            color: '#8b5cf6',
            bgColor: '#faf5ff',
            status: 'Interview Scheduled',
            id: 'interview-scheduled',
        },
        {
            label: 'Confirmed',
            count: statusCounts['Confirmed'],
            icon: <CheckOutlined />,
            color: '#10b981',
            bgColor: '#f0fdf4',
            status: 'Confirmed',
            id: 'confirmed',
        },
        {
            label: 'Rejected',
            count: statusCounts['Rejected'],
            icon: <CloseOutlined />,
            color: '#ef4444',
            bgColor: '#fef2f2',
            status: 'Rejected',
            id: 'rejected',
        },
        {
            label: 'Under Correction',
            count: statusCounts['Under Correction'],
            icon: <EditOutlined />,
            color: '#8b5cf6',
            bgColor: '#faf5ff',
            status: 'Under Correction',
            id: 'under-correction',
        },
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

    const handleStatusChange = async (id: string, newStatus: Admission['admission_status']) => {
        try {
            setStatusUpdating(true);
            setUpdatingId(id);

            console.log('🔄 Updating status for admission:', id, 'to:', newStatus);

            const { data, error } = await supabase
                .from('admission')
                .update({ admission_status: newStatus })
                .eq('id', id)
                .select();

            if (error) {
                console.error('❌ Supabase error:', error);
                toast.error(`Failed: ${error.message || 'Unknown error'}`);
                return;
            }

            if (!data || data.length === 0) {
                console.warn('⚠️ No rows updated.');
                toast.error('Status not updated. Check permissions.');
                return;
            }

            console.log('✅ Status updated successfully.');

            setAdmissions((prev) =>
                prev.map((adm) =>
                    adm.id === id ? { ...adm, admission_status: newStatus } : adm
                )
            );

            toast.success(`✅ Status changed to ${newStatus}`);
        } catch (error: any) {
            console.error('❌ Error:', error);
            toast.error(`Error: ${error?.message || 'Unknown error'}`);
        } finally {
            setStatusUpdating(false);
            setUpdatingId(null);
        }
    };

    // ✨ NOTES MODAL FUNCTIONS ✨
    const openNotesModal = (admission: Admission) => {
        setSelectedAdmissionIdForNotes(admission.id);
        setNoteEntries(admission.notes || []);
        setNewNoteText('');
        setNotesModalOpen(true);
    };

    const closeNotesModal = () => {
        setNotesModalOpen(false);
        setSelectedAdmissionIdForNotes(null);
        setNoteEntries([]);
        setNewNoteText('');
        setDeletingNoteId(null);
    };

    const saveNewNote = async () => {
        if (!selectedAdmissionIdForNotes) {
            toast.error('Please select an admission first');
            return;
        }

        if (!newNoteText.trim()) {
            toast.error('Please enter a note');
            return;
        }

        try {
            setSavingNote(true);

            // Get username from localStorage
            const userName = localStorage.getItem('adminUsername') || 'Unknown User';

            const newEntry: NoteEntry = {
                id: Date.now().toString(),
                text: newNoteText.trim(),
                timestamp: new Date().toISOString(),
                userName: userName,
            };

            const updatedNotes = [...noteEntries, newEntry];

            const { error, data } = await supabase
                .from('admission')
                .update({
                    notes: updatedNotes,
                })
                .eq('id', selectedAdmissionIdForNotes)
                .select('id, notes');

            if (error) {
                throw error;
            }

            setAdmissions((prev) =>
                prev.map((admission) =>
                    admission.id === selectedAdmissionIdForNotes
                        ? {
                            ...admission,
                            notes: updatedNotes,
                        }
                        : admission
                )
            );

            setNoteEntries(updatedNotes);
            setNewNoteText('');
            toast.success('✨ Note saved successfully!');
        } catch (error) {
            console.error('Error saving note:', error);
            toast.error('Failed to save note.');
        } finally {
            setSavingNote(false);
        }
    };

    const deleteNoteEntry = async (noteId: string) => {
        if (!selectedAdmissionIdForNotes) {
            toast.error('Please select an admission first');
            return;
        }

        try {
            setDeletingNoteId(noteId);

            const updatedNotes = noteEntries.filter((entry) => entry.id !== noteId);

            const { error } = await supabase
                .from('admission')
                .update({
                    notes: updatedNotes.length > 0 ? updatedNotes : null,
                })
                .eq('id', selectedAdmissionIdForNotes)
                .select('id, notes');

            if (error) {
                throw error;
            }

            setNoteEntries(updatedNotes);

            setAdmissions((prev) =>
                prev.map((admission) =>
                    admission.id === selectedAdmissionIdForNotes
                        ? {
                            ...admission,
                            notes: updatedNotes.length > 0 ? updatedNotes : null,
                        }
                        : admission
                )
            );

            toast.success('✅ Note deleted successfully');
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Failed to delete note.');
        } finally {
            setDeletingNoteId(null);
        }
    };

    // ✨ DETAILS MODAL FUNCTIONS ✨
    const [editMode, setEditMode] = useState(false);
    const [editingData, setEditingData] = useState<Partial<Admission> | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [uploadedFileNames, setUploadedFileNames] = useState<{ [key: string]: string }>({});

    const openDetailsModal = (admission: Admission) => {
        setSelectedAdmissionIdForDetails(admission.id);
        setEditingData(admission);
        setEditMode(false);
        setUploadedFileNames({});
        setDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setDetailsModalOpen(false);
        setSelectedAdmissionIdForDetails(null);
        setEditMode(false);
        setEditingData(null);
        setUploadedFileNames({});
    };

    const handleSaveEdit = async () => {
        if (!editingData || !selectedAdmissionIdForDetails) return;

        try {
            setSavingEdit(true);

            // Get current admission data to access old file URLs
            const currentAdmission = admissions.find(a => a.id === selectedAdmissionIdForDetails);
            const admissionNumber = currentAdmission?.admission_number?.toString() || selectedAdmissionIdForDetails;

            // Prepare update object
            const updateData: any = {
                child_name: editingData.child_name,
                child_dob: editingData.child_dob,
                child_gender: editingData.child_gender,
                child_place_of_birth: editingData.child_place_of_birth,
                child_blood_group: editingData.child_blood_group,
                father_name: editingData.father_name,
                mother_name: editingData.mother_name,
                parent_address: editingData.parent_address,
                parent_email: editingData.parent_email,
                program_name: editingData.program_name,
                category: editingData.category,
                previous_school: editingData.previous_school,
                remark: editingData.remark,
            };

            // Handle file uploads
            const fileInputs = [
                { inputId: 'photo_upload', dbField: 'photo_url', oldField: 'photo_url', type: 'image' },
                { inputId: 'birth_cert_upload', dbField: 'birth_certificate_url', oldField: 'birth_certificate_url', type: 'document' },
                { inputId: 'aadhar_upload', dbField: 'aadhar_card_url', oldField: 'aadhar_card_url', type: 'document' },
                { inputId: 'parent_id_upload', dbField: 'parent_id_proof_url', oldField: 'parent_id_proof_url', type: 'document' },
            ];

            for (const fileInput of fileInputs) {
                const input = document.getElementById(fileInput.inputId) as HTMLInputElement;
                if (input?.files?.length) {
                    const file = input.files[0];

                    // Validate file size (max 10MB)
                    if (file.size > 10 * 1024 * 1024) {
                        toast.error(`File size must be less than 10MB for ${fileInput.inputId}`);
                        return;
                    }

                    // Delete old file from Google Drive if it exists
                    const oldUrl = currentAdmission?.[fileInput.oldField as keyof Admission];
                    if (oldUrl) {
                        try {
                            let oldFileId = '';
                            if (typeof oldUrl === 'string') {
                                if (oldUrl.includes('id=')) {
                                    oldFileId = oldUrl.split('id=')[1]?.split('&')[0];
                                } else if (oldUrl.includes('/d/')) {
                                    oldFileId = oldUrl.split('/d/')[1]?.split('/')[0];
                                }
                            }

                            if (oldFileId) {
                                // Call API to delete the old file
                                await fetch('/api/upload-to-drive', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ fileId: oldFileId }),
                                });
                            }
                        } catch (deleteError) {
                            console.warn(`Could not delete old file for ${fileInput.inputId}:`, deleteError);
                            // Continue with upload even if delete fails
                        }
                    }

                    // Upload new file to Google Drive with admission number as folder
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('field_name', fileInput.inputId);
                    formData.append('admissionNumber', admissionNumber.toString());

                    try {
                        const uploadResponse = await fetch('/api/admission/upload-file', {
                            method: 'POST',
                            body: formData,
                        });

                        const uploadResult = await uploadResponse.json();

                        if (!uploadResponse.ok) {
                            console.error(`Upload error for ${fileInput.inputId}:`, uploadResult);
                            toast.error(`Failed to upload ${fileInput.inputId}`);
                            return;
                        }

                        // Get the Google Drive URL from the response
                        const driveUrl = uploadResult?.data?.downloadUrl || uploadResult?.data?.driveLink || uploadResult?.data?.webViewLink;
                        if (driveUrl) {
                            // Extract file ID and construct consistent download URL
                            let fileId = uploadResult?.data?.fileId || '';
                            if (!fileId && driveUrl.includes('id=')) {
                                fileId = driveUrl.split('id=')[1]?.split('&')[0];
                            } else if (!fileId && driveUrl.includes('/d/')) {
                                fileId = driveUrl.split('/d/')[1]?.split('/')[0];
                            }

                            // Store consistent download URL format
                            const consistentUrl = fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : driveUrl;
                            updateData[fileInput.dbField] = consistentUrl;
                        } else {
                            toast.error(`No URL returned for ${fileInput.inputId}`);
                            return;
                        }
                    } catch (uploadError) {
                        console.error(`Upload error for ${fileInput.inputId}:`, uploadError);
                        toast.error(`Failed to upload ${fileInput.inputId}`);
                        return;
                    }
                }
            }

            // Update admission record with new data and file URLs
            const { error } = await supabase
                .from('admission')
                .update(updateData)
                .eq('id', selectedAdmissionIdForDetails)
                .select();

            if (error) {
                console.error('❌ Update error:', error);
                toast.error(`Failed to save: ${error.message}`);
                return;
            }

            // Update local state
            setAdmissions((prev) =>
                prev.map((adm) =>
                    adm.id === selectedAdmissionIdForDetails ? { ...adm, ...updateData } : adm
                )
            );

            // Clear file inputs
            fileInputs.forEach(fi => {
                const input = document.getElementById(fi.inputId) as HTMLInputElement;
                if (input) input.value = '';
            });

            setEditMode(false);
            toast.success('✅ Details and documents updated successfully!');
        } catch (error: any) {
            console.error('❌ Error:', error);
            toast.error(`Error: ${error?.message || 'Failed to save'}`);
        } finally {
            setSavingEdit(false);
        }
    };

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        } catch (e) {
            console.error('Error formatting timestamp:', e);
            return timestamp;
        }
    };

    // ✨ HANDLE ITEMS PER PAGE CHANGE ✨
    const handleItemsPerPageChange = (value: ItemsPerPage) => {
        setItemsPerPage(value);
        setCurrentPage(1);
    };

    // ✨ HANDLE PAGE CHANGE ✨
    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            const tableElement = document.querySelector(`.${styles.tableWrapper}`);
            if (tableElement) {
                tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    if (pageLoading) {
        return <Loader isVisible={true} message="Loading Admissions..." fullScreen={true} />;
    }

    return (
        <div className={styles.dashboardWrapper}>
            <HeadingTitle text="Admission Dashboard" />

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
                            filter={filter}
                            setFilter={setFilter}
                        />
                    </motion.div>
                ))}
            </motion.div>

            <div className={styles.dashboard}>
                <div className={styles.header}>
                    <div className={styles.controls}>
                        <div className={styles.searchBar}>
                            <SearchOutlined className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search by child name, admission no., email or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <motion.button
                            className={styles.downloadBtn}
                            onClick={() => setDownloadModalOpen(true)}
                            title="Download admission data"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <DownloadOutlined /> Download Data
                        </motion.button>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className={styles.filterSelect}
                        >
                            <option value="all">All Status</option>
                            <option value="In Review">In Review</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Interview Scheduled">Interview Scheduled</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Under Correction">Under Correction</option>
                        </select>
                    </div>
                </div>

                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Application No.</th>
                                <th onClick={() => handleSort('created_at')}>
                                    Date {getSortIcon('created_at')}
                                </th>
                                <th onClick={() => handleSort('child_name')}>
                                    Student's Name {getSortIcon('child_name')}
                                </th>
                                <th>Father's Name</th>
                                <th>Mother's Name</th>
                                <th>Contact</th>
                                <th onClick={() => handleSort('program_name')}>
                                    Program {getSortIcon('program_name')}
                                </th>
                                <th>Source</th>
                                <th>Notes</th>
                                <th onClick={() => handleSort('admission_status')}>
                                    Status {getSortIcon('admission_status')}
                                </th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className={styles.loading}>
                                        <CircularProgress size={18} sx={{ mr: 1 }} /> Loading admissions...
                                    </td>
                                </tr>
                            ) : sortedAndFilteredAdmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className={styles.noResults}>
                                        No admissions found
                                    </td>
                                </tr>
                            ) : (
                                paginatedAdmissions.map((admission) => (
                                    <motion.tr
                                        key={admission.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <td>{admission.admission_number}</td>
                                        <td>
                                            {new Date(admission.created_at).toLocaleDateString('en-US', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td>{getChildName(admission)}</td>

                                        <td>{getFatherName(admission)}</td>
                                        <td>{getMotherName(admission)}</td>
                                        <td>
                                            <div className={styles.contactLinks}>
                                                <span>{getParentMobile(admission)}</span>
                                                <a
                                                    href={`tel:${getParentMobile(admission)}`}
                                                    className={styles.phoneLink}
                                                    title="Call"
                                                >
                                                    <PhoneOutlined />
                                                </a>
                                                <a
                                                    href={`https://wa.me/91${getParentMobile(admission).replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.whatsappLink}
                                                    title="WhatsApp"
                                                >
                                                    <WhatsApp />
                                                </a>
                                            </div>
                                        </td>
                                        <td>{getProgram(admission)}</td>
                                        <td>
                                            <select
                                                value={admission.admission_source || 'enquiry'}
                                                onChange={(e) => handleSourceChange(admission.id, e.target.value)}
                                                className={styles.sourceDropdown}
                                            >
                                                <option value="enquiry">Enquiry</option>
                                                <option value="social_media">Social Media</option>
                                                <option value="web">Web</option>
                                                <option value="offline">Offline</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                className={`${styles.notesBtn} ${admission.notes && admission.notes.length > 0 ? styles.hasNotes : ''}`}
                                                onClick={() => openNotesModal(admission)}
                                                title={admission.notes && admission.notes.length > 0 ? `${admission.notes.length} notes` : 'Add note'}
                                            >
                                                <NoteOutlined />
                                                {admission.notes && admission.notes.length > 0 && (
                                                    <span className={styles.notesIndicator}>{admission.notes.length}</span>
                                                )}
                                            </button>
                                        </td>
                                        <td>
                                            <select
                                                value={getStatus(admission)}
                                                onChange={(e) => handleStatusChange(admission.id, e.target.value as Admission['admission_status'])}
                                                disabled={updatingId === admission.id}
                                                className={styles.statusDropdown}
                                            >
                                                <option value="In Review">In Review</option>
                                                <option value="Reviewed">Reviewed</option>
                                                <option value="Interview Scheduled">Interview Scheduled</option>
                                                <option value="Confirmed">Confirmed</option>
                                                <option value="Rejected">Rejected</option>
                                                <option value="Under Correction">Under Correction</option>
                                            </select>
                                            {updatingId === admission.id && (
                                                <CircularProgress
                                                    size={18}
                                                    className={styles.statusSpinner}
                                                />
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className={styles.viewBtn}
                                                onClick={() => openDetailsModal(admission)}
                                                title="View Details"
                                            >
                                                <VisibilityOutlined /> View
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ✨ PAGINATION SECTION ✨ */}
                {sortedAndFilteredAdmissions.length > 0 && (
                    <div className={styles.paginationSection}>
                        <div className={styles.paginationInfo}>
                            <p className={styles.paginationText}>
                                Showing <strong>{startIndex + 1}</strong> to{' '}
                                <strong>{Math.min(endIndex, sortedAndFilteredAdmissions.length)}</strong> of{' '}
                                <strong>{sortedAndFilteredAdmissions.length}</strong> admissions
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
                                    <ChevronLeft /> Previous
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
                                    Next <ChevronRight />
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

            {/* Notes Modal */}
            <NotesModal
                isOpen={notesModalOpen}
                onClose={closeNotesModal}
                noteEntries={noteEntries}
                newNoteText={newNoteText}
                setNewNoteText={setNewNoteText}
                onSaveNewNote={saveNewNote}
                onDeleteNote={deleteNoteEntry}
                admission={admissions.find(a => a.id === selectedAdmissionIdForNotes)}
                formatTimestamp={formatTimestamp}
                savingNote={savingNote}
                deletingNoteId={deletingNoteId}
                canDeleteNotes={parseInt(localStorage.getItem('adminRoleId') || '-1') === 0}
            />

            {/* Details Modal */}
            <DetailsModal
                isOpen={detailsModalOpen}
                onClose={closeDetailsModal}
                admission={admissions.find(a => a.id === selectedAdmissionIdForDetails)}
                onStatusChange={handleStatusChange}
                onPreview={setPreviewModal}
                statusUpdating={statusUpdating}
                updatingId={updatingId}
                editMode={editMode}
                setEditMode={setEditMode}
                editingData={editingData}
                setEditingData={setEditingData}
                onSaveEdit={handleSaveEdit}
                savingEdit={savingEdit}
                uploadedFileNames={uploadedFileNames}
                setUploadedFileNames={setUploadedFileNames}
                onPdfPreview={async (adm) => {
                    try {
                        setPreviewAdmission(adm);
                        setPdfPreviewOpen(true);
                        // Wait for the template to render in the DOM
                        setTimeout(async () => {
                            try {
                                const templateId = `admission-pdf-template-${adm.id}`;
                                const element = document.getElementById(templateId);
                                if (!element) throw new Error('Template element not found');

                                const originalDisplay = element.style.display;
                                element.style.display = 'block';

                                const canvas = await html2canvas(element, {
                                    scale: 2,
                                    useCORS: true,
                                    allowTaint: true,
                                    logging: false,
                                    backgroundColor: '#ffffff',
                                    width: element.offsetWidth,
                                    height: element.offsetHeight,
                                });

                                element.style.display = originalDisplay;

                                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                                const pdf = new jsPDF({
                                    orientation: 'portrait',
                                    unit: 'mm',
                                    format: 'a4',
                                });

                                const pdfWidth = pdf.internal.pageSize.getWidth();
                                const pdfHeight = pdf.internal.pageSize.getHeight();
                                const imgWidth = pdfWidth;
                                let imgHeight = (canvas.height * pdfWidth) / canvas.width;

                                if (!isFinite(imgHeight) || imgHeight <= 0) {
                                    imgHeight = pdfHeight;
                                }

                                pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

                                let position = imgHeight;
                                while (position > pdfHeight) {
                                    pdf.addPage();
                                    position -= pdfHeight;
                                    pdf.addImage(imgData, 'JPEG', 0, -position, imgWidth, imgHeight);
                                }

                                const pdfUrl = pdf.output('dataurlstring');
                                if (pdfUrl) {
                                    setPdfPreviewUrl(pdfUrl);
                                }
                            } catch (error) {
                                console.error('Error generating PDF preview:', error);
                                toast.error('Failed to generate PDF preview');
                            }
                        }, 300);
                    } catch (error) {
                        console.error('Error opening PDF preview:', error);
                        toast.error('Failed to open PDF preview');
                    }
                }}
            />

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={previewModal !== null}
                onClose={() => setPreviewModal(null)}
                preview={previewModal}
            />

            {/* PDF Form Preview Modal */}
            <PDFPreviewModal
                isOpen={pdfPreviewOpen}
                onClose={() => setPdfPreviewOpen(false)}
                pdfUrl={pdfPreviewUrl}
                admission={previewAdmission}
            />

            <DownloadModal
                isOpen={downloadModalOpen}
                onClose={() => setDownloadModalOpen(false)}
                data={admissions}
                columns={[
                    { key: 'admission_number', label: 'Admission Number' },
                    { key: 'created_at', label: 'Date' },
                    { key: 'child_name', label: 'Child Name' },
                    { key: 'child_dob', label: 'Date of Birth' },
                    { key: 'child_gender', label: 'Gender' },
                    { key: 'child_place_of_birth', label: 'Place of Birth' },
                    { key: 'father_name', label: 'Father Name' },
                    { key: 'mother_name', label: 'Mother Name' },
                    { key: 'parent_email', label: 'Email' },
                    { key: 'parent_mobile_number', label: 'Mobile' },
                    { key: 'program_name', label: 'Program' },
                    { key: 'previous_school', label: 'Previous School' },
                    { key: 'admission_status', label: 'Status' },
                ]}
                fileName="Admissions_Export"
                defaultMonths="6"
                onDateRangeChange={handleAdmissionDownload}
                title="Download Admissions Data"
                description="Select a date range and format to download your admission records"
            />
        </div>
    );
}

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
            className={`${styles.statusCard} ${filter === card.status ? styles.active : ''}`}
            whileHover={{ translateY: -6, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
            onClick={() => setFilter(card.status === 'In Review' ? 'all' : card.status)}
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
                    {card.status !== 'In Review' && (
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

// ✨ NOTES MODAL COMPONENT ✨
const NotesModal = ({
    isOpen,
    onClose,
    noteEntries,
    newNoteText,
    setNewNoteText,
    onSaveNewNote,
    onDeleteNote,
    admission,
    formatTimestamp,
    savingNote,
    deletingNoteId,
    canDeleteNotes,
}: {
    isOpen: boolean;
    onClose: () => void;
    noteEntries: NoteEntry[];
    newNoteText: string;
    setNewNoteText: (text: string) => void;
    onSaveNewNote: () => void;
    onDeleteNote: (noteId: string) => void;
    admission?: Admission;
    formatTimestamp: (timestamp: string) => string;
    savingNote?: boolean;
    deletingNoteId?: string | null;
    canDeleteNotes?: boolean;
}) => {
    const isProcessing = savingNote || !!deletingNoteId;
    const childName = getChildName(admission || {} as Admission);
    const fatherName = getFatherName(admission || {} as Admission);
    const motherName = getMotherName(admission || {} as Admission);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.notesModal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2><EditNoteIcon /> Internal Notes</h2>
                                <p>{childName} • {fatherName}</p>
                                {noteEntries.length > 0 && (
                                    <p className={styles.notesCount}>
                                        <HistoryOutlined /> {noteEntries.length} note{noteEntries.length !== 1 ? 's' : ''} saved
                                    </p>
                                )}
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                aria-label="Close"
                                disabled={isProcessing}
                            >
                                <CloseOutlined />
                            </button>
                        </div>

                        <div className={styles.modalContent}>
                            {/* Notes History Section */}
                            {noteEntries.length > 0 && (
                                <div className={styles.notesHistory}>
                                    <h3 className={styles.notesHistoryTitle}>
                                        <HistoryOutlined /> Note History
                                    </h3>
                                    <div className={styles.notesList}>
                                        <AnimatePresence>
                                            {noteEntries.map((entry, index) => (
                                                <motion.div
                                                    key={entry.id}
                                                    className={styles.noteEntry}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    layout
                                                >
                                                    <div className={styles.noteEntryHeader}>
                                                        <span className={styles.noteNumber}>Note #{index + 1}</span>
                                                        <span className={styles.noteUser}>
                                                            <PersonOutlined style={{ fontSize: '0.9em', marginRight: '4px' }} /> {entry.userName || 'Unknown User'}
                                                        </span>
                                                        <span className={styles.noteTimestamp}>
                                                            ⏰ {formatTimestamp(entry.timestamp)}
                                                        </span>
                                                        {canDeleteNotes && (
                                                            <motion.button
                                                                type="button"
                                                                className={styles.deleteNoteBtn}
                                                                onClick={() => onDeleteNote(entry.id)}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                title="Delete note"
                                                                disabled={!!deletingNoteId}
                                                            >
                                                                {deletingNoteId === entry.id ? (
                                                                    <CircularProgress size={14} sx={{ mr: 1 }} />
                                                                ) : (
                                                                    <DeleteOutlined />
                                                                )}
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                    <div className={styles.notesModalLining}></div>
                                                    <div className={styles.noteEntryContent}>
                                                        <p>{entry.text}</p>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {/* Divider */}
                            {noteEntries.length > 0 && (
                                <div className={styles.notesDivider}>
                                    <span>New Note</span>
                                </div>
                            )}

                            {/* New Note Input Section */}
                            <div className={styles.newNoteSection}>
                                <h3 className={styles.newNoteTitle}>
                                    <AddOutlined /> Add New Note
                                </h3>
                                <textarea
                                    value={newNoteText}
                                    onChange={(e) => setNewNoteText(e.target.value)}
                                    placeholder="Write your internal notes here... e.g., 'Follow up on interview' or 'Additional documents required'"
                                    className={styles.noteTextarea}
                                    rows={6}
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={onClose}
                                disabled={isProcessing}
                            >
                                <CloseOutlined /> Close
                            </button>
                            <motion.button
                                className={styles.saveBtn}
                                onClick={onSaveNewNote}
                                disabled={!newNoteText.trim() || isProcessing}
                                whileHover={{ scale: !newNoteText.trim() || isProcessing ? 1 : 1.05 }}
                                whileTap={{ scale: !newNoteText.trim() || isProcessing ? 1 : 0.95 }}
                            >
                                {savingNote ? (
                                    <>
                                        <CircularProgress size={16} sx={{ mr: 1 }} /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckOutlined /> Save Note
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>

                </>
            )}
        </AnimatePresence>
    );
};

// ✨ DETAILS MODAL COMPONENT ✨
const DetailsModal = ({
    isOpen,
    onClose,
    admission,
    onStatusChange,
    onPreview,
    statusUpdating,
    editMode,
    setEditMode,
    editingData,
    setEditingData,
    onSaveEdit,
    savingEdit,
    uploadedFileNames,
    setUploadedFileNames,
    onPdfPreview,
}: {
    isOpen: boolean;
    onClose: () => void;
    admission?: Admission;
    onStatusChange: (id: string, status: Admission['admission_status']) => void;
    onPreview: (preview: { url: string; type: 'image' | 'pdf' | 'document'; name: string }) => void;
    statusUpdating: boolean;
    updatingId: string | null;
    editMode: boolean;
    setEditMode: (mode: boolean) => void;
    editingData: Partial<Admission> | null;
    setEditingData: (data: Partial<Admission> | null) => void;
    onSaveEdit: () => Promise<void>;
    savingEdit: boolean;
    uploadedFileNames: { [key: string]: string };
    setUploadedFileNames: (files: { [key: string]: string }) => void;
    onPdfPreview: (admission: Admission) => void;
}) => {
    if (!admission) return null;

    const childName = getChildName(admission);
    const fatherName = getFatherName(admission);
    const motherName = getMotherName(admission);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.detailsModal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2><PersonOutlined /> Admission Details {editMode && <span style={{ fontSize: '0.75em' }}>• EDIT MODE</span>}</h2>
                                <p>{admission.admission_number} | {childName}</p>
                            </div>
                            <div className={styles.headerButtons}>
                                {!editMode ? (
                                    <>
                                        <motion.button
                                            className={styles.downloadBtn}
                                            onClick={() => onPdfPreview(admission)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            title="Preview and download admission form"
                                        >
                                            <DownloadOutlined /> Download
                                        </motion.button>
                                        <motion.button
                                            className={styles.editBtn}
                                            onClick={() => setEditMode(true)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            title="Edit admission details"
                                        >
                                            <EditOutlined /> Edit
                                        </motion.button>
                                    </>
                                ) : (
                                    <>
                                        <motion.button
                                            className={styles.saveBtn}
                                            onClick={onSaveEdit}
                                            disabled={savingEdit}
                                            whileHover={{ scale: savingEdit ? 1 : 1.05 }}
                                            whileTap={{ scale: savingEdit ? 1 : 0.95 }}
                                        >
                                            {savingEdit ? (
                                                <>
                                                    <CircularProgress size={16} sx={{ mr: 1 }} /> Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckOutlined /> Save
                                                </>
                                            )}
                                        </motion.button>
                                        <motion.button
                                            className={styles.cancelBtn}
                                            onClick={() => setEditMode(false)}
                                            disabled={savingEdit}
                                            whileHover={{ scale: savingEdit ? 1 : 1.05 }}
                                            whileTap={{ scale: savingEdit ? 1 : 0.95 }}
                                        >
                                            <CloseOutlined /> Cancel
                                        </motion.button>
                                    </>
                                )}
                                <button
                                    className={styles.closeBtn}
                                    onClick={onClose}
                                    aria-label="Close"
                                    disabled={statusUpdating || savingEdit}
                                >
                                    <CloseOutlined />
                                </button>
                            </div>
                        </div>

                        <div className={styles.modalContent}>
                            {/* Details Grid */}
                            <div className={styles.detailsGrid}>
                                {editMode && editingData ? (
                                    <>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Child Name</span>
                                            <input
                                                type="text"
                                                value={editingData.child_name || ''}
                                                onChange={(e) => setEditingData({ ...editingData, child_name: e.target.value })}
                                                className={styles.editInput}
                                                placeholder="Child name"
                                            />
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Date of Birth</span>
                                            <input
                                                type="date"
                                                value={editingData.child_dob || ''}
                                                onChange={(e) => setEditingData({ ...editingData, child_dob: e.target.value })}
                                                className={styles.editInput}
                                            />
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Gender</span>
                                            <select
                                                value={editingData.child_gender || ''}
                                                onChange={(e) => setEditingData({ ...editingData, child_gender: e.target.value })}
                                                className={styles.editInput}
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Place of Birth</span>
                                            <input
                                                type="text"
                                                value={editingData.child_place_of_birth || ''}
                                                onChange={(e) => setEditingData({ ...editingData, child_place_of_birth: e.target.value })}
                                                className={styles.editInput}
                                                placeholder="Place of birth"
                                            />
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Blood Group</span>
                                            <select
                                                value={editingData.child_blood_group || ''}
                                                onChange={(e) => setEditingData({ ...editingData, child_blood_group: e.target.value })}
                                                className={styles.editInput}
                                            >
                                                <option value="">-- Select Blood Group --</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Father Name</span>
                                            <input
                                                type="text"
                                                value={editingData.father_name || ''}
                                                onChange={(e) => setEditingData({ ...editingData, father_name: e.target.value })}
                                                className={styles.editInput}
                                                placeholder="Father name"
                                            />
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Mother Name</span>
                                            <input
                                                type="text"
                                                value={editingData.mother_name || ''}
                                                onChange={(e) => setEditingData({ ...editingData, mother_name: e.target.value })}
                                                className={styles.editInput}
                                                placeholder="Mother name"
                                            />
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Address</span>
                                            <textarea
                                                value={editingData.parent_address || ''}
                                                onChange={(e) => setEditingData({ ...editingData, parent_address: e.target.value })}
                                                className={styles.editInput}
                                                placeholder="Complete address"
                                                rows={3}
                                                style={{ resize: 'vertical', minHeight: '80px' }}
                                            />
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Email</span>
                                            <input
                                                type="email"
                                                value={editingData.parent_email || ''}
                                                onChange={(e) => setEditingData({ ...editingData, parent_email: e.target.value })}
                                                className={styles.editInput}
                                                placeholder="Email address"
                                            />
                                        </div>
                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Program</span>
                                            <select
                                                value={editingData.program_name || ''}
                                                onChange={(e) => setEditingData({ ...editingData, program_name: e.target.value })}
                                                className={styles.editInput}
                                            >
                                                <option value="">-- Select Program --</option>
                                                {schoolDetails.programs.map((program) => (
                                                    <option key={program.name} value={program.name}>
                                                        {program.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Category</span>
                                            <select
                                                value={editingData.category || ''}
                                                onChange={(e) => setEditingData({ ...editingData, category: e.target.value })}
                                                className={styles.editInput}
                                            >
                                                <option value="">-- Select Category --</option>
                                                <option value="General">General</option>
                                                <option value="OBC">OBC</option>
                                                <option value="SC">SC</option>
                                                <option value="ST">ST</option>
                                            </select>
                                        </div>

                                        <div className={styles.detailItem}>
                                            <span className={styles.detailLabel}>Previous School</span>
                                            <input
                                                type="text"
                                                value={editingData.previous_school || ''}
                                                onChange={(e) => setEditingData({ ...editingData, previous_school: e.target.value })}
                                                className={styles.editInput}
                                                placeholder="Previous school"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <DetailItem label="Child Name" value={childName} />
                                        <DetailItem label="Date of Birth" value={admission.child_dob || 'N/A'} />
                                        <DetailItem label="Gender" value={admission.child_gender || 'N/A'} />
                                        <DetailItem label="Place of Birth" value={admission.child_place_of_birth || 'N/A'} />
                                        <DetailItem label="Blood Group" value={admission.child_blood_group || 'N/A'} />
                                        <DetailItem label="Father Name" value={fatherName} />
                                        <DetailItem label="Mother Name" value={motherName} />
                                        <DetailItem label="Address" value={admission.parent_address || 'N/A'} />
                                        <DetailItem label="Email" value={getParentEmail(admission)} />
                                        <DetailItem label="Mobile" value={getParentMobile(admission)} />
                                        <DetailItem label="Program" value={getProgram(admission)} />
                                        <DetailItem label="Category" value={admission.category || 'N/A'} />
                                        <DetailItem label="Previous School" value={admission.previous_school || 'N/A'} />
                                    </>
                                )}
                            </div>

                            {/* Status Section */}
                            <div className={styles.statusSection}>
                                <label className={styles.sectionLabel}><DashboardOutlined /> Status</label>
                                <div className={styles.statusContainer}>
                                    <select
                                        value={getStatus(admission)}
                                        onChange={(e) => onStatusChange(admission.id, e.target.value as Admission['admission_status'])}
                                        className={styles.statusSelectModal}
                                        disabled={statusUpdating}
                                    >
                                        <option value="In Review">In Review</option>
                                        <option value="Reviewed">Reviewed</option>
                                        <option value="Interview Scheduled">Interview Scheduled</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Rejected">Rejected</option>
                                        <option value="Under Correction">Under Correction</option>
                                    </select>
                                    {statusUpdating && (
                                        <div className={styles.updatingIndicator}>
                                            <CircularProgress size={14} sx={{ mr: 1 }} />
                                            <span>Updating...</span>
                                        </div>
                                    )}
                                </div>

                                {/* Remark Section - Show when status is "Under Correction" */}
                                {editMode && getStatus(admission) === 'Under Correction' && (
                                    <div style={{ marginTop: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '600', color: 'var(--primary-purple)' }}>
                                            <NoteOutlined /> Remarks for Correction
                                        </label>
                                        <textarea
                                            value={editingData?.remark || ''}
                                            onChange={(e) => setEditingData({ ...editingData, remark: e.target.value })}
                                            placeholder="Enter remarks about what needs to be corrected..."
                                            style={{
                                                width: '100%',
                                                padding: '0.85rem',
                                                border: '2px solid rgba(106, 76, 147, 0.2)',
                                                borderRadius: '8px',
                                                fontSize: '0.95rem',
                                                minHeight: '100px',
                                                fontFamily: 'inherit',
                                                resize: 'vertical',
                                            }}
                                            disabled={savingEdit}
                                        />
                                    </div>
                                )}

                                {/* Display Remark when not in edit mode */}
                                {!editMode && admission.remark && getStatus(admission) === 'Under Correction' && (
                                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'linear-gradient(135deg, #fff9e6 0%, #fffbf0 100%)', borderLeft: '4px solid var(--primary-yellow)', borderRadius: '8px' }}>
                                        <strong style={{ color: 'var(--primary-purple)' }}><NoteOutlined /> Remarks:</strong>
                                        <p style={{ margin: '0.5rem 0 0 0', color: 'var(--primary-purple)' }}>{admission.remark}</p>
                                    </div>
                                )}
                            </div>

                            {/* Documents Section */}
                            <div className={styles.documentsSection}>
                                <label className={styles.sectionLabel}><DescriptionOutlined /> Documents</label>

                                {editMode ? (
                                    <div className={styles.documentUploadSection}>
                                        <div className={styles.documentUploadItem}>
                                            <span className={styles.documentUploadLabel}>Child Photo</span>
                                            <div className={styles.uploadInputWrapper}>
                                                <input
                                                    type="file"
                                                    id="photo_upload"
                                                    accept="image/*"
                                                    className={styles.fileInput}
                                                    disabled={savingEdit}
                                                    onChange={(e) => {
                                                        const fileName = e.target.files?.[0]?.name || '';
                                                        setUploadedFileNames({ ...uploadedFileNames, photo_upload: fileName });
                                                    }}
                                                />
                                                <label htmlFor="photo_upload" className={styles.uploadLabel}>
                                                    📷 Upload Photo
                                                </label>
                                            </div>
                                            {uploadedFileNames.photo_upload && (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--primary-purple)', fontWeight: '600' }}>
                                                    ✅ Selected: {uploadedFileNames.photo_upload}
                                                </span>
                                            )}
                                            {admission.photo_url && !uploadedFileNames.photo_upload && (
                                                <a href={admission.photo_url} target="_blank" rel="noopener noreferrer" className={styles.currentDocLink}>
                                                    View Current Photo
                                                </a>
                                            )}
                                        </div>

                                        <div className={styles.documentUploadItem}>
                                            <span className={styles.documentUploadLabel}>Birth Certificate</span>
                                            <div className={styles.uploadInputWrapper}>
                                                <input
                                                    type="file"
                                                    id="birth_cert_upload"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className={styles.fileInput}
                                                    disabled={savingEdit}
                                                    onChange={(e) => {
                                                        const fileName = e.target.files?.[0]?.name || '';
                                                        setUploadedFileNames({ ...uploadedFileNames, birth_cert_upload: fileName });
                                                    }}
                                                />
                                                <label htmlFor="birth_cert_upload" className={styles.uploadLabel}>
                                                    <DescriptionOutlined /> Upload Certificate
                                                </label>
                                            </div>
                                            {uploadedFileNames.birth_cert_upload && (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--primary-purple)', fontWeight: '600' }}>
                                                    ✅ Selected: {uploadedFileNames.birth_cert_upload}
                                                </span>
                                            )}
                                            {admission.birth_certificate_url && !uploadedFileNames.birth_cert_upload && (
                                                <a href={admission.birth_certificate_url} target="_blank" rel="noopener noreferrer" className={styles.currentDocLink}>
                                                    View Current Document
                                                </a>
                                            )}
                                        </div>

                                        <div className={styles.documentUploadItem}>
                                            <span className={styles.documentUploadLabel}>Aadhar Card</span>
                                            <div className={styles.uploadInputWrapper}>
                                                <input
                                                    type="file"
                                                    id="aadhar_upload"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className={styles.fileInput}
                                                    disabled={savingEdit}
                                                    onChange={(e) => {
                                                        const fileName = e.target.files?.[0]?.name || '';
                                                        setUploadedFileNames({ ...uploadedFileNames, aadhar_upload: fileName });
                                                    }}
                                                />
                                                <label htmlFor="aadhar_upload" className={styles.uploadLabel}>
                                                    🆔 Upload Aadhar
                                                </label>
                                            </div>
                                            {uploadedFileNames.aadhar_upload && (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--primary-purple)', fontWeight: '600' }}>
                                                    ✅ Selected: {uploadedFileNames.aadhar_upload}
                                                </span>
                                            )}
                                            {admission.aadhar_card_url && !uploadedFileNames.aadhar_upload && (
                                                <a href={admission.aadhar_card_url} target="_blank" rel="noopener noreferrer" className={styles.currentDocLink}>
                                                    View Current Document
                                                </a>
                                            )}
                                        </div>

                                        <div className={styles.documentUploadItem}>
                                            <span className={styles.documentUploadLabel}>Parent ID Proof</span>
                                            <div className={styles.uploadInputWrapper}>
                                                <input
                                                    type="file"
                                                    id="parent_id_upload"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    className={styles.fileInput}
                                                    disabled={savingEdit}
                                                    onChange={(e) => {
                                                        const fileName = e.target.files?.[0]?.name || '';
                                                        setUploadedFileNames({ ...uploadedFileNames, parent_id_upload: fileName });
                                                    }}
                                                />
                                                <label htmlFor="parent_id_upload" className={styles.uploadLabel}>
                                                    🪳 Upload ID Proof
                                                </label>
                                            </div>
                                            {uploadedFileNames.parent_id_upload && (
                                                <span style={{ fontSize: '0.85rem', color: 'var(--primary-purple)', fontWeight: '600' }}>
                                                    ✅ Selected: {uploadedFileNames.parent_id_upload}
                                                </span>
                                            )}
                                            {admission.parent_id_proof_url && !uploadedFileNames.parent_id_upload && (
                                                <a href={admission.parent_id_proof_url} target="_blank" rel="noopener noreferrer" className={styles.currentDocLink}>
                                                    View Current Document
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.documentsList}>
                                        {admission.photo_url ? (
                                            <DocumentListItem
                                                name="Child Photo"
                                                onPreview={() =>
                                                    onPreview({
                                                        url: admission.photo_url!,
                                                        type: 'image',
                                                        name: 'Child Photo',
                                                    })
                                                }
                                                onDownload={admission.photo_url}
                                            />
                                        ) : (
                                            <p className={styles.noDocuments}>No photo uploaded</p>
                                        )}
                                        {admission.birth_certificate_url && (
                                            <DocumentListItem
                                                name="Birth Certificate"
                                                onPreview={() =>
                                                    onPreview({
                                                        url: admission.birth_certificate_url!,
                                                        type: 'pdf',
                                                        name: 'Birth Certificate',
                                                    })
                                                }
                                                onDownload={admission.birth_certificate_url}
                                            />
                                        )}
                                        {admission.aadhar_card_url && (
                                            <DocumentListItem
                                                name="Aadhar Card"
                                                onPreview={() =>
                                                    onPreview({
                                                        url: admission.aadhar_card_url!,
                                                        type: 'pdf',
                                                        name: 'Aadhar Card',
                                                    })
                                                }
                                                onDownload={admission.aadhar_card_url}
                                            />
                                        )}
                                        {admission.parent_id_proof_url && (
                                            <DocumentListItem
                                                name="Parent ID Proof"
                                                onPreview={() =>
                                                    onPreview({
                                                        url: admission.parent_id_proof_url!,
                                                        type: 'pdf',
                                                        name: "Parent's ID Proof",
                                                    })
                                                }
                                                onDownload={admission.parent_id_proof_url}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Hidden Template for PDF Generation - Used for both preview and download */}
                        <div style={{ display: 'none' }}>
                            <div id={`admission-pdf-template-${admission.id}`}>
                                <AdmissionPDFTemplate admission={admission} />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={onClose}
                                disabled={statusUpdating}
                            >
                                <CloseOutlined /> Close
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const DetailItem = ({ label, value }: { label: string; value: string | ReactNode }) => (
    <div className={styles.detailItem}>
        <span className={styles.detailLabel}>{label}</span>
        <span className={styles.detailValue}>{value}</span>
    </div>
);

const DocumentListItem = ({
    name,
    onPreview,
    onDownload,
}: {
    name: string;
    onPreview: () => void;
    onDownload: string;
}) => (
    <div className={styles.documentItem}>
        <DescriptionOutlined className={styles.documentIcon} />
        <span className={styles.documentName}>{name}</span>
        <button className={styles.docBtn} onClick={onPreview} title="Preview">
            <VisibilityOutlined />
        </button>
        <a href={onDownload} download target="_blank" rel="noopener noreferrer" className={styles.docBtn} title="Download">
            <DownloadOutlined />
        </a>
    </div>
);

const DocumentPreviewModal = ({
    isOpen,
    onClose,
    preview,
}: {
    isOpen: boolean;
    onClose: () => void;
    preview: { url: string; type: 'image' | 'pdf' | 'document'; name: string } | null;
}) => {
    if (!preview) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2><DescriptionOutlined /> Document Preview</h2>
                                <p>{preview.name}</p>
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <CloseOutlined />
                            </button>
                        </div>

                        <div className={styles.previewContent}>
                            {preview.type === 'image' ? (
                                <img
                                    src={getGoogleDriveURL(preview.url, 'image')}
                                    alt={preview.name}
                                    className={styles.previewImage}
                                    onError={() => toast.error('Failed to load image preview')}
                                />
                            ) : preview.type === 'pdf' ? (
                                <iframe
                                    src={getGoogleDriveURL(preview.url, 'pdf')}
                                    title="PDF Preview"
                                    className={styles.previewIframe}
                                />
                            ) : (
                                <div className={styles.previewPlaceholder}>
                                    <p>Unable to preview this document type.</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <a
                                href={getGoogleDriveURL(preview.url, 'document')}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.downloadLink}
                            >
                                <DownloadOutlined /> Download
                            </a>
                            <button className={styles.cancelBtn} onClick={onClose}>
                                <CloseOutlined /> Close
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ✨ PDF PREVIEW MODAL COMPONENT ✨
const PDFPreviewModal = ({
    isOpen,
    onClose,
    pdfUrl,
    admission,
}: {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string | null;
    admission: Admission | null;
}) => {
    if (!admission) return null;

    const childName = getChildName(admission);
    const fileName = `Admission_${childName.replace(/\s+/g, '_')}_${admission.admission_number}.pdf`;

    const handleGeneratePreview = async () => {
        try {
            const templateId = `admission-pdf-preview-template-${admission.id}`;
            const element = document.getElementById(templateId);
            if (!element) throw new Error('Template element not found');

            const originalDisplay = element.style.display;
            element.style.display = 'block';

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: element.offsetWidth,
                height: element.offsetHeight,
            });

            element.style.display = originalDisplay;

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            let imgHeight = (canvas.height * pdfWidth) / canvas.width;

            if (!isFinite(imgHeight) || imgHeight <= 0) {
                imgHeight = pdfHeight;
            }

            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

            let position = imgHeight;
            while (position > pdfHeight) {
                pdf.addPage();
                position -= pdfHeight;
                pdf.addImage(imgData, 'JPEG', 0, -position, imgWidth, imgHeight);
            }

            return pdf.output('dataurlstring');
        } catch (error) {
            console.error('Error generating preview:', error);
            toast.error('Failed to generate PDF preview');
            return null;
        }
    };

    const handleDownload = async () => {
        try {
            const templateId = `admission-pdf-preview-template-${admission.id}`;
            const element = document.getElementById(templateId);
            if (!element) throw new Error('Template element not found');

            const originalDisplay = element.style.display;
            element.style.display = 'block';

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: element.offsetWidth,
                height: element.offsetHeight,
            });

            element.style.display = originalDisplay;

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            let imgHeight = (canvas.height * pdfWidth) / canvas.width;

            if (!isFinite(imgHeight) || imgHeight <= 0) {
                imgHeight = pdfHeight;
            }

            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

            let position = imgHeight;
            while (position > pdfHeight) {
                pdf.addPage();
                position -= pdfHeight;
                pdf.addImage(imgData, 'JPEG', 0, -position, imgWidth, imgHeight);
            }

            pdf.save(fileName);
            toast.success('PDF downloaded successfully!');
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download PDF');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.div
                        className={styles.pdfPreviewModal}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        <div className={styles.modalHeader}>
                            <div>
                                <h2><DescriptionOutlined /> Admission Form Preview</h2>
                                <p>{childName} • Admission #{admission.admission_number}</p>
                            </div>
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <CloseOutlined />
                            </button>
                        </div>

                        <div className={styles.pdfPreviewContent}>
                            <div id={`admission-pdf-preview-template-${admission.id}`} className={styles.pdfPreviewContentInner}>
                                <AdmissionPDFTemplate admission={admission} />
                            </div>
                        </div>

                        <div className={styles.modalFooter}>
                            <motion.button
                                onClick={handleDownload}
                                className={styles.downloadLink}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <DownloadOutlined /> Download PDF
                            </motion.button>
                            <motion.button
                                className={styles.cancelBtn}
                                onClick={onClose}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <CloseOutlined /> Close
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Refresh,
    Print,
    Download,
    Add,
    Close,
    CalendarToday,
    Person,
    Payment,
    Check,
    ChevronLeft,
    ChevronRight,
    Settings,
    ArrowBack,
    Phone,
    MenuBook,
    ArrowUpward,
    ArrowDownward,
} from '@mui/icons-material';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './receipt.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import Loader from '@/custom/loader/loader';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import schoolDetails from '@/json/schooldetails';
import schoolLogo from '../../../../public/assets/logo/logo.png'

interface ReceiptData {
    id: string;
    student_name: string;
    admission_number: string;
    parent_name: string;
    parent_phone: string;
    program: string;
    month: string;
    year: number;
    fees_amount: number;
    payment_mode: string;
    payment_date: string;
    receipt_number: string;
    status: 'pending' | 'paid' | 'partial';
    notes?: string;
    created_at: string;
    updated_at: string;
}

interface AdmissionData {
    id: string;
    admission_number: string;
    student_name: string;
    parent_name: string;
    parent_phone: string;
    program: string;
}

interface StatusCard {
    label: string;
    count: number;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
    status?: 'all' | 'pending' | 'paid' | 'partial';
    id: string;
    isAmount?: boolean;
}

type SortField = 'receipt_number' | 'student_name' | 'month' | 'fees_amount' | 'payment_date' | 'status';
type SortOrder = 'asc' | 'desc';
type ItemsPerPage = 20 | 50 | 100;

const ReceiptDashboard = () => {
    const [view, setView] = useState<'list' | 'details'>('list');
    const [receipts, setReceipts] = useState<ReceiptData[]>([]);
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid' | 'partial'>('all');
    const [sortField, setSortField] = useState<SortField>('payment_date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState<ItemsPerPage>(20);

    // Admission lookup states
    const [admissionNumber, setAdmissionNumber] = useState('');
    const [selectedAdmission, setSelectedAdmission] = useState<AdmissionData | null>(null);
    const [admissionPayments, setAdmissionPayments] = useState<ReceiptData[]>([]);
    const [admissionSearchLoading, setAdmissionSearchLoading] = useState(false);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
    const [printing, setPrinting] = useState(false);

    // Modal form admission search
    const [modalAdmissionNumber, setModalAdmissionNumber] = useState('');
    const [modalAdmissionSearchLoading, setModalAdmissionSearchLoading] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        student_name: '',
        admission_number: '',
        parent_name: '',
        parent_phone: '',
        program: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        fees_amount: '',
        payment_mode: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const [createLoading, setCreateLoading] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    // Fee structures
    const [feeStructures, setFeeStructures] = useState<any[]>([]);

    useEffect(() => {
        const initializePage = async () => {
            await fetchReceipts();
            await fetchFeeStructures();
            setPageLoading(false);
        };
        initializePage();
    }, []);

    // Reset to page 1 when filter/search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus]);

    // Fetch receipts
    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('fee_receipts')
                .select('*')
                .order('payment_date', { ascending: false });

            if (error) {
                console.error('Fetch error:', error);
                toast.error('Failed to fetch receipts');
                setReceipts([]);
                return;
            }

            setReceipts(data || []);
        } catch (err) {
            console.error('Error fetching receipts:', err);
            toast.error('Error fetching receipts');
        } finally {
            setLoading(false);
        }
    };

    // Fetch fee structures
    const fetchFeeStructures = async () => {
        try {
            const { data, error } = await supabase
                .from('fee_structure')
                .select('*')
                .eq('is_active', true)
                .order('program_name');

            if (error) {
                console.error('Error fetching fee structures:', error);
                return;
            }

            setFeeStructures(data || []);
        } catch (err) {
            console.error('Error fetching fee structures:', err);
        }
    };

    // Search admission by admission number
    const handleSearchAdmission = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!admissionNumber.trim()) {
            toast.error('Please enter admission number');
            return;
        }

        try {
            setAdmissionSearchLoading(true);

            // Search by admission_number
            const { data: admissionData, error: admissionError } = await supabase
                .from('admission')
                .select('*')
                .eq('admission_number', admissionNumber.trim())
                .single();

            if (admissionError) {
                toast.error('Admission not found');
                return;
            }

            if (!admissionData) {
                toast.error('Admission not found');
                return;
            }

            setSelectedAdmission({
                id: admissionData.id,
                admission_number: admissionData.admission_number || '',
                student_name: admissionData.child_first_name || admissionData.child_name || admissionData.childFirstName || 'N/A',
                parent_name: admissionData.father_name || admissionData.parentFirstName || 'N/A',
                parent_phone: admissionData.parent_mobile_number || admissionData.parentMobile || 'N/A',
                program: admissionData.program_name || admissionData.program || 'N/A',
            });

            // Fetch payment history for this admission
            const { data: paymentsData, error: paymentsError } = await supabase
                .from('fee_receipts')
                .select('*')
                .eq('admission_number', admissionNumber.trim())
                .order('payment_date', { ascending: false });

            if (paymentsError) {
                console.error('Error fetching payments:', paymentsError);
                setAdmissionPayments([]);
            } else {
                setAdmissionPayments(paymentsData || []);
            }

            setView('details');
            toast.success('Admission found!');
        } catch (err) {
            console.error('Error searching admission:', err);
            toast.error('Error searching admission');
        } finally {
            setAdmissionSearchLoading(false);
        }
    };

    // Search and auto-fill admission in modal
    const handleModalAdmissionSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!modalAdmissionNumber.trim()) {
            toast.error('Please enter admission number');
            return;
        }

        try {
            setModalAdmissionSearchLoading(true);

            // Search by admission_number
            const { data: admissionData, error: admissionError } = await supabase
                .from('admission')
                .select('*')
                .eq('admission_number', modalAdmissionNumber.trim())
                .single();

            if (admissionError) {
                toast.error('Admission not found');
                return;
            }

            if (!admissionData) {
                toast.error('Admission not found');
                return;
            }

            // Auto-fill form with admission details
            const programName = admissionData.program_name || admissionData.program || '';
            const feeStructure = feeStructures.find(f => f.program_name === programName);

            setFormData(prev => ({
                ...prev,
                student_name: admissionData.child_first_name || admissionData.child_name || admissionData.childFirstName || '',
                admission_number: admissionData.admission_number || '',
                parent_name: admissionData.father_name || admissionData.parentFirstName || '',
                parent_phone: admissionData.parent_mobile_number || admissionData.parentMobile || '',
                program: programName,
                fees_amount: feeStructure ? feeStructure.monthly_fee.toString() : prev.fees_amount,
            }));

            toast.success('Admission details loaded!');
        } catch (err) {
            console.error('Error searching admission:', err);
            toast.error('Error searching admission');
        } finally {
            setModalAdmissionSearchLoading(false);
        }
    };

    // Create receipt for selected admission
    const handleCreateReceipt = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.student_name.trim()) {
            toast.error('Please enter student name');
            return;
        }
        if (!formData.fees_amount) {
            toast.error('Please enter fees amount');
            return;
        }

        try {
            setCreateLoading(true);
            const receiptNumber = `RCP-${Date.now()}`;

            const { error } = await supabase.from('fee_receipts').insert([
                {
                    student_name: formData.student_name,
                    admission_number: formData.admission_number,
                    parent_name: formData.parent_name,
                    parent_phone: formData.parent_phone,
                    program: formData.program,
                    month: formData.month,
                    year: formData.year,
                    fees_amount: parseFloat(formData.fees_amount),
                    payment_mode: formData.payment_mode,
                    payment_date: formData.payment_date,
                    receipt_number: receiptNumber,
                    status: 'paid',
                    notes: formData.notes,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
            ]);

            if (error) {
                toast.error('Failed to create receipt');
                return;
            }

            toast.success('Receipt created successfully!');
            setShowCreateModal(false);

            // Refresh payment history if we're in details view
            if (selectedAdmission) {
                const { data: paymentsData } = await supabase
                    .from('fee_receipts')
                    .select('*')
                    .eq('admission_number', selectedAdmission.admission_number)
                    .order('payment_date', { ascending: false });

                setAdmissionPayments(paymentsData || []);
            }

            // Reset form
            const programName = selectedAdmission?.program || '';
            const feeStructure = feeStructures.find(f => f.program_name === programName);

            setFormData({
                student_name: selectedAdmission?.student_name || '',
                admission_number: selectedAdmission?.admission_number || '',
                parent_name: selectedAdmission?.parent_name || '',
                parent_phone: selectedAdmission?.parent_phone || '',
                program: programName,
                month: new Date().toLocaleString('default', { month: 'long' }),
                year: new Date().getFullYear(),
                fees_amount: feeStructure ? feeStructure.monthly_fee.toString() : '',
                payment_mode: 'cash',
                payment_date: new Date().toISOString().split('T')[0],
                notes: '',
            });

            // Also refresh list view
            await fetchReceipts();
        } catch (err) {
            console.error('Error creating receipt:', err);
            toast.error('Error creating receipt');
        } finally {
            setCreateLoading(false);
        }
    };

    // Print receipt
    const handlePrintReceipt = async (receipt: ReceiptData) => {
        setSelectedReceipt(receipt);
        setShowPrintModal(true);
    };

    // Download PDF
    const handleDownloadPDF = async () => {
        if (!printRef.current || !selectedReceipt) return;

        try {
            setPrinting(true);
            const canvas = await html2canvas(printRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });

            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pdf_x = 0;
            const pdf_y = 0;

            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', pdf_x, pdf_y, imgWidth, imgHeight);
            pdf.save(`Receipt-${selectedReceipt.receipt_number}.pdf`);
            toast.success('Receipt downloaded successfully!');
        } catch (err) {
            console.error('Error downloading PDF:', err);
            toast.error('Error downloading receipt');
        } finally {
            setPrinting(false);
        }
    };

    // Sorted and filtered receipts
    const sortedReceipts = receipts
        .filter(receipt => {
            const matchesSearch =
                receipt.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                receipt.receipt_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                receipt.parent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                receipt.admission_number.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = filterStatus === 'all' || receipt.status === filterStatus;

            return matchesSearch && matchesFilter;
        })
        .sort((a, b) => {
            let aVal: any, bVal: any;

            if (sortField === 'student_name' || sortField === 'receipt_number' || sortField === 'month') {
                aVal = a[sortField].toString().toLowerCase();
                bVal = b[sortField].toString().toLowerCase();
                return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else if (sortField === 'fees_amount') {
                aVal = a.fees_amount;
                bVal = b.fees_amount;
            } else if (sortField === 'payment_date') {
                aVal = new Date(a.payment_date).getTime();
                bVal = new Date(b.payment_date).getTime();
            } else if (sortField === 'status') {
                aVal = a.status;
                bVal = b.status;
            }

            return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
        });

    const totalPages = Math.ceil(sortedReceipts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedReceipts = sortedReceipts.slice(startIndex, startIndex + itemsPerPage);

    // Calculate total collected amount
    const totalCollected = receipts.filter(r => r.status === 'paid').reduce((sum, r) => sum + r.fees_amount, 0);

    // Payment mode stats
    const cashCount = receipts.filter(r => r.payment_mode === 'cash').length;
    const chequeCount = receipts.filter(r => r.payment_mode === 'cheque').length;
    const onlineCount = receipts.filter(r => r.payment_mode === 'online').length;
    const otherCount = receipts.filter(r => r.payment_mode === 'other').length;

    // Status cards
    const statusCards: StatusCard[] = [
        {
            label: 'Total Receipts',
            count: receipts.length,
            icon: <Payment />,
            color: '#6a4c93',
            bgColor: '#f3e8ff',
            status: 'all',
            id: 'total',
        },
        {
            label: 'Paid',
            count: receipts.filter(r => r.status === 'paid').length,
            icon: <Check />,
            color: '#10b981',
            bgColor: '#ecfdf5',
            status: 'paid',
            id: 'paid',
        },
        {
            label: 'Pending',
            count: receipts.filter(r => r.status === 'pending').length,
            icon: <CalendarToday />,
            color: '#f59e0b',
            bgColor: '#fffbeb',
            status: 'pending',
            id: 'pending',
        },
        {
            label: 'Partial',
            count: receipts.filter(r => r.status === 'partial').length,
            icon: <Payment />,
            color: '#3b82f6',
            bgColor: '#eff6ff',
            status: 'partial',
            id: 'partial',
        },
        {
            label: 'Total Collected',
            count: totalCollected,
            icon: <Payment />,
            color: '#059669',
            bgColor: '#d1fae5',
            id: 'collected',
            isAmount: true,
        },
        {
            label: 'Cash Payments',
            count: cashCount,
            icon: <Payment />,
            color: '#dc2626',
            bgColor: '#fef2f2',
            id: 'cash',
        },
        {
            label: 'Cheque Payments',
            count: chequeCount,
            icon: <Payment />,
            color: '#7c3aed',
            bgColor: '#f3e8ff',
            id: 'cheque',
        },
        {
            label: 'Online Payments',
            count: onlineCount,
            icon: <Payment />,
            color: '#0891b2',
            bgColor: '#ecfeff',
            id: 'online',
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return { color: '#10b981', bg: '#ecfdf5' };
            case 'pending':
                return { color: '#f59e0b', bg: '#fffbeb' };
            case 'partial':
                return { color: '#3b82f6', bg: '#eff6ff' };
            default:
                return { color: '#6b7280', bg: '#f3f4f6' };
        }
    };

    // Handle sort click
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    // Get sort icon for column header
    const getSortIcon = (field: SortField) => {
        if (sortField !== field) return null;
        return sortOrder === 'asc' ? <ArrowUpward /> : <ArrowDownward />;
    };

    // DETAILS VIEW - Admission Search and Payment History
    if (view === 'details' && selectedAdmission) {
        return (
            <div className={styles.dashboardWrapper}>
                <HeadingTitle text="Receipt Dashboard" />

                {/* Back Button */}
                <motion.button
                    className={styles.backBtn}
                    onClick={() => {
                        setView('list');
                        setSelectedAdmission(null);
                        setAdmissionNumber('');
                        setAdmissionPayments([]);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowBack /> Back to List
                </motion.button>

                {/* Student Details Card */}
                <motion.div
                    className={styles.studentDetailsCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className={styles.studentHeader}>
                        <h2>{selectedAdmission.student_name}</h2>
                        <span className={styles.admissionBadge}>ADM: {selectedAdmission.admission_number}</span>
                    </div>

                    <div className={styles.studentInfoGrid}>
                        <div className={styles.infoItem}>
                            <Person className={styles.infoIcon} />
                            <div>
                                <p className={styles.infoLabel}>Parent Name</p>
                                <p className={styles.infoValue}>{selectedAdmission.parent_name}</p>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <Phone className={styles.infoIcon} />
                            <div>
                                <p className={styles.infoLabel}>Phone</p>
                                <p className={styles.infoValue}>{selectedAdmission.parent_phone}</p>
                            </div>
                        </div>
                        <div className={styles.infoItem}>
                            <MenuBook className={styles.infoIcon} />
                            <div>
                                <p className={styles.infoLabel}>Program</p>
                                <p className={styles.infoValue}>{selectedAdmission.program}</p>
                            </div>
                        </div>

                    </div>

                    <motion.button
                        className={styles.createBtn}
                        onClick={() => {
                            setFormData({
                                student_name: selectedAdmission.student_name,
                                admission_number: selectedAdmission.admission_number,
                                parent_name: selectedAdmission.parent_name,
                                parent_phone: selectedAdmission.parent_phone,
                                program: selectedAdmission.program,
                                month: new Date().toLocaleString('default', { month: 'long' }),
                                year: new Date().getFullYear(),
                                fees_amount: '',
                                payment_mode: 'cash',
                                payment_date: new Date().toISOString().split('T')[0],
                                notes: '',
                            });
                            setShowCreateModal(true);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Add /> Add Receipt
                    </motion.button>
                </motion.div>

                {/* Payment History Table */}
                <div className={styles.paymentHistorySection}>
                    <h3>Payment History</h3>
                    {admissionPayments.length === 0 ? (
                        <div className={styles.noData}>
                            <p>No payment records found for this admission</p>
                        </div>
                    ) : (
                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Receipt #</th>
                                        <th>Month/Year</th>
                                        <th>Amount</th>
                                        <th>Payment Date</th>
                                        <th>Payment Mode</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {admissionPayments.map((payment) => (
                                        <motion.tr
                                            key={payment.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <td className={styles.receiptNumber}>{payment.receipt_number}</td>
                                            <td>{payment.month} {payment.year}</td>
                                            <td className={styles.amount}>
                                                ₹ {payment.fees_amount.toFixed(2)}
                                            </td>
                                            <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                            <td>{payment.payment_mode}</td>
                                            <td>
                                                <span
                                                    className={styles.statusBadge}
                                                    style={{
                                                        backgroundColor: getStatusColor(payment.status).bg,
                                                        color: getStatusColor(payment.status).color,
                                                    }}
                                                >
                                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                <motion.button
                                                    className={styles.printBtn}
                                                    onClick={() => handlePrintReceipt(payment)}
                                                    title="Print receipt"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <Print />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Create Receipt Modal */}
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
                                className={styles.modal}
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.modalHeader}>
                                    <h2>Create New Receipt</h2>
                                    <button
                                        className={styles.closeBtn}
                                        onClick={() => setShowCreateModal(false)}
                                        disabled={createLoading}
                                    >
                                        <Close />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateReceipt} className={styles.form}>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>Student Name *</label>
                                            <input
                                                type="text"
                                                value={formData.student_name}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, student_name: e.target.value })
                                                }
                                                disabled={createLoading}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Month</label>
                                            <select
                                                value={formData.month}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, month: e.target.value })
                                                }
                                                disabled={createLoading}
                                            >
                                                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Year</label>
                                            <input
                                                type="number"
                                                value={formData.year}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, year: parseInt(e.target.value) })
                                                }
                                                disabled={createLoading}
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Fees Amount *</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.fees_amount}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, fees_amount: e.target.value })
                                                }
                                                disabled={createLoading}
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Payment Mode</label>
                                            <select
                                                value={formData.payment_mode}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, payment_mode: e.target.value })
                                                }
                                                disabled={createLoading}
                                            >
                                                <option value="cash">Cash</option>
                                                <option value="cheque">Cheque</option>
                                                <option value="online">Online</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Payment Date</label>
                                            <input
                                                type="date"
                                                value={formData.payment_date}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, payment_date: e.target.value })
                                                }
                                                disabled={createLoading}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Notes</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) =>
                                                setFormData({ ...formData, notes: e.target.value })
                                            }
                                            disabled={createLoading}
                                            rows={3}
                                        />
                                    </div>

                                    <div className={styles.modalActions}>
                                        <motion.button
                                            type="button"
                                            className={styles.cancelBtn}
                                            onClick={() => setShowCreateModal(false)}
                                            disabled={createLoading}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            type="submit"
                                            className={styles.submitBtn}
                                            disabled={createLoading}
                                            whileHover={{ scale: createLoading ? 1 : 1.02 }}
                                            whileTap={{ scale: createLoading ? 1 : 0.98 }}
                                        >
                                            {createLoading ? (
                                                <>
                                                    <Refresh className={styles.spinner} /> Creating...
                                                </>
                                            ) : (
                                                <>
                                                    <Check /> Create Receipt
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Print Modal */}
                <AnimatePresence>
                    {showPrintModal && selectedReceipt && (
                        <motion.div
                            className={styles.printModalOverlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPrintModal(false)}
                        >
                            <motion.div
                                className={styles.printModal}
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className={styles.printModalHeader}>
                                    <h2>Print Receipt</h2>
                                    <button
                                        className={styles.closeBtn}
                                        onClick={() => setShowPrintModal(false)}
                                        disabled={printing}
                                    >
                                        <Close />
                                    </button>
                                </div>

                                <div className={styles.printContent} ref={printRef}>
                                    <div className={styles.receiptHeader}>
                                        <h3>{schoolDetails.name}</h3>
                                        <p>{schoolDetails.address.street}, {schoolDetails.address.city}</p>
                                        <p>Phone: {schoolDetails.contact.phone}</p>
                                    </div>

                                    <div className={styles.receiptTitle}>
                                        <h2>FEE RECEIPT</h2>
                                    </div>

                                    <div className={styles.receiptNumber}>
                                        <p>Receipt #: <strong>{selectedReceipt.receipt_number}</strong></p>
                                        <p>Date: <strong>{new Date(selectedReceipt.payment_date).toLocaleDateString()}</strong></p>
                                    </div>

                                    <div className={styles.receiptDetails}>
                                        <div className={styles.detailsColumn}>
                                            <h4>Student Details</h4>
                                            <p><strong>Name:</strong> {selectedReceipt.student_name}</p>
                                            <p><strong>Admission #:</strong> {selectedReceipt.admission_number}</p>
                                            <p><strong>Program:</strong> {selectedReceipt.program}</p>
                                        </div>
                                        <div className={styles.detailsColumn}>
                                            <h4>Parent Details</h4>
                                            <p><strong>Name:</strong> {selectedReceipt.parent_name}</p>
                                            <p><strong>Phone:</strong> {selectedReceipt.parent_phone}</p>
                                        </div>
                                    </div>

                                    <table className={styles.receiptTable}>
                                        <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th>Month</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Monthly Fees</td>
                                                <td>{selectedReceipt.month} {selectedReceipt.year}</td>
                                                <td className={styles.amount}>₹ {selectedReceipt.fees_amount.toFixed(2)}</td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th colSpan={2}>Total Amount</th>
                                                <th className={styles.totalAmount}>₹ {selectedReceipt.fees_amount.toFixed(2)}</th>
                                            </tr>
                                        </tfoot>
                                    </table>

                                    <div className={styles.receiptFooter}>
                                        <p><strong>Payment Mode:</strong> {selectedReceipt.payment_mode}</p>
                                        <p><strong>Status:</strong> {selectedReceipt.status.toUpperCase()}</p>
                                        {selectedReceipt.notes && <p><strong>Notes:</strong> {selectedReceipt.notes}</p>}
                                        <p className={styles.thankYou}>Thank you for your payment!</p>
                                    </div>
                                </div>

                                <div className={styles.printModalActions}>
                                    <motion.button
                                        className={styles.printBtn}
                                        onClick={() => window.print()}
                                        disabled={printing}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Print /> Print
                                    </motion.button>
                                    <motion.button
                                        className={styles.downloadBtn}
                                        onClick={handleDownloadPDF}
                                        disabled={printing}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {printing ? (
                                            <>
                                                <Refresh className={styles.spinner} /> Downloading...
                                            </>
                                        ) : (
                                            <>
                                                <Download /> Download PDF
                                            </>
                                        )}
                                    </motion.button>
                                    <motion.button
                                        className={styles.closeModalBtn}
                                        onClick={() => setShowPrintModal(false)}
                                        disabled={printing}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Close /> Close
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // LIST VIEW - All Receipts with Admission Search
    return (
        <div className={styles.dashboardWrapper}>
            <HeadingTitle text="Receipt Dashboard" />

            {/* Admission Search Section */}
            <motion.div
                className={styles.searchAdmissionSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={styles.searchAdmissionCard}>
                    <h3><Search /> Search Student Receipt by Admission Number</h3>
                    <form onSubmit={handleSearchAdmission} className={styles.searchAdmissionForm}>
                        <div className={styles.formGroup}>
                            <label>Admission Number</label>
                            <input
                                type="text"
                                value={admissionNumber}
                                onChange={(e) => setAdmissionNumber(e.target.value)}
                                placeholder="e.g., ADM-2024-001"
                                disabled={admissionSearchLoading}
                            />
                        </div>
                        <motion.button
                            type="submit"
                            className={styles.searchBtn}
                            disabled={admissionSearchLoading}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {admissionSearchLoading ? (
                                <>
                                    <Refresh className={styles.spinner} /> Searching...
                                </>
                            ) : (
                                <>
                                    <Search /> Search
                                </>
                            )}
                        </motion.button>
                    </form>
                </div>
            </motion.div>

            {/* Status Cards */}
            <motion.div
                className={styles.statusCardsSection}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {statusCards.map((card) => (
                    <motion.div
                        key={card.id}
                        className={styles.statusCard}
                        variants={itemVariants}
                    >
                        <div
                            className={styles.statusCardIcon}
                            style={{ color: card.color, backgroundColor: card.bgColor }}
                        >
                            {card.icon}
                        </div>
                        <div className={styles.statusCardContent}>
                            <p className={styles.statusCardLabel}>{card.label}</p>
                            <p className={styles.statusCardCount} style={{ color: card.color }}>
                                {card.isAmount ? `₹${card.count.toFixed(2)}` : card.count}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Header */}
            <div className={styles.header}>
                <h2><Payment /> Manage Fee Receipts</h2>
                <div className={styles.headerButtons}>
                    <Link href="/admin/dashboard/fee-structure">
                        <motion.button
                            className={styles.manageFeesBtn}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Settings /> Manage Fees
                        </motion.button>
                    </Link>
                    <motion.button
                        className={styles.createBtn}
                        onClick={() => setShowCreateModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Add /> Create Receipt
                    </motion.button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className={styles.controls}>
                <div className={styles.searchBar}>
                    <Search />
                    <input
                        type="text"
                        placeholder="Search by name, receipt number, admission number..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => {
                        setFilterStatus(e.target.value as any);
                        setCurrentPage(1);
                    }}
                    className={styles.filterSelect}
                >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                </select>
            </div>

            {/* Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('receipt_number')}>
                                Receipt # {getSortIcon('receipt_number')}
                            </th>
                            <th>Admission #</th>
                            <th onClick={() => handleSort('student_name')}>
                                Student {getSortIcon('student_name')}
                            </th>
                            <th>Program</th>
                            <th onClick={() => handleSort('month')}>
                                Month {getSortIcon('month')}
                            </th>
                            <th onClick={() => handleSort('fees_amount')}>
                                Amount {getSortIcon('fees_amount')}
                            </th>
                            <th onClick={() => handleSort('payment_date')}>
                                Date {getSortIcon('payment_date')}
                            </th>
                            <th onClick={() => handleSort('status')}>
                                Status {getSortIcon('status')}
                            </th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedReceipts.map((receipt) => (
                            <motion.tr
                                key={receipt.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td>{receipt.receipt_number}</td>
                                <td><strong>{receipt.admission_number}</strong></td>
                                <td>
                                    <div className={styles.studentInfo}>
                                        <Person className={styles.icon} />
                                        <div>
                                            <p className={styles.name}>{receipt.student_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{receipt.program}</td>
                                <td>{receipt.month} {receipt.year}</td>
                                <td className={styles.amount}>
                                    <Payment /> {receipt.fees_amount.toFixed(2)}
                                </td>
                                <td>{new Date(receipt.payment_date).toLocaleDateString()}</td>
                                <td>
                                    <span
                                        className={styles.statusBadge}
                                        style={{
                                            backgroundColor: getStatusColor(receipt.status).bg,
                                            color: getStatusColor(receipt.status).color,
                                        }}
                                    >
                                        {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        <motion.button
                                            className={styles.actionBtn}
                                            onClick={() => handlePrintReceipt(receipt)}
                                            title="Print receipt"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Print />
                                        </motion.button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {sortedReceipts.length > 0 && (
                <div className={styles.paginationSection}>
                    <div className={styles.paginationInfo}>
                        <p>
                            Showing <strong>{startIndex + 1}</strong> to{' '}
                            <strong>{Math.min(startIndex + itemsPerPage, sortedReceipts.length)}</strong> of{' '}
                            <strong>{sortedReceipts.length}</strong>
                        </p>
                    </div>
                    <div className={styles.paginationControls}>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value) as ItemsPerPage);
                                setCurrentPage(1);
                            }}
                            className={styles.itemsPerPageSelect}
                        >
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                            <option value={100}>100 per page</option>
                        </select>
                        <div className={styles.paginationButtons}>
                            <motion.button
                                className={styles.paginationBtn}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
                            >
                                <ChevronLeft /> Previous
                            </motion.button>
                            <span className={styles.pageInfo}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <motion.button
                                className={styles.paginationBtn}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
                            >
                                Next <ChevronRight />
                            </motion.button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Receipt Modal */}
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
                            className={styles.modal}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h2>Create New Receipt</h2>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={createLoading}
                                >
                                    <Close />
                                </button>
                            </div>

                            <form onSubmit={handleCreateReceipt} className={styles.form}>
                                {/* Admission Search Section */}
                                <div className={styles.admissionSearchInModal}>
                                    <h4>Auto-Fill Student Details</h4>
                                    <div className={styles.admissionSearchForm}>
                                        <div className={styles.formGroup}>
                                            <label>Admission Number</label>
                                            <input
                                                type="text"
                                                value={modalAdmissionNumber}
                                                onChange={(e) => setModalAdmissionNumber(e.target.value)}
                                                placeholder="e.g., ADM-2024-001"
                                                disabled={modalAdmissionSearchLoading || createLoading}
                                            />
                                        </div>
                                        <motion.button
                                            type="button"
                                            className={styles.searchAdmissionBtn}
                                            onClick={handleModalAdmissionSearch}
                                            disabled={modalAdmissionSearchLoading || createLoading}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {modalAdmissionSearchLoading ? (
                                                <>
                                                    <Refresh className={styles.spinner} /> Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <Search /> Load
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </div>

                                <hr className={styles.formDivider} />

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Student Name *</label>
                                        <input
                                            type="text"
                                            value={formData.student_name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, student_name: e.target.value })
                                            }
                                            disabled={createLoading}
                                            className={formData.student_name && modalAdmissionNumber ? styles.filledField : ''}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Parent Name *</label>
                                        <input
                                            type="text"
                                            value={formData.parent_name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, parent_name: e.target.value })
                                            }
                                            disabled={createLoading}
                                            className={formData.parent_name && modalAdmissionNumber ? styles.filledField : ''}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Program</label>
                                        <select
                                            value={formData.program}
                                            onChange={(e) => {
                                                const selectedProgram = e.target.value;
                                                // Auto-fill fees amount if program is selected
                                                const feeStructure = feeStructures.find(f => f.program_name === selectedProgram);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    program: selectedProgram,
                                                    fees_amount: feeStructure ? feeStructure.monthly_fee.toString() : prev.fees_amount
                                                }));
                                            }}
                                            disabled={createLoading}
                                            className={formData.program && modalAdmissionNumber ? styles.filledField : ''}
                                        >
                                            <option value="">Select Program</option>
                                            {feeStructures.map(fee => (
                                                <option key={fee.id} value={fee.program_name}>
                                                    {fee.program_name} (₹{fee.monthly_fee}/month)
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Fees Amount * <span className={styles.required}>(Required)</span></label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.fees_amount}
                                            onChange={(e) =>
                                                setFormData({ ...formData, fees_amount: e.target.value })
                                            }
                                            disabled={createLoading}
                                            placeholder="0.00"
                                            autoFocus
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Month * <span className={styles.required}>(Required)</span></label>
                                        <select
                                            value={formData.month}
                                            onChange={(e) =>
                                                setFormData({ ...formData, month: e.target.value })
                                            }
                                            disabled={createLoading}
                                        >
                                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Year</label>
                                        <input
                                            type="number"
                                            value={formData.year}
                                            onChange={(e) =>
                                                setFormData({ ...formData, year: parseInt(e.target.value) })
                                            }
                                            disabled={createLoading}
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Payment Mode * <span className={styles.required}>(Required)</span></label>
                                        <select
                                            value={formData.payment_mode}
                                            onChange={(e) =>
                                                setFormData({ ...formData, payment_mode: e.target.value })
                                            }
                                            disabled={createLoading}
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="online">Online</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Payment Date * <span className={styles.required}>(Required)</span></label>
                                        <input
                                            type="date"
                                            value={formData.payment_date}
                                            onChange={(e) =>
                                                setFormData({ ...formData, payment_date: e.target.value })
                                            }
                                            disabled={createLoading}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) =>
                                            setFormData({ ...formData, notes: e.target.value })
                                        }
                                        disabled={createLoading}
                                        rows={3}
                                    />
                                </div>

                                <div className={styles.modalActions}>
                                    <motion.button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={() => setShowCreateModal(false)}
                                        disabled={createLoading}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        className={styles.submitBtn}
                                        disabled={createLoading}
                                        whileHover={{ scale: createLoading ? 1 : 1.02 }}
                                        whileTap={{ scale: createLoading ? 1 : 0.98 }}
                                    >
                                        {createLoading ? (
                                            <>
                                                <Refresh className={styles.spinner} /> Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Check /> Create Receipt
                                            </>
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Print Modal */}
            <AnimatePresence>
                {showPrintModal && selectedReceipt && (
                    <motion.div
                        className={styles.printModalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPrintModal(false)}
                    >
                        <motion.div
                            className={styles.printModal}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.printModalHeader}>
                                <h2>Print Receipt</h2>
                                <button
                                    className={styles.closeBtn}
                                    onClick={() => setShowPrintModal(false)}
                                    disabled={printing}
                                >
                                    <Close />
                                </button>
                            </div>

                            <div className={styles.printContent} ref={printRef}>
                                <div className={styles.receiptHeader}>

                                    <img src={schoolLogo.src} alt="School Logo" className={styles.schoolLogo} />
                                    <h3>{schoolDetails.name}</h3>
                                    <p>{schoolDetails.address.street}, {schoolDetails.address.city}</p>
                                    <p>Phone: {schoolDetails.contact.phone}</p>
                                </div>

                                <div className={styles.receiptTitle}>
                                    <h2>FEE RECEIPT</h2>
                                </div>

                                <div className={styles.receiptNumber}>
                                    <p>Receipt #: <strong>{selectedReceipt.receipt_number}</strong></p>
                                    <p>Date: <strong>{new Date(selectedReceipt.payment_date).toLocaleDateString()}</strong></p>
                                </div>

                                <div className={styles.receiptDetails}>
                                    <div className={styles.detailsColumn}>
                                        <h4>Student Details</h4>
                                        <p><strong>Admission #:</strong> {selectedReceipt.admission_number}</p>
                                        <p><strong>Name:</strong> {selectedReceipt.student_name}</p>
                                        <p><strong>Program:</strong> {selectedReceipt.program}</p>
                                    </div>
                                    <div className={styles.detailsColumn}>
                                        <h4>Parent Details</h4>
                                        <p><strong>Name:</strong> {selectedReceipt.parent_name}</p>
                                        <p><strong>Phone:</strong> {selectedReceipt.parent_phone}</p>
                                    </div>
                                </div>

                                <table className={styles.receiptTable}>
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Month</th>
                                            <th>Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Monthly Fees</td>
                                            <td>{selectedReceipt.month} {selectedReceipt.year}</td>
                                            <td className={styles.amount}>₹ {selectedReceipt.fees_amount.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <th colSpan={2}>Total Amount</th>
                                            <th className={styles.totalAmount}>₹ {selectedReceipt.fees_amount.toFixed(2)}</th>
                                        </tr>
                                    </tfoot>
                                </table>

                                <div className={styles.receiptFooter}>
                                    <p><strong>Payment Mode:</strong> {selectedReceipt.payment_mode}</p>
                                    <p><strong>Status:</strong> {selectedReceipt.status.toUpperCase()}</p>
                                    {selectedReceipt.notes && <p><strong>Notes:</strong> {selectedReceipt.notes}</p>}
                                    <p className={styles.thankYou}>Thank you for your payment!</p>
                                </div>
                            </div>

                            <div className={styles.printModalActions}>
                                <motion.button
                                    className={styles.printBtn}
                                    onClick={() => window.print()}
                                    disabled={printing}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Print /> Print
                                </motion.button>
                                <motion.button
                                    className={styles.downloadBtn}
                                    onClick={handleDownloadPDF}
                                    disabled={printing}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {printing ? (
                                        <>
                                            <Refresh className={styles.spinner} /> Downloading...
                                        </>
                                    ) : (
                                        <>
                                            <Download /> Download PDF
                                        </>
                                    )}
                                </motion.button>
                                <motion.button
                                    className={styles.closeModalBtn}
                                    onClick={() => setShowPrintModal(false)}
                                    disabled={printing}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Close /> Close
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReceiptDashboard;

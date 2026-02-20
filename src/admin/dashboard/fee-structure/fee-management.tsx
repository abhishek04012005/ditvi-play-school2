'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './fee-management.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import { Edit, Save, Close, Add, Delete, Settings, TrendingUp, AttachMoney } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import schoolDetailsEng from '@/json/schooldetails-eng';

interface FeeStructure {
    id: string;
    program_name: string;
    monthly_fee: number;
    annual_fee: number | null;
    registration_fee: number | null;
    admission_fee: number | null;
    other_fees: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const FeeManagement = () => {
    const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Form data for editing
    const [editForm, setEditForm] = useState({
        program_name: '',
        monthly_fee: '',
        annual_fee: '',
        registration_fee: '',
        admission_fee: '',
        other_fees: '',
        description: '',
        is_active: true,
    });

    // Form data for adding new
    const [addForm, setAddForm] = useState({
        program_name: '',
        monthly_fee: '',
        annual_fee: '',
        registration_fee: '',
        admission_fee: '',
        other_fees: '',
        description: '',
        is_active: true,
    });

    // Calculate stats
    const totalPrograms = feeStructures.length;
    const activePrograms = feeStructures.filter(f => f.is_active).length;
    const totalMonthlyRevenue = feeStructures.filter(f => f.is_active).reduce((sum, f) => sum + f.monthly_fee, 0);
    const averageMonthlyFee = activePrograms > 0 ? totalMonthlyRevenue / activePrograms : 0;

    // Stats cards
    const statsCards = [
        {
            label: 'Total Programs',
            value: totalPrograms,
            icon: <Settings />,
            color: '#6a4c93',
            bgColor: '#f3e8ff',
        },
        {
            label: 'Active Programs',
            value: activePrograms,
            icon: <TrendingUp />,
            color: '#10b981',
            bgColor: '#ecfdf5',
        },
        {
            label: 'Avg Monthly Fee',
            value: `₹${averageMonthlyFee.toFixed(0)}`,
            icon: <AttachMoney />,
            color: '#f59e0b',
            bgColor: '#fffbeb',
        },
        {
            label: 'Total Monthly Revenue',
            value: `₹${totalMonthlyRevenue.toFixed(0)}`,
            icon: <AttachMoney />,
            color: '#3b82f6',
            bgColor: '#eff6ff',
        },
    ];

    useEffect(() => {
        fetchFeeStructures();
    }, []);

    const fetchFeeStructures = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('fee_structure')
                .select('*')
                .order('program_name');

            if (error) {
                console.error('Error fetching fee structures:', error);
                toast.error('Failed to fetch fee structures');
                return;
            }

            setFeeStructures(data || []);
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error fetching fee structures');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (fee: FeeStructure) => {
        setEditingId(fee.id);
        setEditForm({
            program_name: fee.program_name,
            monthly_fee: fee.monthly_fee.toString(),
            annual_fee: fee.annual_fee?.toString() || '',
            registration_fee: fee.registration_fee?.toString() || '',
            admission_fee: fee.admission_fee?.toString() || '',
            other_fees: fee.other_fees || '',
            description: fee.description || '',
            is_active: fee.is_active,
        });
    };

    const handleSave = async () => {
        if (!editingId) return;

        try {
            const { error } = await supabase
                .from('fee_structure')
                .update({
                    program_name: editForm.program_name,
                    monthly_fee: parseFloat(editForm.monthly_fee),
                    annual_fee: editForm.annual_fee ? parseFloat(editForm.annual_fee) : null,
                    registration_fee: editForm.registration_fee ? parseFloat(editForm.registration_fee) : null,
                    admission_fee: editForm.admission_fee ? parseFloat(editForm.admission_fee) : null,
                    other_fees: editForm.other_fees || null,
                    description: editForm.description || null,
                    is_active: editForm.is_active,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', editingId);

            if (error) {
                toast.error('Failed to update fee structure');
                return;
            }

            toast.success('Fee structure updated successfully!');
            setEditingId(null);
            fetchFeeStructures();
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error updating fee structure');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditForm({
            program_name: '',
            monthly_fee: '',
            annual_fee: '',
            registration_fee: '',
            admission_fee: '',
            other_fees: '',
            description: '',
            is_active: true,
        });
    };

    const handleAdd = async () => {
        if (!addForm.program_name.trim() || !addForm.monthly_fee) {
            toast.error('Program name and monthly fee are required');
            return;
        }

        try {
            const { error } = await supabase
                .from('fee_structure')
                .insert([{
                    program_name: addForm.program_name,
                    monthly_fee: parseFloat(addForm.monthly_fee),
                    annual_fee: addForm.annual_fee ? parseFloat(addForm.annual_fee) : null,
                    registration_fee: addForm.registration_fee ? parseFloat(addForm.registration_fee) : null,
                    admission_fee: addForm.admission_fee ? parseFloat(addForm.admission_fee) : null,
                    other_fees: addForm.other_fees || null,
                    description: addForm.description || null,
                    is_active: addForm.is_active,
                }]);

            if (error) {
                toast.error('Failed to add fee structure');
                return;
            }

            toast.success('Fee structure added successfully!');
            setShowAddModal(false);
            setAddForm({
                program_name: '',
                monthly_fee: '',
                annual_fee: '',
                registration_fee: '',
                admission_fee: '',
                other_fees: '',
                description: '',
                is_active: true,
            });
            fetchFeeStructures();
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error adding fee structure');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this fee structure?')) return;

        try {
            const { error } = await supabase
                .from('fee_structure')
                .delete()
                .eq('id', id);

            if (error) {
                toast.error('Failed to delete fee structure');
                return;
            }

            toast.success('Fee structure deleted successfully!');
            fetchFeeStructures();
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error deleting fee structure');
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('fee_structure')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) {
                toast.error('Failed to update status');
                return;
            }

            toast.success('Status updated successfully!');
            fetchFeeStructures();
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error updating status');
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <HeadingTitle text="Fee Structure Management" />
                <motion.div
                    className={styles.loading}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className={styles.spinner}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Loading fee structures...
                </motion.div>
            </div>
        );
    }

    return (
        <motion.div
            className={styles.container}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <HeadingTitle text="Fee Structure Management" />

            {/* Stats Cards */}
            <motion.div
                className={styles.statsSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                {statsCards.map((card, index) => (
                    <motion.div
                        key={card.label}
                        className={styles.statCard}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                    >
                        <div
                            className={styles.statIcon}
                            style={{ color: card.color, backgroundColor: card.bgColor }}
                        >
                            {card.icon}
                        </div>
                        <div className={styles.statContent}>
                            <p className={styles.statLabel}>{card.label}</p>
                            <p className={styles.statValue} style={{ color: card.color }}>
                                {card.value}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Header */}
            <motion.div
                className={styles.header}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <div>
                    <h2><Settings /> Manage Program Fees</h2>
                    <p className={styles.subtitle}>Configure fee structures for all programs</p>
                </div>
                <motion.button
                    className={styles.addBtn}
                    onClick={() => setShowAddModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Add /> Add Fee Structure
                </motion.button>
            </motion.div>

            {/* Table */}
            <motion.div
                className={styles.tableContainer}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Program</th>
                            <th>Monthly Fee</th>
                            <th>Annual Fee</th>
                            <th>Registration Fee</th>
                            <th>Admission Fee</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {feeStructures.map((fee, index) => (
                                <motion.tr
                                    key={fee.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <td>
                                        {editingId === fee.id ? (
                                            <motion.select
                                                value={editForm.program_name}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, program_name: e.target.value }))}
                                                className={styles.input}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                            >
                                                <option value="">Select Program</option>
                                                {schoolDetailsEng.programs.map((program) => (
                                                    <option key={program.name} value={program.name}>{program.name}</option>
                                                ))}
                                            </motion.select>
                                        ) : (
                                            <div className={styles.programCell}>
                                                <strong>{fee.program_name}</strong>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === fee.id ? (
                                            <motion.input
                                                type="number"
                                                value={editForm.monthly_fee}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, monthly_fee: e.target.value }))}
                                                className={styles.input}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                            />
                                        ) : (
                                            <span className={styles.amount}>₹{fee.monthly_fee.toLocaleString()}</span>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === fee.id ? (
                                            <motion.input
                                                type="number"
                                                value={editForm.annual_fee}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, annual_fee: e.target.value }))}
                                                className={styles.input}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                            />
                                        ) : (
                                            fee.annual_fee ? <span className={styles.amount}>₹{fee.annual_fee.toLocaleString()}</span> : <span className={styles.na}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === fee.id ? (
                                            <motion.input
                                                type="number"
                                                value={editForm.registration_fee}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, registration_fee: e.target.value }))}
                                                className={styles.input}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                            />
                                        ) : (
                                            fee.registration_fee ? <span className={styles.amount}>₹{fee.registration_fee.toLocaleString()}</span> : <span className={styles.na}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === fee.id ? (
                                            <motion.input
                                                type="number"
                                                value={editForm.admission_fee}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, admission_fee: e.target.value }))}
                                                className={styles.input}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                            />
                                        ) : (
                                            fee.admission_fee ? <span className={styles.amount}>₹{fee.admission_fee.toLocaleString()}</span> : <span className={styles.na}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <motion.button
                                            className={`${styles.statusBtn} ${fee.is_active ? styles.active : styles.inactive}`}
                                            onClick={() => handleToggleActive(fee.id, fee.is_active)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {fee.is_active ? 'Active' : 'Inactive'}
                                        </motion.button>
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <AnimatePresence mode="wait">
                                                {editingId === fee.id ? (
                                                    <motion.div
                                                        key="editing"
                                                        className={styles.editActions}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                    >
                                                        <motion.button
                                                            className={styles.saveBtn}
                                                            onClick={handleSave}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Save />
                                                        </motion.button>
                                                        <motion.button
                                                            className={styles.cancelBtn}
                                                            onClick={handleCancel}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Close />
                                                        </motion.button>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="actions"
                                                        className={styles.viewActions}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8 }}
                                                    >
                                                        <motion.button
                                                            className={styles.editBtn}
                                                            onClick={() => handleEdit(fee)}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Edit />
                                                        </motion.button>
                                                        <motion.button
                                                            className={styles.deleteBtn}
                                                            onClick={() => handleDelete(fee.id)}
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <Delete />
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </motion.div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        className={styles.modal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h3><Add /> Add Fee Structure</h3>
                                <motion.button
                                    className={styles.closeModalBtn}
                                    onClick={() => setShowAddModal(false)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Close />
                                </motion.button>
                            </div>
                            <div className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label>Program Name *</label>
                                    <select
                                        value={addForm.program_name}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, program_name: e.target.value }))}
                                    >
                                        <option value="">Select Program</option>
                                        {schoolDetailsEng.programs.map((program) => (
                                            <option key={program.name} value={program.name}>{program.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Monthly Fee *</label>
                                    <input
                                        type="number"
                                        value={addForm.monthly_fee}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, monthly_fee: e.target.value }))}
                                        placeholder="e.g., 8500"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Annual Fee</label>
                                    <input
                                        type="number"
                                        value={addForm.annual_fee}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, annual_fee: e.target.value }))}
                                        placeholder="e.g., 102000"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Registration Fee</label>
                                    <input
                                        type="number"
                                        value={addForm.registration_fee}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, registration_fee: e.target.value }))}
                                        placeholder="e.g., 2000"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Admission Fee</label>
                                    <input
                                        type="number"
                                        value={addForm.admission_fee}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, admission_fee: e.target.value }))}
                                        placeholder="e.g., 5000"
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Description</label>
                                    <textarea
                                        value={addForm.description}
                                        onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Program description"
                                    />
                                </div>
                            </div>
                            <div className={styles.modalActions}>
                                <motion.button
                                    className={styles.cancelBtn}
                                    onClick={() => setShowAddModal(false)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Cancel
                                </motion.button>
                                <motion.button
                                    className={styles.saveBtn}
                                    onClick={handleAdd}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Add /> Add Structure
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default FeeManagement;
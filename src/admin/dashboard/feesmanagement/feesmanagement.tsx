'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './feesmanagement.module.css';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { schoolDetailsEng } from '@/json/schooldetails-eng';
import HeadingTitle from '@/components/heading/headingtitle';
import {
    Edit,
    Delete,
    Add,
    Close,
    CheckCircle,
    Search,
} from '@mui/icons-material';

interface Fee {
    id: string;
    program_name: string;
    description: string;
    monthly_fee: number;
    annual_fee: number;
    registration_fee: number;
    admission_fee: number;
    uniform_fee: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const FeesManagement = () => {
    const [fees, setFees] = useState<Fee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        program_name: '',
        description: '',
        monthly_fee: '',
        annual_fee: '',
        registration_fee: '',
        admission_fee: '',
        uniform_fee: '',
    });

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('fees')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error fetching fees:', error);
                toast.error('Failed to fetch fees');
                return;
            }

            setFees(data || []);
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error fetching fees');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (fee?: Fee) => {
        if (fee) {
            setEditingId(fee.id);
            setFormData({
                program_name: fee.program_name,
                description: fee.description,
                monthly_fee: fee.monthly_fee.toString(),
                annual_fee: fee.annual_fee.toString(),
                registration_fee: fee.registration_fee.toString(),
                admission_fee: fee.admission_fee.toString(),
                uniform_fee: fee.uniform_fee.toString(),
            });
        } else {
            setEditingId(null);
            setFormData({
                program_name: '',
                description: '',
                monthly_fee: '',
                annual_fee: '',
                registration_fee: '',
                admission_fee: '',
                uniform_fee: '',
            });
        }
        setShowModal(true);
    };

    const handleProgramChange = (programName: string) => {
        const selectedProgram = schoolDetailsEng.programs.find(
            (p) => p.name === programName
        );
        if (selectedProgram) {
            setFormData({
                program_name: selectedProgram.name,
                description: selectedProgram.description || '',
                monthly_fee: formData.monthly_fee,
                annual_fee: formData.annual_fee,
                registration_fee: formData.registration_fee,
                admission_fee: formData.admission_fee,
                uniform_fee: formData.uniform_fee,
            });
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingId(null);
        setFormData({
            program_name: '',
            description: '',
            monthly_fee: '',
            annual_fee: '',
            registration_fee: '',
            admission_fee: '',
            uniform_fee: '',
        });
    };

    const validateForm = () => {
        if (!formData.program_name.trim()) {
            toast.error('Program name is required');
            return false;
        }
        if (!formData.monthly_fee || parseFloat(formData.monthly_fee) <= 0) {
            toast.error('Monthly fee must be greater than 0');
            return false;
        }
        if (!formData.annual_fee || parseFloat(formData.annual_fee) <= 0) {
            toast.error('Annual fee must be greater than 0');
            return false;
        }
        if (formData.registration_fee && parseFloat(formData.registration_fee) < 0) {
            toast.error('Registration fee must be 0 or greater');
            return false;
        }
        if (formData.admission_fee && parseFloat(formData.admission_fee) < 0) {
            toast.error('Admission fee must be 0 or greater');
            return false;
        }
        if (formData.uniform_fee && parseFloat(formData.uniform_fee) < 0) {
            toast.error('Uniform fee must be 0 or greater');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSubmitting(true);

            const feeData = {
                program_name: formData.program_name.trim(),
                description: formData.description.trim(),
                monthly_fee: parseFloat(formData.monthly_fee),
                annual_fee: parseFloat(formData.annual_fee),
                registration_fee: formData.registration_fee ? parseFloat(formData.registration_fee) : 0,
                admission_fee: formData.admission_fee ? parseFloat(formData.admission_fee) : 0,
                uniform_fee: formData.uniform_fee ? parseFloat(formData.uniform_fee) : 0,
            };

            if (editingId) {
                // Update existing fee
                const { error } = await supabase
                    .from('fees')
                    .update(feeData)
                    .eq('id', editingId);

                if (error) {
                    toast.error('Failed to update fee');
                    console.error('Error:', error);
                    return;
                }

                toast.success('Fee updated successfully!');
            } else {
                // Create new fee
                const { error } = await supabase
                    .from('fees')
                    .insert([feeData]);

                if (error) {
                    if (error.code === '23505') {
                        toast.error('This program name already exists');
                    } else {
                        toast.error('Failed to create fee');
                    }
                    console.error('Error:', error);
                    return;
                }

                toast.success('Fee created successfully!');
            }

            await fetchFees();
            handleCloseModal();
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error saving fee');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this fee? This action cannot be undone.')) {
            return;
        }

        try {
            setSubmitting(true);

            const { error } = await supabase
                .from('fees')
                .delete()
                .eq('id', id);

            if (error) {
                toast.error('Failed to delete fee');
                console.error('Error:', error);
                return;
            }

            toast.success('Fee deleted successfully!');
            await fetchFees();
        } catch (err) {
            console.error('Error:', err);
            toast.error('Error deleting fee');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredFees = fees.filter(fee =>
        fee.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className={styles.container}>
                <p>Loading fees...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <HeadingTitle text="Fees Management" />

            {/* Header Section */}
            <div className={styles.header}>
                <div className={styles.searchBar}>
                    <Search sx={{ color: '#9ca3af' }} />
                    <input
                        type="text"
                        placeholder="Search by program name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <motion.button
                    className={styles.createBtn}
                    onClick={() => handleOpenModal()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Add sx={{ fontSize: '1.3rem' }} /> Add New Fee
                </motion.button>
            </div>

            {/* Fees Table */}
            <motion.div
                className={styles.tableWrapper}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {filteredFees.length === 0 ? (
                    <div className={styles.noData}>
                        <p>No fees found</p>
                    </div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Program Name</th>
                                <th>Description</th>
                                <th>Monthly Fee</th>
                                <th>Annual Fee</th>
                                <th>Registration Fee</th>
                                <th>Admission Fee</th>
                                <th>Uniform Fee</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFees.map((fee) => (
                                <motion.tr
                                    key={fee.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <td className={styles.programName}>
                                        <strong>{fee.program_name}</strong>
                                    </td>
                                    <td className={styles.description}>
                                        {fee.description}
                                    </td>
                                    <td className={styles.fee}>
                                        ₹ {fee.monthly_fee.toLocaleString()}
                                    </td>
                                    <td className={styles.fee}>
                                        ₹ {fee.annual_fee.toLocaleString()}
                                    </td>
                                    <td className={styles.fee}>
                                        ₹ {fee.registration_fee.toLocaleString()}
                                    </td>
                                    <td className={styles.fee}>
                                        ₹ {fee.admission_fee.toLocaleString()}
                                    </td>
                                    <td className={styles.fee}>
                                        ₹ {fee.uniform_fee.toLocaleString()}
                                    </td>
                                    <td className={styles.actions}>
                                        <motion.button
                                            className={styles.editBtn}
                                            onClick={() => handleOpenModal(fee)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            title="Edit fee"
                                        >
                                            <Edit sx={{ fontSize: '1.2rem' }} />
                                        </motion.button>
                                        <motion.button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(fee.id)}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            title="Delete fee"
                                            disabled={submitting}
                                        >
                                            <Delete sx={{ fontSize: '1.2rem' }} />
                                        </motion.button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className={styles.modalOverlay}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseModal}
                    >
                        <motion.div
                            className={styles.modal}
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className={styles.modalHeader}>
                                <h2>{editingId ? 'Edit Fee' : 'Add New Fee'}</h2>
                                <button
                                    className={styles.closeBtn}
                                    onClick={handleCloseModal}
                                    disabled={submitting}
                                >
                                    <Close sx={{ fontSize: '1.3rem' }} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGroup}>
                                    <label>Program Name *</label>
                                    <select
                                        value={formData.program_name}
                                        onChange={(e) => handleProgramChange(e.target.value)}
                                        disabled={submitting || !!editingId}
                                        title={editingId ? 'Program name cannot be changed' : ''}
                                    >
                                        <option value="">Select a program</option>
                                        {schoolDetailsEng.programs.map((program) => (
                                            <option key={program.name} value={program.name}>
                                                {program.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="e.g., Age: 1.5 - 2.5 years"
                                        disabled={submitting}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Monthly Fee * (₹)</label>
                                        <input
                                            type="number"
                                            step="100"
                                            min="0"
                                            value={formData.monthly_fee}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    monthly_fee: e.target.value,
                                                })
                                            }
                                            placeholder="6000"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Annual Fee * (₹)</label>
                                        <input
                                            type="number"
                                            step="100"
                                            min="0"
                                            value={formData.annual_fee}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    annual_fee: e.target.value,
                                                })
                                            }
                                            placeholder="72000"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Registration Fee (₹)</label>
                                        <input
                                            type="number"
                                            step="100"
                                            min="0"
                                            value={formData.registration_fee}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    registration_fee: e.target.value,
                                                })
                                            }
                                            placeholder="2000"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Admission Fee (₹)</label>
                                        <input
                                            type="number"
                                            step="100"
                                            min="0"
                                            value={formData.admission_fee}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    admission_fee: e.target.value,
                                                })
                                            }
                                            placeholder="1000"
                                            disabled={submitting}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Uniform Fee (₹)</label>
                                        <input
                                            type="number"
                                            step="100"
                                            min="0"
                                            value={formData.uniform_fee}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    uniform_fee: e.target.value,
                                                })
                                            }
                                            placeholder="1500"
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <motion.button
                                        type="submit"
                                        className={styles.submitBtn}
                                        disabled={submitting}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <CheckCircle sx={{ fontSize: '1.2rem' }} /> {submitting ? 'Saving...' : editingId ? 'Update Fee' : 'Create Fee'}
                                    </motion.button>
                                    <motion.button
                                        type="button"
                                        className={styles.cancelBtn}
                                        onClick={handleCloseModal}
                                        disabled={submitting}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        Cancel
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FeesManagement;

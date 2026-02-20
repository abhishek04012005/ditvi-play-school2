'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './fee-management.module.css';
import HeadingTitle from '@/components/heading/headingtitle';
import { FaEdit, FaSave, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
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
                <div className={styles.loading}>Loading...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <HeadingTitle text="Fee Structure Management" />

            <div className={styles.header}>
                <h2>Manage Program Fees</h2>
                <button
                    className={styles.addBtn}
                    onClick={() => setShowAddModal(true)}
                >
                    <FaPlus /> Add Fee Structure
                </button>
            </div>

            <div className={styles.tableContainer}>
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
                        {feeStructures.map((fee) => (
                            <tr key={fee.id}>
                                <td>
                                    {editingId === fee.id ? (
                                        <select
                                            value={editForm.program_name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, program_name: e.target.value }))}
                                            className={styles.input}
                                        >
                                            <option value="">Select Program</option>
                                            {schoolDetailsEng.programs.map((program) => (
                                                <option key={program.name} value={program.name}>{program.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        fee.program_name
                                    )}
                                </td>
                                <td>
                                    {editingId === fee.id ? (
                                        <input
                                            type="number"
                                            value={editForm.monthly_fee}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, monthly_fee: e.target.value }))}
                                            className={styles.input}
                                        />
                                    ) : (
                                        `₹${fee.monthly_fee}`
                                    )}
                                </td>
                                <td>
                                    {editingId === fee.id ? (
                                        <input
                                            type="number"
                                            value={editForm.annual_fee}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, annual_fee: e.target.value }))}
                                            className={styles.input}
                                        />
                                    ) : (
                                        fee.annual_fee ? `₹${fee.annual_fee}` : '-'
                                    )}
                                </td>
                                <td>
                                    {editingId === fee.id ? (
                                        <input
                                            type="number"
                                            value={editForm.registration_fee}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, registration_fee: e.target.value }))}
                                            className={styles.input}
                                        />
                                    ) : (
                                        fee.registration_fee ? `₹${fee.registration_fee}` : '-'
                                    )}
                                </td>
                                <td>
                                    {editingId === fee.id ? (
                                        <input
                                            type="number"
                                            value={editForm.admission_fee}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, admission_fee: e.target.value }))}
                                            className={styles.input}
                                        />
                                    ) : (
                                        fee.admission_fee ? `₹${fee.admission_fee}` : '-'
                                    )}
                                </td>
                                <td>
                                    <button
                                        className={`${styles.statusBtn} ${fee.is_active ? styles.active : styles.inactive}`}
                                        onClick={() => handleToggleActive(fee.id, fee.is_active)}
                                    >
                                        {fee.is_active ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td>
                                    <div className={styles.actions}>
                                        {editingId === fee.id ? (
                                            <>
                                                <button
                                                    className={styles.saveBtn}
                                                    onClick={handleSave}
                                                >
                                                    <FaSave />
                                                </button>
                                                <button
                                                    className={styles.cancelBtn}
                                                    onClick={handleCancel}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => handleEdit(fee)}
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDelete(fee.id)}
                                                >
                                                    <FaTrash />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Add Fee Structure</h3>
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
                            <button className={styles.cancelBtn} onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button className={styles.saveBtn} onClick={handleAdd}>
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeeManagement;
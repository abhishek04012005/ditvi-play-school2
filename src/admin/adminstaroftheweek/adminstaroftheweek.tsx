'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import styles from './adminstaroftheweek.module.css';

const StarOfWeekAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        class: '',
        reason: '',
        start_date: '',
        end_date: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!imageFile) {
                throw new Error('Please select an image');
            }

            // Upload image
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const { error: uploadError, data: uploadData } = await supabase.storage
                .from('star-of-week-images')
                .upload(fileName, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('star-of-week-images')
                .getPublicUrl(fileName);

            // Save star of the week data
            const { error } = await supabase
                .from('star_of_the_week')
                .insert([
                    {
                        ...formData,
                        image_url: publicUrl
                    }
                ]);

            if (error) throw error;

            toast.success('Star of the Week updated successfully!');
            
            // Reset form
            setFormData({
                name: '',
                class: '',
                reason: '',
                start_date: '',
                end_date: ''
            });
            setImageFile(null);
            
        } catch (error: any) {
            console.error('Error:', error);
            toast.error(error.message || 'Failed to update Star of the Week');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.staroftheweek}>
            <div className={styles.adminContainer}>
                <h1>Manage Star of the Week</h1>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Student Name</label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="class">Class</label>
                        <input
                            type="text"
                            id="class"
                            value={formData.class}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                class: e.target.value
                            }))}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="image">Student Image</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="reason">Achievement/Reason</label>
                        <textarea
                            id="reason"
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                reason: e.target.value
                            }))}
                            required
                        />
                    </div>

                    <div className={styles.dateGroup}>
                        <div className={styles.formGroup}>
                            <label htmlFor="start_date">Start Date</label>
                            <input
                                type="date"
                                id="start_date"
                                value={formData.start_date}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    start_date: e.target.value
                                }))}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="end_date">End Date</label>
                            <input
                                type="date"
                                id="end_date"
                                value={formData.end_date}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    end_date: e.target.value
                                }))}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Star of the Week'}
                    </button>
                </form>
            </div>
        </section>
    );
};

export default StarOfWeekAdmin;
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaTimes,
    FaWhatsapp,
    FaFacebook,
    FaTwitter,
    FaLinkedin,
    FaLink,
    FaCheck,
    FaEnvelope,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './ShareModal.module.css';

export interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    award: {
        id: string;
        name: string;
        message: string;
        image_url: string;
        children_photos?: string[]; // Array of photo URLs
    };
    baseUrl?: string;
}

export const ShareModal = ({
    isOpen,
    onClose,
    award,
    baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://anksquare.com',
}: ShareModalProps) => {
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);

    // Generate shareable URL
    const shareUrl = `${baseUrl}/spotlight?award=${award.id}`;
    const shareTitle = `🌟 ${award.name} - Anksquare Kids Spotlight`;
    const shareMessage = `${award.name} was recognized as our Star of the Week! [AWARD]\n\n"${award.message}"\n\n[CONGRATS] Check out this amazing achievement!`;

    // [COPY] COPY TO CLIPBOARD
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard! 📋');
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    // [SHARE] SHARE VIA WHATSAPP
    const handleShareWhatsApp = () => {
        setSharing(true);
        
        // Build message with photos
        let message = shareMessage;
        
        // Add children photos if available
        if (award.children_photos && award.children_photos.length > 0) {
            message += '\n\n📸 Children Photos:\n';
            award.children_photos.forEach((photo, index) => {
                message += `${photo}\n`;
            });
        }
        
        message += `\n${shareUrl}`;
        
        const text = encodeURIComponent(message);
        const url = `https://wa.me/?text=${text}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => setSharing(false), 500);
    };

    // [SHARE] SHARE VIA FACEBOOK
    const handleShareFacebook = () => {
        setSharing(true);
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
        )}&quote=${encodeURIComponent(shareTitle)}`;
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
        setTimeout(() => setSharing(false), 500);
    };

    // [SHARE] SHARE VIA TWITTER
    const handleShareTwitter = () => {
        setSharing(true);
        const text = encodeURIComponent(
            `${award.name} was recognized as our Star of the Week! [AWARD]\n\n"${award.message}"\n\n[CONGRATS] Check out this amazing achievement!\n\n${shareUrl}`
        );
        const url = `https://twitter.com/intent/tweet?text=${text}&hashtags=anksquare,StarOfTheWeek,Excellence`;
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
        setTimeout(() => setSharing(false), 500);
    };

    // [SHARE] SHARE VIA LINKEDIN
    const handleShareLinkedIn = () => {
        setSharing(true);
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            shareUrl
        )}`;
        window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
        setTimeout(() => setSharing(false), 500);
    };

    // [SHARE] SHARE VIA EMAIL
    const handleShareEmail = () => {
        setSharing(true);
        const subject = encodeURIComponent(shareTitle);
        const body = encodeURIComponent(
            `${shareMessage}\n\nView full details: ${shareUrl}`
        );
        const url = `mailto:?subject=${subject}&body=${body}`;
        window.location.href = url;
        setTimeout(() => setSharing(false), 500);
    };

    // [SHARE] SHARE VIA WEB SHARE API (for mobile)
    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                setSharing(true);
                await navigator.share({
                    title: shareTitle,
                    text: shareMessage,
                    url: shareUrl,
                });
                toast.success('Shared successfully! 🎉');
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    toast.error('Failed to share');
                }
            } finally {
                setSharing(false);
            }
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
                        className={styles.shareModal}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    >
                        {/* Header */}
                        <div className={styles.modalHeader}>
                            <h2>🎉 Share This Achievement</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={onClose}
                                disabled={sharing}
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Preview */}
                        <div className={styles.previewSection}>
                            <p className={styles.previewTitle}>Preview:</p>
                            <div className={styles.previewBox}>
                                <strong>{award.name}</strong>
                                <p>{award.message}</p>
                            </div>

                            {/* Children Photos Gallery */}
                            {award.children_photos && award.children_photos.length > 0 && (
                                <div className={styles.childrenPhotosGallery}>
                                    <p className={styles.childrenPhotosTitle}>Children Photos:</p>
                                    <div className={styles.photosGrid}>
                                        {award.children_photos.map((photo, index) => (
                                            <motion.div
                                                key={index}
                                                className={styles.photoThumbnail}
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <img
                                                    src={photo}
                                                    alt={`Child ${index + 1}`}
                                                    className={styles.childPhoto}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Share Options */}
                        <div className={styles.shareOptions}>
                            <motion.button
                                className={styles.shareBtn}
                                onClick={handleShareWhatsApp}
                                disabled={sharing}
                                whileHover={{ scale: sharing ? 1 : 1.05 }}
                                whileTap={{ scale: sharing ? 1 : 0.95 }}
                                title="Share on WhatsApp"
                            >
                                <FaWhatsapp /> WhatsApp
                            </motion.button>

                            <motion.button
                                className={styles.shareBtn}
                                onClick={handleShareFacebook}
                                disabled={sharing}
                                whileHover={{ scale: sharing ? 1 : 1.05 }}
                                whileTap={{ scale: sharing ? 1 : 0.95 }}
                                title="Share on Facebook"
                            >
                                <FaFacebook /> Facebook
                            </motion.button>

                            <motion.button
                                className={styles.shareBtn}
                                onClick={handleShareTwitter}
                                disabled={sharing}
                                whileHover={{ scale: sharing ? 1 : 1.05 }}
                                whileTap={{ scale: sharing ? 1 : 0.95 }}
                                title="Share on Twitter"
                            >
                                <FaTwitter /> Twitter
                            </motion.button>

                            <motion.button
                                className={styles.shareBtn}
                                onClick={handleShareLinkedIn}
                                disabled={sharing}
                                whileHover={{ scale: sharing ? 1 : 1.05 }}
                                whileTap={{ scale: sharing ? 1 : 0.95 }}
                                title="Share on LinkedIn"
                            >
                                <FaLinkedin /> LinkedIn
                            </motion.button>

                            <motion.button
                                className={styles.shareBtn}
                                onClick={handleShareEmail}
                                disabled={sharing}
                                whileHover={{ scale: sharing ? 1 : 1.05 }}
                                whileTap={{ scale: sharing ? 1 : 0.95 }}
                                title="Share via Email"
                            >
                                <FaEnvelope /> Email
                            </motion.button>

                            {typeof navigator !== 'undefined' && 'share' in navigator && (
                                <motion.button
                                    className={styles.shareBtn}
                                    onClick={handleNativeShare}
                                    disabled={sharing}
                                    whileHover={{ scale: sharing ? 1 : 1.05 }}
                                    whileTap={{ scale: sharing ? 1 : 0.95 }}
                                    title="More sharing options"
                                >
                                    ⋮ More
                                </motion.button>
                            )}
                        </div>

                        {/* Copy Link Section */}
                        <div className={styles.copySection}>
                            <p className={styles.copyLabel}>Or copy link:</p>
                            <div className={styles.copyLinkBox}>
                                <input
                                    type="text"
                                    value={shareUrl}
                                    readOnly
                                    className={styles.linkInput}
                                />
                                <motion.button
                                    className={`${styles.copyBtn} ${
                                        copied ? styles.copied : ''
                                    }`}
                                    onClick={handleCopyLink}
                                    disabled={sharing}
                                    whileHover={{ scale: sharing ? 1 : 1.05 }}
                                    whileTap={{ scale: sharing ? 1 : 0.95 }}
                                >
                                    {copied ? (
                                        <>
                                            <FaCheck /> Copied
                                        </>
                                    ) : (
                                        <>
                                            <FaLink /> Copy
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className={styles.modalFooter}>
                            <p className={styles.footerText}>
                                [STAR] Share this amazing achievement with your network!
                            </p>
                            <motion.button
                                className={styles.closeMainBtn}
                                onClick={onClose}
                                disabled={sharing}
                                whileHover={{ scale: sharing ? 1 : 1.05 }}
                                whileTap={{ scale: sharing ? 1 : 0.95 }}
                            >
                                <FaTimes /> Close
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ShareModal;

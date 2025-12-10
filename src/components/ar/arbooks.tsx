'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FaStar, FaEye, FaArrowRight, FaFilter, FaSearch, FaBook, FaMagic } from 'react-icons/fa';
import styles from './arbooks.module.css';
import { ARBook, ARBookCategory } from '@/ar/types';
import { arBooks, arBookCategories } from '@/ar/data';
import HeadingTitle from '@/components/heading/headingtitle';
import LineArt from '@/custom/lineart/lineart';

interface ARBooksProps {
    isHomePage?: boolean;
    featuredOnly?: boolean;
}

const ARBooks: React.FC<ARBooksProps> = ({ isHomePage = false, featuredOnly = false }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredBooks, setFilteredBooks] = useState<ARBook[]>(arBooks);

    // Filter books based on category and search
    React.useEffect(() => {
        let result = arBooks;

        if (featuredOnly) {
            result = result.filter(book => book.isFeatured);
        }

        if (selectedCategory) {
            result = result.filter(book => book.category === selectedCategory);
        }

        if (searchTerm) {
            result = result.filter(book =>
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredBooks(result);
    }, [selectedCategory, searchTerm, featuredOnly]);

    if (isHomePage) {
        return (
            <section className={styles.arBooksHome}>
                {/* Background LineArt Elements */}
                <div className={styles.bgLineArtTop}>
                    <LineArt
                        circle={{
                            size: 180,
                            borderColor: 'rgba(106, 76, 147, 0.15)',
                            borderWidth: 2,
                            borderStyle: 'dashed',
                            top: '-50px',
                            left: '-50px',
                        }}
                        dot={{
                            size: 12,
                            color: 'rgba(255, 191, 0, 0.2)',
                            top: '80px',
                            right: '10%',
                            show: true,
                        }}
                    />
                </div>

                <div className={styles.bgLineArtBottom}>
                    <LineArt
                        circle={{
                            size: 200,
                            borderColor: 'rgba(255, 191, 0, 0.15)',
                            borderWidth: 2,
                            borderStyle: 'dotted',
                            bottom: '-80px',
                            right: '-80px',
                        }}
                        dot={{
                            size: 15,
                            color: 'rgba(106, 76, 147, 0.15)',
                            bottom: '100px',
                            left: '15%',
                            show: true,
                        }}
                    />
                </div>

                <div className={styles.homeContainer}>
                    <motion.div
                        className={styles.headerSection}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        <div className={styles.titleWrapper}>
                            <motion.div
                                className={styles.iconBadge}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            >
                                <FaMagic />
                            </motion.div>
                            <HeadingTitle text="AR Books" />
                        </div>

                        <motion.p
                            className={styles.tagline}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            Transform learning into an immersive experience with our interactive AR books.
                            <span className={styles.highlight}> Watch stories come alive in 3D</span> right before your eyes!
                        </motion.p>
                    </motion.div>

                    {/* Featured Books Grid */}
                    <motion.div
                        className={styles.homeBooksGrid}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        {arBooks.filter(b => b.isFeatured).slice(0, 3).map((book, index) => (
                            <motion.div
                                key={book.id}
                                className={styles.bookCard}
                                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: index * 0.15, duration: 0.6 }}
                                viewport={{ once: true }}
                                whileHover={{ translateY: -12, boxShadow: '0 20px 40px rgba(106, 76, 147, 0.25)' }}
                            >
                                <div className={styles.bookCardInner}>
                                    {/* Cover Section */}
                                    <div className={styles.bookCover}>
                                        <img src={book.coverImage} alt={book.title} />
                                        
                                        {/* Featured Badge with Glow */}
                                        {book.isFeatured && (
                                            <motion.div
                                                className={styles.featuredBadge}
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <FaMagic /> Featured
                                            </motion.div>
                                        )}

                                        {/* Interactive Overlay */}
                                        <div className={styles.bookOverlay}>
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                whileHover={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className={styles.overlayContent}
                                            >
                                                <div className={styles.statsPreview}>
                                                    <div className={styles.stat}>
                                                        <FaBook /> {book.pages.length} Pages
                                                    </div>
                                                    <div className={styles.stat}>
                                                        <FaStar /> {book.rating}
                                                    </div>
                                                </div>
                                                <Link href={`/ar-books/${book.id}`}>
                                                    <motion.button
                                                        className={styles.viewBtn}
                                                        whileHover={{ scale: 1.15 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FaMagic /> Start Reading
                                                    </motion.button>
                                                </Link>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Info Section */}
                                    <div className={styles.bookInfo}>
                                        <div className={styles.bookCategory}>
                                            {book.category.toUpperCase()}
                                        </div>
                                        <motion.h4
                                            whileHover={{ color: '#6a4c93' }}
                                            className={styles.bookTitle}
                                        >
                                            {book.title}
                                        </motion.h4>
                                        <p className={styles.description}>{book.description}</p>

                                        <div className={styles.bookFooter}>
                                            <div className={styles.bookStats}>
                                                <span className={styles.rating}>
                                                    <FaStar /> {book.rating}
                                                </span>
                                                <span className={styles.views}>
                                                    <FaEye /> {book.views.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className={styles.ageGroup}>
                                                Age {book.ageGroup}+
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* View All Button with Enhanced Design */}
                    <motion.div
                        className={styles.viewAllContainer}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/ar-books">
                            <motion.button
                                className={styles.viewAllBtn}
                                whileHover={{ 
                                    scale: 1.08,
                                    boxShadow: '0 15px 40px rgba(106, 76, 147, 0.4)'
                                }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FaMagic className={styles.btnIcon} />
                                Explore All AR Books
                                <FaArrowRight className={styles.btnArrow} />
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        );
    }

    // Full AR Books Page View
    return (
        <div className={styles.arBooksPage}>
            {/* Background LineArt Elements */}
            <div className={styles.pageLineArtTop}>
                <LineArt
                    circle={{
                        size: 200,
                        borderColor: 'rgba(106, 76, 147, 0.1)',
                        borderWidth: 2,
                        borderStyle: 'dashed',
                        top: '-100px',
                        left: '-100px',
                    }}
                />
            </div>

            <div className={styles.pageLineArtBottom}>
                <LineArt
                    circle={{
                        size: 220,
                        borderColor: 'rgba(255, 191, 0, 0.1)',
                        borderWidth: 2,
                        borderStyle: 'dotted',
                        bottom: '-120px',
                        right: '-100px',
                    }}
                    dot={{
                        size: 16,
                        color: 'rgba(106, 76, 147, 0.1)',
                        top: '50%',
                        left: '5%',
                        show: true,
                    }}
                />
            </div>

            {/* Page Header */}
            <motion.div
                className={styles.pageHeader}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <motion.div
                    className={styles.headerIcon}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                >
                    <FaMagic />
                </motion.div>
                <h1>AR Books Library</h1>
                <p>Discover interactive learning with augmented reality</p>
            </motion.div>

            {/* Search and Filter Bar */}
            <motion.div
                className={styles.searchFilterBar}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
            >
                <div className={styles.searchContainer}>
                    <FaSearch className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search books by title or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </motion.div>

            {/* Categories Section with Enhanced Design */}
            <motion.div
                className={styles.categoriesSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
            >
                <div className={styles.filterHeader}>
                    <FaFilter /> Filter by Category
                </div>
                <div className={styles.categoriesList}>
                    <motion.button
                        className={`${styles.categoryBtn} ${selectedCategory === '' ? styles.active : ''}`}
                        onClick={() => setSelectedCategory('')}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        All Books <span className={styles.count}>({arBooks.length})</span>
                    </motion.button>

                    {arBookCategories.map((category) => (
                        <motion.button
                            key={category.id}
                            className={`${styles.categoryBtn} ${selectedCategory === category.id ? styles.active : ''}`}
                            onClick={() => setSelectedCategory(category.id)}
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                            title={category.description}
                        >
                            <span className={styles.categoryIcon}>{category.icon}</span>
                            {category.name} <span className={styles.count}>({category.bookCount})</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Books Grid - Enhanced Layout */}
            <div className={styles.booksGrid}>
                <AnimatePresence mode="wait">
                    {filteredBooks.length > 0 ? (
                        filteredBooks.map((book, index) => (
                            <motion.div
                                key={book.id}
                                className={styles.bookCard}
                                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.85, y: 20 }}
                                transition={{ delay: index * 0.08, duration: 0.4 }}
                                whileHover={{ translateY: -16 }}
                            >
                                <div className={styles.bookCardInner}>
                                    {/* Book Cover with Advanced Overlay */}
                                    <div className={styles.bookCover}>
                                        <img src={book.coverImage} alt={book.title} />
                                        
                                        {/* Enhanced Featured Badge */}
                                        {book.isFeatured && (
                                            <motion.div
                                                className={styles.featuredBadge}
                                                animate={{ scale: [1, 1.12, 1] }}
                                                transition={{ duration: 2.5, repeat: Infinity }}
                                            >
                                                <FaMagic /> Featured
                                            </motion.div>
                                        )}

                                        {/* Interactive Overlay */}
                                        <div className={styles.bookOverlay}>
                                            <motion.div
                                                className={styles.overlayContent}
                                                initial={{ opacity: 0, y: 10 }}
                                                whileHover={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className={styles.overlayStats}>
                                                    <div className={styles.overlayStat}>
                                                        <FaBook /> {book.pages.length} Pages
                                                    </div>
                                                    <div className={styles.overlayStat}>
                                                        <FaStar /> {book.rating.toFixed(1)}
                                                    </div>
                                                    <div className={styles.overlayStat}>
                                                        👶 Age {book.ageGroup}+
                                                    </div>
                                                </div>
                                                <Link href={`/ar-books/${book.id}`}>
                                                    <motion.button
                                                        className={styles.viewBtn}
                                                        whileHover={{ scale: 1.12 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <FaMagic /> Start Reading
                                                    </motion.button>
                                                </Link>
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* Book Info Section */}
                                    <div className={styles.bookInfo}>
                                        <div className={styles.bookCategory}>
                                            <span className={styles.categoryIcon}>
                                                {arBookCategories.find(c => c.id === book.category)?.icon}
                                            </span>
                                            {arBookCategories.find(c => c.id === book.category)?.name}
                                        </div>
                                        
                                        <motion.h3
                                            className={styles.bookTitle}
                                            whileHover={{ color: '#6a4c93' }}
                                        >
                                            {book.title}
                                        </motion.h3>
                                        
                                        <p className={styles.description}>{book.description}</p>

                                        {/* Stats Section */}
                                        <div className={styles.bookStats}>
                                            <div className={styles.statItem}>
                                                <FaBook /> {book.pages.length} Pages
                                            </div>
                                            <div className={styles.statItem}>
                                                👶 {book.ageGroup}+
                                            </div>
                                        </div>

                                        {/* Footer with Rating and Views */}
                                        <div className={styles.bookFooter}>
                                            <div className={styles.rating}>
                                                <FaStar style={{ color: '#FFD700' }} />
                                                {book.rating.toFixed(1)}
                                            </div>
                                            <div className={styles.views}>
                                                <FaEye />
                                                {(book.views / 1000).toFixed(1)}K
                                            </div>
                                            <div className={styles.author}>
                                                By {book.authorName}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            className={styles.emptyState}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                className={styles.emptyIcon}
                            >
                                📚
                            </motion.div>
                            <h3>No Books Found</h3>
                            <p>Try adjusting your search or category filters to find your favorite books.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Results Info */}
            {filteredBooks.length > 0 && (
                <motion.div
                    className={styles.resultsInfo}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                >
                    📊 Showing <strong>{filteredBooks.length}</strong> of <strong>{arBooks.length}</strong> books
                </motion.div>
            )}
        </div>
    );
};

export default ARBooks;

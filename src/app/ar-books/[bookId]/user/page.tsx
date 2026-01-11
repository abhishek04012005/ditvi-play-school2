'use client';

import React, { useState, useEffect } from 'react';
import ARBookViewer from '@/components/ar/arBookViewer';
import { ARBook } from '@/ar/types';
import { arBooks } from '@/ar/data';

interface PageProps {
    params: Promise<{
        bookId: string;
    }>;
}

export default function ARBookUserPage({ params }: PageProps) {
    const [book, setBook] = useState<ARBook | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bookId, setBookId] = useState<string | null>(null);

    useEffect(() => {
        // Unwrap the Promise to get bookId
        const unwrapParams = async () => {
            try {
                const unwrappedParams = await params;
                setBookId(unwrappedParams.bookId);
            } catch (err) {
                setError('Failed to load book');
                setLoading(false);
            }
        };
        
        unwrapParams();
    }, [params]);

    useEffect(() => {
        if (!bookId) return;

        // Find the book by ID
        const foundBook = arBooks.find(b => b.id === bookId);
        
        if (foundBook) {
            setBook(foundBook);
            setError(null);
        } else {
            setError('Book not found');
            setBook(null);
        }
        
        setLoading(false);
    }, [bookId]);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, rgba(106, 76, 147, 0.05) 0%, rgba(255, 191, 0, 0.03) 100%)',
                fontFamily: 'Arial, Helvetica, sans-serif',
                padding: '1rem'
            }}>
                <div style={{
                    textAlign: 'center'
                }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '1rem',
                        color: 'var(--primary-purple)'
                    }}>
                        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="40" cy="40" r="35" stroke="#6a4c93" strokeWidth="2" fill="none" strokeDasharray="20 10" 
                                    style={{ animation: 'spin 2s linear infinite' }}/>
                            <circle cx="40" cy="40" r="25" stroke="#ffbf00" strokeWidth="2" fill="none" strokeDasharray="15 10" 
                                    style={{ animation: 'spin 3s linear infinite reverse' }}/>
                        </svg>
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(1.2rem, 4vw, 1.5rem)',
                        color: 'var(--primary-purple)',
                        margin: '1rem 0 0 0',
                        fontWeight: '600'
                    }}>
                        Loading your book...
                    </h2>
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, rgba(106, 76, 147, 0.05) 0%, rgba(255, 191, 0, 0.03) 100%)',
                padding: '1rem'
            }}>
                <div style={{
                    textAlign: 'center',
                    backgroundColor: 'white',
                    padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2rem)',
                    borderRadius: '15px',
                    boxShadow: '0 10px 40px rgba(106, 76, 147, 0.2)',
                    maxWidth: '400px',
                    width: '100%'
                }}>
                    <div style={{
                        fontSize: 'clamp(2rem, 6vw, 3rem)',
                        marginBottom: '1rem',
                        color: 'var(--primary-purple)'
                    }}>
                        📚
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
                        color: 'var(--primary-purple)',
                        margin: '0 0 0.5rem 0',
                        fontWeight: '700'
                    }}>
                        {error || 'Book not found'}
                    </h2>
                    <p style={{
                        color: 'var(--text-gray)',
                        marginBottom: '1.5rem',
                        fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
                        lineHeight: '1.5'
                    }}>
                        The book you're looking for couldn't be found. Please check the URL and try again.
                    </p>
                    <a href="/ar-books" style={{
                        display: 'inline-block',
                        padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
                        background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--secondary-purple) 100%)',
                        color: 'white',
                        borderRadius: '50px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: 'clamp(0.85rem, 2vw, 1rem)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(106, 76, 147, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(106, 76, 147, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(106, 76, 147, 0.3)';
                    }}>
                        Back to Books
                    </a>
                </div>
            </div>
        );
    }

    return (
        <ARBookViewer
            book={book}
            qrCodeUrl="/assets/scanimage/qrcode.png"
            arScanImageUrl="/assets/scanimage/ar-scan.png"
        />
    );
}

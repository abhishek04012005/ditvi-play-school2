'use client';
import { useEffect, useRef } from 'react';

interface ConfettiProps {
    trigger?: boolean;
    duration?: number;
    particleCount?: number;
    spread?: number;
    colors?: string[];
    intensity?: 'low' | 'medium' | 'high';
}

const Confetti = ({
    trigger = true,
    duration = 3000,
    particleCount = 1500,
    spread = 170,
    colors = ['#6a4c93', '#ffd166', '#ff6b6b', '#4ecdc4', '#ffe66d'],
    intensity = 'high'
}: ConfettiProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const confettiInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (!trigger) return;

        let mounted = true;

        const triggerConfetti = async () => {
            try {
                const confetti = (await import('canvas-confetti')).default;
                if (!mounted || !canvasRef.current) return;

                confettiInstanceRef.current = confetti.create(canvasRef.current, {
                    resize: true,
                    useWorker: true
                });

                const config = getConfigByIntensity(intensity, particleCount, spread, colors);

                // Main burst from center
                await confettiInstanceRef.current(config.main);

                // Left burst
                setTimeout(() => {
                    if (mounted && confettiInstanceRef.current) {
                        confettiInstanceRef.current(config.left);
                    }
                }, 100);

                // Right burst
                setTimeout(() => {
                    if (mounted && confettiInstanceRef.current) {
                        confettiInstanceRef.current(config.right);
                    }
                }, 200);

                // Extra burst for celebration
                setTimeout(() => {
                    if (mounted && confettiInstanceRef.current) {
                        confettiInstanceRef.current(config.extra);
                    }
                }, 300);

                // Clear after duration
                if (duration > 0) {
                    setTimeout(() => {
                        if (mounted && confettiInstanceRef.current) {
                            confettiInstanceRef.current.reset();
                        }
                    }, duration);
                }
            } catch (error) {
                console.error('Confetti effect failed:', error);
            }
        };

        triggerConfetti();

        return () => {
            mounted = false;
            if (confettiInstanceRef.current) {
                confettiInstanceRef.current.reset();
            }
        };
    }, [trigger, duration, particleCount, spread, colors, intensity]);

    return (
        <canvas
            ref={canvasRef}
            className="confetti-canvas"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1001,
            }}
        />
    );
};

// Helper function to get configuration based on intensity
const getConfigByIntensity = (
    intensity: 'low' | 'medium' | 'high',
    particleCount: number,
    spread: number,
    colors: string[]
) => {
    const configs = {
        low: {
            main: {
                particleCount: Math.floor(particleCount * 0.3),
                spread: spread * 0.8,
                origin: { y: 0.5 },
                colors: colors,
                gravity: 0.8,
                decay: 0.95,
                scalar: 0.8,
                ticks: 200
            },
            left: {
                particleCount: Math.floor(particleCount * 0.1),
                angle: 60,
                spread: Math.floor(spread * 0.6),
                origin: { x: 0.1, y: 0.3 },
                colors: colors,
                gravity: 0.8,
                decay: 0.95,
                scalar: 0.6,
                ticks: 200
            },
            right: {
                particleCount: Math.floor(particleCount * 0.1),
                angle: 120,
                spread: Math.floor(spread * 0.6),
                origin: { x: 0.9, y: 0.3 },
                colors: colors,
                gravity: 0.8,
                decay: 0.95,
                scalar: 0.6,
                ticks: 200
            },
            extra: {
                particleCount: Math.floor(particleCount * 0.1),
                spread: spread,
                origin: { y: 0.4 },
                colors: colors,
                gravity: 1,
                decay: 0.92,
                scalar: 0.5,
                ticks: 200
            }
        },
        medium: {
            main: {
                particleCount: Math.floor(particleCount * 0.6),
                spread: spread * 0.9,
                origin: { y: 0.5 },
                colors: colors,
                gravity: 0.8,
                decay: 0.95,
                scalar: 1,
                ticks: 250
            },
            left: {
                particleCount: Math.floor(particleCount * 0.15),
                angle: 60,
                spread: Math.floor(spread * 0.8),
                origin: { x: 0.1, y: 0.3 },
                colors: colors,
                gravity: 0.8,
                decay: 0.95,
                scalar: 0.8,
                ticks: 250
            },
            right: {
                particleCount: Math.floor(particleCount * 0.15),
                angle: 120,
                spread: Math.floor(spread * 0.8),
                origin: { x: 0.9, y: 0.3 },
                colors: colors,
                gravity: 0.8,
                decay: 0.95,
                scalar: 0.8,
                ticks: 250
            },
            extra: {
                particleCount: Math.floor(particleCount * 0.15),
                spread: spread,
                origin: { y: 0.4 },
                colors: colors,
                gravity: 1,
                decay: 0.92,
                scalar: 0.7,
                ticks: 250
            }
        },
        high: {
            main: {
                particleCount: particleCount,
                spread: spread,
                origin: { y: 0.5 },
                colors: colors,
                gravity: 0.8,
                decay: 0.95,
                scalar: 1.3,
                ticks: 300
            },
            left: {
                particleCount: Math.floor(particleCount * 0.2),
                angle: 60,
                spread: Math.floor(spread * 1),
                origin: { x: 0.1, y: 0.3 },
                colors: colors,
                gravity: 0.8,
                decay: 0.95,
                scalar: 1.1,
                ticks: 300
            },
            right: {
                particleCount: Math.floor(particleCount * 0.2),
                angle: 120,
                spread: Math.floor(spread * 1),
                origin: { x: 0.9, y: 0.3 },
                colors: colors,
                gravity: 0.8,
                decay: 0.95,
                scalar: 1.1,
                ticks: 300
            },
            extra: {
                particleCount: Math.floor(particleCount * 0.2),
                spread: spread,
                origin: { y: 0.4 },
                colors: colors,
                gravity: 1,
                decay: 0.92,
                scalar: 0.9,
                ticks: 300
            }
        }
    };

    return configs[intensity];
};

export default Confetti;
'use client';
import React, { ReactNode, CSSProperties } from 'react';
import styles from './lineart.module.css';

interface CircleConfig {
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  opacity?: number;
  animationSpeed?: number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  icon?: ReactNode;
  iconSize?: number;
  iconColor?: string;
  showIcon?: boolean;
}

interface DotConfig {
  size?: number;
  color?: string;
  opacity?: number;
  animationSpeed?: number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  blur?: number;
  show?: boolean;
}

interface SquigglyConfig {
  size?: number;
  color?: string;
  opacity?: number;
  animationSpeed?: number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
  show?: boolean;
  reverse?: boolean;
}

interface LineArtProps {
  circle?: CircleConfig;
  dot?: DotConfig;
  squiggly?: SquigglyConfig;
  className?: string;
  zIndex?: number;
}

const LineArt: React.FC<LineArtProps> = ({
  circle = {},
  dot = {},
  squiggly = {},
  className = '',
  zIndex = 1
}) => {
  // Circle defaults
  const circleDefaults: CircleConfig = {
    size: 200,
    borderColor: 'var(--primary-yellow)',
    borderWidth: 3,
    borderStyle: 'dashed',
    opacity: 1,
    animationSpeed: 30,
    bottom: '7%',
    left: '2%',
    showIcon: true,
    ...circle
  };

  // Dot defaults
  const dotDefaults: DotConfig = {
    size: 150,
    color: 'var(--primary-yellow)',
    opacity: 0.3,
    animationSpeed: 6,
    top: '10%',
    right: '5%',
    blur: 60,
    show: true,
    ...dot
  };

  // Squiggly defaults
  const squigglyDefaults: SquigglyConfig = {
    size: 100,
    color: 'var(--primary-purple)',
    opacity: 0.1,
    animationSpeed: 8,
    top: '30%',
    left: '2%',
    show: true,
    reverse: true,
    ...squiggly
  };

  // Circle styles
  const circleStyle: CSSProperties = {
    position: 'absolute',
    width: `${circleDefaults.size}px`,
    height: `${circleDefaults.size}px`,
    borderColor: circleDefaults.borderColor,
    borderWidth: `${circleDefaults.borderWidth}px`,
    borderStyle: circleDefaults.borderStyle,
    opacity: circleDefaults.opacity,
    top: typeof circleDefaults.top === 'number' ? `${circleDefaults.top}px` : circleDefaults.top,
    left: typeof circleDefaults.left === 'number' ? `${circleDefaults.left}px` : circleDefaults.left,
    right: circleDefaults.right ? (typeof circleDefaults.right === 'number' ? `${circleDefaults.right}px` : circleDefaults.right) : undefined,
    bottom: circleDefaults.bottom ? (typeof circleDefaults.bottom === 'number' ? `${circleDefaults.bottom}px` : circleDefaults.bottom) : undefined,
    animation: `${styles['rotate']} ${circleDefaults.animationSpeed}s linear infinite`,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // Dot styles
  const dotStyle: CSSProperties = {
    position: 'absolute',
    width: `${dotDefaults.size}px`,
    height: `${dotDefaults.size}px`,
    background: `radial-gradient(circle, ${dotDefaults.color} 10%, transparent ${dotDefaults.blur}%)`,
    opacity: dotDefaults.opacity,
    top: typeof dotDefaults.top === 'number' ? `${dotDefaults.top}px` : dotDefaults.top,
    left: typeof dotDefaults.left === 'number' ? `${dotDefaults.left}px` : dotDefaults.left,
    right: dotDefaults.right ? (typeof dotDefaults.right === 'number' ? `${dotDefaults.right}px` : dotDefaults.right) : undefined,
    bottom: dotDefaults.bottom ? (typeof dotDefaults.bottom === 'number' ? `${dotDefaults.bottom}px` : dotDefaults.bottom) : undefined,
    animation: `${styles['float']} ${dotDefaults.animationSpeed}s ease-in-out infinite`,
  };

  // Squiggly styles
  const squigglyStyle: CSSProperties = {
    position: 'absolute',
    width: `${squigglyDefaults.size}px`,
    height: `${squigglyDefaults.size}px`,
    background: `
      linear-gradient(45deg, transparent 48%, ${squigglyDefaults.color} 49%, ${squigglyDefaults.color} 51%, transparent 52%) 0 0 / 1em 1em,
      linear-gradient(-45deg, transparent 48%, ${squigglyDefaults.color} 49%, ${squigglyDefaults.color} 51%, transparent 52%) 0 0 / 1em 1em
    `,
    opacity: squigglyDefaults.opacity,
    top: typeof squigglyDefaults.top === 'number' ? `${squigglyDefaults.top}px` : squigglyDefaults.top,
    left: typeof squigglyDefaults.left === 'number' ? `${squigglyDefaults.left}px` : squigglyDefaults.left,
    right: squigglyDefaults.right ? (typeof squigglyDefaults.right === 'number' ? `${squigglyDefaults.right}px` : squigglyDefaults.right) : undefined,
    bottom: squigglyDefaults.bottom ? (typeof squigglyDefaults.bottom === 'number' ? `${squigglyDefaults.bottom}px` : squigglyDefaults.bottom) : undefined,
    animation: squigglyDefaults.reverse 
      ? `${styles['floatReverse']} ${squigglyDefaults.animationSpeed}s ease-in-out infinite`
      : `${styles['float']} ${squigglyDefaults.animationSpeed}s ease-in-out infinite`,
  };

  return (
    <div 
      className={`${styles.lineArt} ${className}`}
      style={{ zIndex, pointerEvents: 'none' }}
    >
      {/* Circle */}
      <div className={styles.circle} style={circleStyle}>
        <div 
          className={styles.circleInner}
          style={{ 
            animation: `${styles['counterRotate']} ${circleDefaults.animationSpeed}s linear infinite` 
          }}
        >
          {circleDefaults.showIcon && circleDefaults.icon && (
            <div 
              className={styles.iconWrapper}
              style={{ color: circleDefaults.iconColor || 'var(--primary-purple)' }}
            >
              {circleDefaults.icon}
            </div>
          )}
        </div>
      </div>

      {/* Dot */}
      {dotDefaults.show && <div className={styles.dot} style={dotStyle}></div>}

      {/* Squiggly */}
      {squigglyDefaults.show && <div className={styles.squiggly} style={squigglyStyle}></div>}
    </div>
  );
};

export default LineArt;
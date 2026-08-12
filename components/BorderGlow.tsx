import React from 'react';

interface BorderGlowProps {
  backgroundColor?: string;
  borderRadius?: number;
  glowColor?: string;
  colors?: string[];
  className?: string;
  children: React.ReactNode;
}

const BorderGlow: React.FC<BorderGlowProps> = ({
  backgroundColor = 'transparent',
  borderRadius = 16,
  glowColor,
  colors,
  className = '',
  children
}) => {
  return (
    <div
      className={`relative ${className}`}
      style={{
        backgroundColor,
        borderRadius,
        boxShadow: glowColor ? `0 4px 20px rgba(${glowColor.split(' ').join(',')}, 0.15)` : undefined
      }}
    >
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none border border-black/5"
        style={{ borderRadius }}
      />
      {children}
    </div>
  );
};

export default BorderGlow;

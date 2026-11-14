import React from 'react';

export const LoadingSkeleton = ({ rows = 3, height = '20px', style = {} }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', ...style }}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          style={{
            height,
            backgroundColor: '#E5E7EB',
            borderRadius: 'var(--radius-md)',
            animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;


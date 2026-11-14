import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Home, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export const NotFoundPage = () => {
  const { t, isBangla } = useTranslation();

  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: 'var(--radius-full)',
        backgroundColor: 'var(--color-primary-50)',
        color: 'var(--color-primary-800)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <Sprout size={32} />
      </div>

      <h1 style={{ fontSize: 'var(--font-size-3xl)', color: 'var(--color-primary-900)', marginBottom: '0.5rem' }}>
        404
      </h1>
      <h2 style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
        {isBangla ? 'পৃষ্ঠাটি খুঁজে পাওয়া যায়নি' : 'Page Not Found'}
      </h2>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', maxWidth: '420px', marginBottom: '1.5rem' }}>
        {isBangla
          ? 'আপনি যে পৃষ্ঠাটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা লিঙ্কটি ভুল।'
          : 'The requested agricultural module could not be found. Please return to the home page or dashboard.'}
      </p>

      <Link to="/" className="btn btn-primary">
        <Home size={16} />
        <span>{isBangla ? 'মূল পাতায় ফিরে যান' : 'Return to Home'}</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;


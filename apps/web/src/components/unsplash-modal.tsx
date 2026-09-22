'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@artxflow/ui';
import type { UnsplashPhotoDto } from '../app/api/unsplash/search/route';

export interface SelectedUnsplashImage {
  url: string;
  alt: string;
  caption: string;
  photographerName: string;
  photographerUrl: string;
}

export interface UnsplashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: SelectedUnsplashImage) => void;
}

export function UnsplashModal({ isOpen, onClose, onSelectImage }: UnsplashModalProps) {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhotoDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Failed to fetch photos from Unsplash');
      const data = await res.json();
      setPhotos(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading photos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPhotos('');
    }
  }, [isOpen, fetchPhotos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPhotos(query);
  };

  const handleSelect = (photo: UnsplashPhotoDto) => {
    const attribution = `Photo by [${photo.user.name}](${photo.user.link}) on [Unsplash](https://unsplash.com/?utm_source=artxflow&utm_medium=referral)`;
    onSelectImage({
      url: photo.urls.regular,
      alt: photo.alt || photo.description || 'Unsplash photo',
      caption: attribution,
      photographerName: photo.user.name,
      photographerUrl: photo.user.link,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unsplash-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(5, 10, 20, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '85vh',
          backgroundColor: 'var(--surface-elevated, #131E2F)',
          border: '1px solid var(--border, #1C2A3A)',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border, #1C2A3A)',
          }}
        >
          <div>
            <h2
              id="unsplash-modal-title"
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
              }}
            >
              Search Unsplash Photos
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: 'var(--text-secondary, #AAB5C4)',
              }}
            >
              Free high-resolution photos with automatic photographer attribution
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #AAB5C4)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border, #1C2A3A)' }}>
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search photos (e.g. coding, minimal, architecture, workspace)..."
              autoFocus
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: 'var(--surface-sunken, #0A121E)',
                border: '1px solid var(--border, #1C2A3A)',
                borderRadius: '8px',
                color: 'var(--text-primary, #F5F7FA)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </div>

        {/* Photos Grid Container */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {error && (
            <div
              style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                color: '#EF4444',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
                color: 'var(--text-secondary, #AAB5C4)',
                fontSize: '14px',
              }}
            >
              Loading photos...
            </div>
          ) : photos.length === 0 ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
                color: 'var(--text-secondary, #AAB5C4)',
                fontSize: '14px',
              }}
            >
              No photos found. Try another search term.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => handleSelect(photo)}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: 'var(--surface-sunken, #0A121E)',
                    border: '1px solid var(--border, #1C2A3A)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, border-color 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--axf-blue, #0B87FE)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border, #1C2A3A)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ width: '100%', height: '140px', overflow: 'hidden', position: 'relative' }}>
                    <img
                      src={photo.urls.small}
                      alt={photo.alt || photo.description || 'Unsplash image'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      loading="lazy"
                    />
                  </div>
                  <div
                    style={{
                      padding: '8px 10px',
                      fontSize: '11px',
                      color: 'var(--text-secondary, #AAB5C4)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    By{' '}
                    <span style={{ color: 'var(--text-primary, #F5F7FA)', fontWeight: 500 }}>
                      {photo.user.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border, #1C2A3A)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            color: 'var(--text-secondary, #AAB5C4)',
          }}
        >
          <span>Photos provided by Unsplash</span>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

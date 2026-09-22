'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface EditorCoverUploaderProps {
  coverUrl?: string | null;
  onCoverChange: (url: string | null) => void;
  onUploadFile: (file: File) => Promise<string | void>;
  onOpenUnsplashModal: () => void;
}

export function EditorCoverUploader({
  coverUrl,
  onCoverChange,
  onUploadFile,
  onOpenUnsplashModal,
}: EditorCoverUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await onUploadFile(file);
      if (url) onCoverChange(url);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMockAiGenerate = () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAi(true);
    setTimeout(() => {
      // High-resolution placeholder corresponding to AI concept
      const sampleAiUrl =
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80';
      onCoverChange(sampleAiUrl);
      setIsGeneratingAi(false);
      setShowAiModal(false);
      setAiPrompt('');
    }, 1200);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <AnimatePresence mode="wait">
        {coverUrl ? (
          <motion.div
            key="cover-preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              maxHeight: '280px',
              border: '1px solid var(--border, #1C2A3A)',
              backgroundColor: 'var(--surface-sunken, #0A121E)',
            }}
          >
            <img
              src={coverUrl}
              alt="Article cover"
              style={{
                width: '100%',
                height: '240px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                display: 'flex',
                gap: '8px',
                backgroundColor: 'rgba(10, 18, 30, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border, #1C2A3A)',
              }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>📷</span> Change
              </button>
              <span style={{ color: 'var(--border, #1C2A3A)' }}>|</span>
              <button
                type="button"
                onClick={() => onCoverChange(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Remove
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cover-buttons"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
                color: 'var(--text-primary, #F5F7FA)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: isUploading ? 'not-allowed' : 'pointer',
              }}
            >
              <span>📷</span>
              <span>{isUploading ? 'Uploading cover…' : 'Upload Cover Image'}</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenUnsplashModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
                color: 'var(--text-primary, #F5F7FA)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <span>🖼</span>
              <span>Unsplash Cover</span>
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAiModal(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: 'rgba(11, 135, 254, 0.08)',
                border: '1px solid rgba(11, 135, 254, 0.3)',
                color: 'var(--axf-cyan, #19D7FE)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <span>✨</span>
              <span>Generate Image</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Cover Image Generation Modal */}
      <AnimatePresence>
        {showAiModal && (
          <div
            role="dialog"
            aria-modal="true"
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
              if (e.target === e.currentTarget) setShowAiModal(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                width: '100%',
                maxWidth: '520px',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
                borderRadius: '12px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                  ✨ Generate Cover with AI
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary, #AAB5C4)',
                    fontSize: '18px',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary, #AAB5C4)', lineHeight: 1.5 }}>
                Describe the visual style or scene you want for this article cover (e.g. <i>"Minimalist cyberpunk workstation with glowing neon cables and glass architecture"</i>).
              </p>

              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter an image prompt..."
                rows={3}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'var(--surface-sunken, #0A121E)',
                  border: '1px solid var(--border, #1C2A3A)',
                  borderRadius: '8px',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid var(--border, #1C2A3A)',
                    background: 'transparent',
                    color: 'var(--text-secondary, #AAB5C4)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleMockAiGenerate}
                  disabled={!aiPrompt.trim() || isGeneratingAi}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--axf-blue, #0B87FE)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: !aiPrompt.trim() || isGeneratingAi ? 'not-allowed' : 'pointer',
                    opacity: !aiPrompt.trim() || isGeneratingAi ? 0.6 : 1,
                  }}
                >
                  {isGeneratingAi ? 'Generating…' : 'Generate Cover'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

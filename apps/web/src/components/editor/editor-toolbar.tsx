'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface EditorToolbarProps {
  onApplyHeading: (level: 1 | 2 | 3 | 0) => void;
  onApplyInline: (prefix: string, suffix?: string, placeholder?: string) => void;
  onApplyBlockquote: () => void;
  onApplyList: (type: 'bullet' | 'number') => void;
  onApplyCodeBlock: (lang: string) => void;
  onApplyDivider: () => void;
  onApplyTable: () => void;
  onOpenLinkModal: () => void;
  onUploadImageClick: () => void;
  onOpenUnsplashModal: () => void;
  onInsertEmbed?: (url: string) => void;
  isUploadingImage?: boolean;
  isZenMode?: boolean;
  onToggleZenMode?: () => void;
}

const POPULAR_LANGUAGES = [
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Python', value: 'python' },
  { label: 'Bash / Shell', value: 'bash' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'SQL', value: 'sql' },
  { label: 'JSON', value: 'json' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
];

export function EditorToolbar({
  onApplyHeading,
  onApplyInline,
  onApplyBlockquote,
  onApplyList,
  onApplyCodeBlock,
  onApplyDivider,
  onApplyTable,
  onOpenLinkModal,
  onUploadImageClick,
  onOpenUnsplashModal,
  onInsertEmbed,
  isUploadingImage = false,
  isZenMode = false,
  onToggleZenMode,
}: EditorToolbarProps) {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showCodeMenu, setShowCodeMenu] = useState(false);
  const [showEmbedMenu, setShowEmbedMenu] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');

  const headingRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headingRef.current && !headingRef.current.contains(e.target as Node)) {
        setShowHeadingMenu(false);
      }
      if (codeRef.current && !codeRef.current.contains(e.target as Node)) {
        setShowCodeMenu(false);
      }
      if (embedRef.current && !embedRef.current.contains(e.target as Node)) {
        setShowEmbedMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttonStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 10px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: 'var(--text-primary, #F5F7FA)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    outline: 'none',
    transition: 'background-color 0.15s ease',
  };

  const dividerStyle: React.CSSProperties = {
    width: '1px',
    height: '18px',
    backgroundColor: 'var(--border, #1C2A3A)',
    margin: '0 4px',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '6px 10px',
        backgroundColor: 'var(--surface-sunken, #0A121E)',
        border: '1px solid var(--border, #1C2A3A)',
        borderRadius: '8px',
        marginBottom: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Headings Selector */}
      <div ref={headingRef} style={{ position: 'relative' }}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowHeadingMenu((prev) => !prev)}
          style={{ ...buttonStyle, gap: '4px' }}
          title="Heading options"
        >
          <span style={{ fontSize: '14px', fontWeight: 800 }}>H</span>
          <span style={{ fontSize: '10px' }}>▾</span>
        </motion.button>

        <AnimatePresence>
          {showHeadingMenu && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                width: '180px',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 20,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onApplyHeading(1);
                  setShowHeadingMenu(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                H1 Title
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyHeading(2);
                  setShowHeadingMenu(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                H2 Section
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyHeading(3);
                  setShowHeadingMenu(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                H3 Subtitle
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyHeading(0);
                  setShowHeadingMenu(false);
                }}
                style={{
                  textAlign: 'left',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-secondary, #AAB5C4)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Normal Paragraph
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={dividerStyle} />

      {/* Inline Formatting: Bold, Italic, Underline, Strikethrough, Code */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onApplyInline('**', '**', 'bold text')}
        style={buttonStyle}
        title="Bold (Cmd+B)"
      >
        <span style={{ fontWeight: 800 }}>B</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onApplyInline('*', '*', 'italic text')}
        style={buttonStyle}
        title="Italic (Cmd+I)"
      >
        <span style={{ fontStyle: 'italic', fontFamily: 'serif', fontSize: '15px' }}>I</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onApplyInline('<u>', '</u>', 'underlined text')}
        style={buttonStyle}
        title="Underline (Cmd+U)"
      >
        <span style={{ textDecoration: 'underline' }}>U</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onApplyInline('~~', '~~', 'strikethrough text')}
        style={buttonStyle}
        title="Strikethrough (Cmd+Shift+X)"
      >
        <span style={{ textDecoration: 'line-through' }}>S</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onApplyInline('`', '`', 'code')}
        style={buttonStyle}
        title="Inline Code (Cmd+E)"
      >
        <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>&lt;&gt;</span>
      </motion.button>

      <div style={dividerStyle} />

      {/* Structural Elements: Blockquote, Code Block, Bullet List, Numbered List */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onApplyBlockquote}
        style={buttonStyle}
        title="Blockquote (Cmd+Shift+9)"
      >
        <span style={{ fontSize: '16px', fontFamily: 'serif' }}>“</span>
      </motion.button>

      {/* Code Block with language picker */}
      <div ref={codeRef} style={{ position: 'relative' }}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCodeMenu((prev) => !prev)}
          style={{ ...buttonStyle, gap: '4px' }}
          title="Fenced Code Block"
        >
          <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>```</span>
          <span style={{ fontSize: '10px' }}>▾</span>
        </motion.button>

        <AnimatePresence>
          {showCodeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '4px',
                width: '180px',
                maxHeight: '220px',
                overflowY: 'auto',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                zIndex: 20,
              }}
            >
              {POPULAR_LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => {
                    onApplyCodeBlock(lang.value);
                    setShowCodeMenu(false);
                  }}
                  style={{
                    textAlign: 'left',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'none',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onApplyList('bullet')}
        style={buttonStyle}
        title="Bullet List (Cmd+Shift+8)"
      >
        <span>• ≡</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onApplyList('number')}
        style={buttonStyle}
        title="Numbered List (Cmd+Shift+7)"
      >
        <span>1. ≡</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onApplyDivider}
        style={buttonStyle}
        title="Line Divider (---)"
      >
        <span>───</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onApplyTable}
        style={buttonStyle}
        title="Insert Markdown Table"
      >
        <span>⊞</span>
      </motion.button>

      <div style={dividerStyle} />

      {/* Media & Links */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenLinkModal}
        style={buttonStyle}
        title="Insert Link (Cmd+K)"
      >
        <span>🔗</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onUploadImageClick}
        disabled={isUploadingImage}
        style={{ ...buttonStyle, opacity: isUploadingImage ? 0.6 : 1 }}
        title="Upload Image (Cloudflare R2)"
      >
        <span>📷</span>
      </motion.button>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenUnsplashModal}
        style={buttonStyle}
        title="Insert Unsplash Image"
      >
        <span>🖼</span>
      </motion.button>

      {/* Embed Tool (YouTube / X / Gist) */}
      <div ref={embedRef} style={{ position: 'relative' }}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowEmbedMenu((prev) => !prev)}
          style={buttonStyle}
          title="Embed Content (YouTube, Tweets, etc.)"
        >
          <span>⚡</span>
        </motion.button>

        <AnimatePresence>
          {showEmbedMenu && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                width: '260px',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
                borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                zIndex: 20,
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                Embed Link (YouTube, X, Gist)
              </div>
              <input
                type="url"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                placeholder="https://..."
                style={{
                  padding: '6px 10px',
                  backgroundColor: 'var(--surface-sunken, #0A121E)',
                  border: '1px solid var(--border, #1C2A3A)',
                  borderRadius: '6px',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (embedUrl.trim()) {
                    onInsertEmbed?.(embedUrl.trim());
                    setShowEmbedMenu(false);
                    setEmbedUrl('');
                  }
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'var(--axf-blue, #0B87FE)',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Insert Embed
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zen Mode Toggle */}
      {onToggleZenMode && (
        <>
          <div style={{ flex: 1 }} />
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleZenMode}
            style={{
              ...buttonStyle,
              color: isZenMode ? 'var(--axf-cyan, #19D7FE)' : 'var(--text-secondary, #AAB5C4)',
            }}
            title={isZenMode ? 'Exit Zen Mode' : 'Zen Focus Mode (Hide distractions)'}
          >
            <span style={{ fontSize: '14px' }}>{isZenMode ? '✕' : '⛶'}</span>
          </motion.button>
        </>
      )}
    </div>
  );
}

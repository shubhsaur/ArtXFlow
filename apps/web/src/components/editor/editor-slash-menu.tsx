'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type SlashAction =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'bullet'
  | 'number'
  | 'quote'
  | 'code'
  | 'image'
  | 'unsplash'
  | 'divider'
  | 'table';

export interface SlashMenuItem {
  id: SlashAction;
  title: string;
  subtitle: string;
  icon: string;
}

const SLASH_ITEMS: SlashMenuItem[] = [
  { id: 'h1', title: 'Heading 1', subtitle: 'Large section title', icon: 'H1' },
  { id: 'h2', title: 'Heading 2', subtitle: 'Medium section title', icon: 'H2' },
  { id: 'h3', title: 'Heading 3', subtitle: 'Small sub-heading', icon: 'H3' },
  { id: 'bullet', title: 'Bullet List', subtitle: 'Create a simple bulleted list', icon: '• ≡' },
  { id: 'number', title: 'Numbered List', subtitle: 'Create a list with numbering', icon: '1. ≡' },
  { id: 'quote', title: 'Blockquote', subtitle: 'Capture a quote or key takeaway', icon: '“' },
  { id: 'code', title: 'Code Block', subtitle: 'Syntax-highlighted code block', icon: '<>' },
  { id: 'image', title: 'Upload Image', subtitle: 'Upload an image from your computer', icon: '📷' },
  { id: 'unsplash', title: 'Unsplash Image', subtitle: 'Search and insert a free photo', icon: '🖼' },
  { id: 'divider', title: 'Divider', subtitle: 'Visual section break (3 dots on Medium)', icon: '──' },
  { id: 'table', title: 'Table', subtitle: 'Insert aligned Markdown table', icon: '⊞' },
];

export interface EditorSlashMenuProps {
  isOpen: boolean;
  filterText?: string;
  onSelect: (action: SlashAction) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export function EditorSlashMenu({
  isOpen,
  filterText = '',
  onSelect,
  onClose,
  position,
}: EditorSlashMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredItems = SLASH_ITEMS.filter((item) => {
    const q = filterText.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex].id);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onSelect, onClose]);

  if (!isOpen || filteredItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.12 }}
        style={{
          position: 'absolute',
          top: position ? `${position.top}px` : '40px',
          left: position ? `${position.left}px` : '20px',
          width: '280px',
          maxHeight: '300px',
          overflowY: 'auto',
          backgroundColor: 'var(--surface-elevated, #131E2F)',
          border: '1px solid var(--border, #1C2A3A)',
          borderRadius: '10px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          zIndex: 50,
        }}
      >
        <div
          style={{
            padding: '6px 10px',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-secondary, #AAB5C4)',
          }}
        >
          Basic Blocks
        </div>

        {filteredItems.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <div
              key={item.id}
              onClick={() => onSelect(item.id)}
              onMouseEnter={() => setSelectedIndex(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: isSelected ? 'rgba(11, 135, 254, 0.12)' : 'transparent',
                border: isSelected ? '1px solid rgba(11, 135, 254, 0.3)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.1s ease',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-sunken, #0A121E)',
                  border: '1px solid var(--border, #1C2A3A)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--axf-cyan, #19D7FE)',
                }}
              >
                {item.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isSelected ? '#fff' : 'var(--text-primary, #F5F7FA)',
                  }}
                >
                  {item.title}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)' }}>
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
}

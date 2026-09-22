'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface EditorTagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
}

export function EditorTagInput({ tags, onChange, maxTags = 4 }: EditorTagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag
      onChange(tags.slice(0, -1));
    }
  };

  const addTag = () => {
    const cleanTag = inputValue.trim().replace(/^#/, '').toLowerCase().slice(0, 25);
    if (!cleanTag) return;
    if (tags.length >= maxTags) return;
    if (!tags.includes(cleanTag)) {
      onChange([...tags, cleanTag]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '8px 0',
        marginBottom: '16px',
      }}
    >
      <AnimatePresence>
        {tags.map((tag) => (
          <motion.span
            key={tag}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: 'rgba(11, 135, 254, 0.12)',
              border: '1px solid rgba(11, 135, 254, 0.3)',
              borderRadius: '20px',
              color: 'var(--axf-cyan, #19D7FE)',
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary, #AAB5C4)',
                cursor: 'pointer',
                fontSize: '13px',
                padding: '0 2px',
                display: 'flex',
                alignItems: 'center',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </motion.span>
        ))}
      </AnimatePresence>

      {tags.length < maxTags && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? 'Add up to 4 tags... (e.g. react, nextjs, webdev)' : 'Add another tag...'}
          style={{
            flex: 1,
            minWidth: '180px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary, #F5F7FA)',
            fontSize: '13px',
            padding: '4px 0',
          }}
        />
      )}
    </div>
  );
}

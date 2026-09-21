'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PublisherReadiness } from './formatting-helpers';

export interface EditorSidebarProps {
  stats: {
    words: number;
    characters: number;
    readingTimeMinutes: number;
  };
  readiness: PublisherReadiness;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function EditorSidebar({
  stats,
  readiness,
  isCollapsed = false,
  onToggleCollapse,
}: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<'readiness' | 'shortcuts' | 'stats'>('readiness');

  if (isCollapsed) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onToggleCollapse}
          title="Expand helper sidebar"
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            backgroundColor: 'var(--surface-elevated, #131E2F)',
            border: '1px solid var(--border, #1C2A3A)',
            color: 'var(--text-secondary, #AAB5C4)',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          ◀
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '280px',
        backgroundColor: 'var(--surface-elevated, #131E2F)',
        border: '1px solid var(--border, #1C2A3A)',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: 'fit-content',
        position: 'sticky',
        top: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-primary, #F5F7FA)',
          }}
        >
          Editor Assistant
        </span>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary, #AAB5C4)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px 4px',
            }}
          >
            ▶
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--surface-sunken, #0A121E)',
          borderRadius: '8px',
          padding: '2px',
          border: '1px solid var(--border, #1C2A3A)',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('readiness')}
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'readiness' ? 'var(--surface-elevated, #131E2F)' : 'transparent',
            color: activeTab === 'readiness' ? '#fff' : 'var(--text-secondary, #AAB5C4)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Readiness
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stats')}
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'stats' ? 'var(--surface-elevated, #131E2F)' : 'transparent',
            color: activeTab === 'stats' ? '#fff' : 'var(--text-secondary, #AAB5C4)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Stats
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shortcuts')}
          style={{
            flex: 1,
            padding: '6px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'shortcuts' ? 'var(--surface-elevated, #131E2F)' : 'transparent',
            color: activeTab === 'shortcuts' ? '#fff' : 'var(--text-secondary, #AAB5C4)',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          Shortcuts
        </button>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'readiness' && (
          <motion.div
            key="readiness"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
          >
            <div style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', lineHeight: 1.4 }}>
              Multi-platform readiness verified against platform restrictions before publishing:
            </div>

            {/* DEV.to */}
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-sunken, #0A121E)',
                border: '1px solid var(--border, #1C2A3A)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                  DEV.to
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: readiness.devto.ready ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: readiness.devto.ready ? '#34D399' : '#F59E0B',
                  }}
                >
                  {readiness.devto.ready ? '● Ready' : '⚠ Attention'}
                </span>
              </div>
              {readiness.devto.issues.length > 0 && (
                <div style={{ fontSize: '11px', color: '#FBBF24', marginTop: '2px' }}>
                  {readiness.devto.issues.map((issue) => (
                    <div key={issue}>• {issue}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Medium */}
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-sunken, #0A121E)',
                border: '1px solid var(--border, #1C2A3A)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                  Medium
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: readiness.medium.ready ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: readiness.medium.ready ? '#34D399' : '#F59E0B',
                  }}
                >
                  {readiness.medium.ready ? '● Ready' : '⚠ Attention'}
                </span>
              </div>
              {readiness.medium.issues.length > 0 && (
                <div style={{ fontSize: '11px', color: '#FBBF24', marginTop: '2px' }}>
                  {readiness.medium.issues.map((issue) => (
                    <div key={issue}>• {issue}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Hashnode */}
            <div
              style={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-sunken, #0A121E)',
                border: '1px solid var(--border, #1C2A3A)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                  Hashnode
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: readiness.hashnode.ready ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: readiness.hashnode.ready ? '#34D399' : '#F59E0B',
                  }}
                >
                  {readiness.hashnode.ready ? '● Ready' : '⚠ Attention'}
                </span>
              </div>
              {readiness.hashnode.issues.length > 0 && (
                <div style={{ fontSize: '11px', color: '#FBBF24', marginTop: '2px' }}>
                  {readiness.hashnode.issues.map((issue) => (
                    <div key={issue}>• {issue}</div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-sunken, #0A121E)',
                border: '1px solid var(--border, #1C2A3A)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}>Word Count</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)' }}>
                {stats.words.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-sunken, #0A121E)',
                border: '1px solid var(--border, #1C2A3A)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}>Characters</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary, #F5F7FA)' }}>
                {stats.characters.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-sunken, #0A121E)',
                border: '1px solid var(--border, #1C2A3A)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}>Reading Time</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--axf-cyan, #19D7FE)' }}>
                ~{stats.readingTimeMinutes} min
              </span>
            </div>
          </motion.div>
        )}

        {activeTab === 'shortcuts' && (
          <motion.div
            key="shortcuts"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}
          >
            {[
              { key: 'Cmd+B', label: 'Bold' },
              { key: 'Cmd+I', label: 'Italic' },
              { key: 'Cmd+U', label: 'Underline' },
              { key: 'Cmd+K', label: 'Insert Link' },
              { key: 'Cmd+E', label: 'Inline Code' },
              { key: 'Cmd+Shift+X', label: 'Strikethrough' },
              { key: 'Cmd+Shift+9', label: 'Blockquote' },
              { key: 'Cmd+Shift+8', label: 'Bullet List' },
              { key: 'Cmd+Shift+7', label: 'Numbered List' },
              { key: '/', label: 'Slash Menu' },
            ].map((s) => (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 0',
                  borderBottom: '1px solid rgba(28, 42, 58, 0.4)',
                }}
              >
                <span style={{ color: 'var(--text-secondary, #AAB5C4)' }}>{s.label}</span>
                <kbd
                  style={{
                    backgroundColor: 'var(--surface-sunken, #0A121E)',
                    border: '1px solid var(--border, #1C2A3A)',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: 'var(--text-primary, #F5F7FA)',
                  }}
                >
                  {s.key}
                </kbd>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';

interface PlatformAccordionProps {
  title: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function PlatformAccordion({
  title,
  icon,
  badge,
  defaultOpen = false,
  children,
}: PlatformAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, isOpen]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      const observer = new ResizeObserver(() => {
        setContentHeight(contentRef.current?.scrollHeight ?? 0);
      });
      observer.observe(contentRef.current);
      return () => observer.disconnect();
    }
  }, [isOpen]);

  return (
    <div
      style={{
        borderRadius: '12px',
        backgroundColor: 'var(--surface-container, #1C2027)',
        border: '1px solid var(--border-default, #243447)',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary, #F5F7FA)',
          cursor: 'pointer',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          {icon}
          <span style={{ fontSize: '15px', fontWeight: 600, whiteSpace: 'nowrap' }}>{title}</span>
          {badge}
        </div>
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: '20px',
            color: 'var(--text-muted, #66768D)',
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            flexShrink: 0,
          }}
        >
          expand_more
        </span>
      </button>

      <div
        style={{
          maxHeight: isOpen ? `${contentHeight}px` : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease',
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div
          ref={contentRef}
          style={{
            padding: '0 20px 20px 20px',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

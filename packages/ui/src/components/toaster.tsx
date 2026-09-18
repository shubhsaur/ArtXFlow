'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  id?: string;
  type?: ToastType;
  duration?: number;
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  type: ToastType;
  duration: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

// In-memory store for imperative toast management
let toasts: ToastItem[] = [];
const listeners = new Set<ToastListener>();

function emit() {
  const current = [...toasts];
  listeners.forEach((listener) => listener(current));
}

let counter = 0;
function generateId(): string {
  counter += 1;
  return `toast-${Date.now()}-${counter}`;
}

export function createToast(
  title: React.ReactNode,
  options: ToastOptions = {},
): string {
  const id = options.id || generateId();
  const newToast: ToastItem = {
    id,
    title,
    description: options.description,
    type: options.type || 'info',
    duration: options.duration ?? 4000,
    action: options.action,
    createdAt: Date.now(),
  };

  // Replace existing with same ID or append
  const existingIndex = toasts.findIndex((t) => t.id === id);
  if (existingIndex >= 0) {
    toasts[existingIndex] = newToast;
  } else {
    toasts = [...toasts, newToast];
  }

  emit();
  return id;
}

export function dismissToast(id?: string) {
  if (id) {
    toasts = toasts.filter((t) => t.id !== id);
  } else {
    toasts = [];
  }
  emit();
}

export const toast = Object.assign(
  (title: React.ReactNode, options?: ToastOptions) => createToast(title, options),
  {
    success: (title: React.ReactNode, options?: Omit<ToastOptions, 'type'>) =>
      createToast(title, { ...options, type: 'success' }),
    error: (title: React.ReactNode, options?: Omit<ToastOptions, 'type'>) =>
      createToast(title, { ...options, type: 'error' }),
    info: (title: React.ReactNode, options?: Omit<ToastOptions, 'type'>) =>
      createToast(title, { ...options, type: 'info' }),
    warning: (title: React.ReactNode, options?: Omit<ToastOptions, 'type'>) =>
      createToast(title, { ...options, type: 'warning' }),
    dismiss: (id?: string) => dismissToast(id),
  },
);

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<ToastItem[]>(toasts);

  useEffect(() => {
    const handleUpdate = (updated: ToastItem[]) => setCurrentToasts(updated);
    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    toasts: currentToasts,
    toast,
    dismiss: dismissToast,
  };
}

export interface ToasterProps {
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  maxVisible?: number;
}

const TYPE_CONFIG: Record<
  ToastType,
  {
    icon: React.ReactNode;
    color: string;
    border: string;
    bgAccent: string;
    glow: string;
  }
> = {
  success: {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    color: '#10B981',
    border: 'rgba(16, 185, 129, 0.35)',
    bgAccent: 'rgba(16, 185, 129, 0.12)',
    glow: '0 8px 24px rgba(16, 185, 129, 0.15)',
  },
  error: {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
    color: '#EF4444',
    border: 'rgba(239, 68, 68, 0.35)',
    bgAccent: 'rgba(239, 68, 68, 0.12)',
    glow: '0 8px 24px rgba(239, 68, 68, 0.15)',
  },
  warning: {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    color: '#F59E0B',
    border: 'rgba(245, 158, 11, 0.35)',
    bgAccent: 'rgba(245, 158, 11, 0.12)',
    glow: '0 8px 24px rgba(245, 158, 11, 0.15)',
  },
  info: {
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    color: '#19D7FE',
    border: 'rgba(25, 215, 254, 0.35)',
    bgAccent: 'rgba(25, 215, 254, 0.12)',
    glow: '0 8px 24px rgba(25, 215, 254, 0.15)',
  },
};

interface ToastCardProps {
  item: ToastItem;
  isTop: boolean;
  onDismiss: (id: string) => void;
}

function ToastCard({ item, isTop, onDismiss }: ToastCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const remainingRef = useRef(item.duration);
  const startTimeRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTimer = useCallback(() => {
    if (item.duration === Infinity || item.duration <= 0) return;
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      onDismiss(item.id);
    }, remainingRef.current);
  }, [item.duration, item.id, onDismiss]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - startTimeRef.current;
      remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    }
  }, []);

  useEffect(() => {
    if (!isHovered) {
      startTimer();
    } else {
      pauseTimer();
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isHovered, startTimer, pauseTimer]);

  const config = TYPE_CONFIG[item.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: isTop ? -18 : 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{
        opacity: 0,
        scale: 0.94,
        y: isTop ? -12 : 12,
        transition: { duration: 0.18, ease: 'easeOut' },
      }}
      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role={item.type === 'error' ? 'alert' : 'status'}
      aria-live={item.type === 'error' ? 'assertive' : 'polite'}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '12px 14px',
        minWidth: '300px',
        maxWidth: '440px',
        borderRadius: '10px',
        backgroundColor: 'var(--surface-elevated, #131E2F)',
        border: `1px solid ${config.border}`,
        boxShadow: `${config.glow}, 0 4px 12px rgba(0, 0, 0, 0.4)`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        color: 'var(--text-primary, #F5F7FA)',
        pointerEvents: 'auto',
        boxSizing: 'border-box',
      }}
    >
      {/* Type Icon Badge */}
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: config.bgAccent,
          color: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div
          style={{
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: 1.45,
            color: 'var(--text-primary, #F5F7FA)',
            wordBreak: 'break-word',
          }}
        >
          {item.title}
        </div>
        {item.description && (
          <div
            style={{
              fontSize: '12px',
              color: 'var(--text-secondary, #AAB5C4)',
              lineHeight: 1.4,
              wordBreak: 'break-word',
            }}
          >
            {item.description}
          </div>
        )}
        {item.action && (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick();
              onDismiss(item.id);
            }}
            style={{
              alignSelf: 'flex-start',
              marginTop: '6px',
              background: 'none',
              border: `1px solid ${config.border}`,
              color: config.color,
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {item.action.label}
          </button>
        )}
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss toast"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary, #AAB5C4)',
          cursor: 'pointer',
          padding: '2px',
          margin: '-2px -2px 0 0',
          fontSize: '16px',
          lineHeight: 1,
          opacity: 0.7,
          transition: 'opacity 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.7';
        }}
      >
        ×
      </button>
    </motion.div>
  );
}

export function Toaster({
  position = 'bottom-right',
  maxVisible = 5,
}: ToasterProps) {
  const { toasts: activeToasts, dismiss } = useToast();

  const isTop = position.startsWith('top');
  const isLeft = position.endsWith('left');
  const isCenter = position.endsWith('center');

  const visibleToasts = activeToasts.slice(-maxVisible);

  return (
    <aside
      aria-label="Notifications"
      style={{
        position: 'fixed',
        zIndex: 9999,
        top: isTop ? '20px' : undefined,
        bottom: !isTop ? '20px' : undefined,
        left: isLeft ? '20px' : isCenter ? '50%' : undefined,
        right: !isLeft && !isCenter ? '20px' : undefined,
        transform: isCenter ? 'translateX(-50%)' : undefined,
        display: 'flex',
        flexDirection: isTop ? 'column' : 'column-reverse',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {visibleToasts.map((t) => (
          <ToastCard
            key={t.id}
            item={t}
            isTop={isTop}
            onDismiss={dismiss}
          />
        ))}
      </AnimatePresence>
    </aside>
  );
}

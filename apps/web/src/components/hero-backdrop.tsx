'use client';

import React, { useState, useEffect } from 'react';

export function HeroBackdrop() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      // Subtle normalized coordinates (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax offsets for ambient light
  const spotlightX = mounted ? mousePosition.x * 35 : 0;
  const spotlightY = mounted ? mousePosition.y * 25 : 0;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '920px',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        userSelect: 'none',
      }}
    >
      {/* 1. Dynamic Perspective & Radial Grid Texture */}
      <div
        className="bg-grid"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.85,
          maskImage: 'radial-gradient(ellipse 90% 70% at 50% 25%, #000 50%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 70% at 50% 25%, #000 50%, transparent 95%)',
        }}
      />

      {/* 2. Interactive Aurora Spotlight */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '50%',
          width: '760px',
          height: '420px',
          transform: `translate(calc(-50% + ${spotlightX}px), ${spotlightY}px)`,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse at center, var(--glow-primary, rgba(11, 135, 254, 0.28)) 0%, var(--glow-accent, rgba(25, 215, 254, 0.15)) 40%, transparent 75%)',
          filter: 'blur(70px)',
          transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* Subtle Purple Counter-Aura */}
      <div
        style={{
          position: 'absolute',
          top: '220px',
          left: '50%',
          width: '640px',
          height: '340px',
          transform: `translate(calc(-50% - ${spotlightX * 0.8}px), ${-spotlightY * 0.5}px)`,
          borderRadius: '50%',
          background: 'radial-gradient(circle, var(--glow-purple, rgba(122, 92, 253, 0.2)) 0%, transparent 70%)',
          filter: 'blur(80px)',
          transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* 3. The Content Flow Circuit: SVG Stream Lines & Live Data Packets */}
      <svg
        viewBox="0 0 1440 850"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '1600px',
          height: '850px',
        }}
      >
        <defs>
          {/* Stream Flow Gradient */}
          <linearGradient id="flowBeamLeft" x1="50%" y1="20%" x2="0%" y2="80%">
            <stop offset="0%" stopColor="var(--axf-cyan, #19D7FE)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="var(--axf-blue, #0B87FE)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--axf-purple, #7A5CFD)" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="flowBeamRight" x1="50%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="var(--axf-cyan, #19D7FE)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="var(--axf-blue, #0B87FE)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--axf-purple, #7A5CFD)" stopOpacity="0" />
          </linearGradient>

          {/* Central Hub Core Gradient */}
          <radialGradient id="hubGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--axf-cyan, #19D7FE)" stopOpacity="0.8" />
            <stop offset="60%" stopColor="var(--axf-blue, #0B87FE)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>

          {/* Glow filter for data packets */}
          <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- Central Origin Hub (Canonical Broadcast Source) --- */}
        <g transform="translate(720, 160)">
          {/* Radiating pulse waves */}
          <circle cx="0" cy="0" r="18" fill="url(#hubGradient)" className="pulse-hub" />
          <circle
            cx="0"
            cy="0"
            r="38"
            stroke="var(--axf-cyan, #19D7FE)"
            strokeWidth="1"
            strokeOpacity="0.3"
            strokeDasharray="4 4"
            className="spin-reverse-slow"
          />
          <circle
            cx="0"
            cy="0"
            r="60"
            stroke="var(--axf-blue, #0B87FE)"
            strokeWidth="1"
            strokeOpacity="0.15"
            strokeDasharray="6 6"
            className="spin-slow"
          />
          <circle cx="0" cy="0" r="4" fill="var(--axf-cyan, #19D7FE)" filter="url(#packetGlow)" />
        </g>

        {/* --- Pipeline Trace: Left Top (To DEV.to Node) --- */}
        <path
          id="pathLeftTop"
          d="M 720 160 C 580 160, 420 110, 220 120"
          stroke="var(--border-subtle, #142232)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          fill="none"
        />
        {/* Active Laser Stream */}
        <path
          d="M 720 160 C 580 160, 420 110, 220 120"
          stroke="url(#flowBeamLeft)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="30 180"
          fill="none"
          className="flow-stream-fast"
        />
        {/* Traveling Data Packet */}
        <circle r="3.5" fill="var(--axf-cyan, #19D7FE)" filter="url(#packetGlow)">
          <animateMotion dur="4.2s" repeatCount="indefinite" path="M 720 160 C 580 160, 420 110, 220 120" />
        </circle>

        {/* --- Pipeline Trace: Left Mid (To Inngest Flow Node) --- */}
        <path
          id="pathLeftMid"
          d="M 720 160 C 560 210, 360 280, 160 380"
          stroke="var(--border-subtle, #142232)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          fill="none"
        />
        <path
          d="M 720 160 C 560 210, 360 280, 160 380"
          stroke="url(#flowBeamLeft)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="45 240"
          fill="none"
          className="flow-stream-medium"
        />
        <circle r="4" fill="#0B87FE" filter="url(#packetGlow)">
          <animateMotion dur="5.6s" repeatCount="indefinite" path="M 720 160 C 560 210, 360 280, 160 380" />
        </circle>

        {/* --- Pipeline Trace: Right Top (To Canonical SEO Node) --- */}
        <path
          id="pathRightTop"
          d="M 720 160 C 860 160, 1020 110, 1220 120"
          stroke="var(--border-subtle, #142232)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          fill="none"
        />
        <path
          d="M 720 160 C 860 160, 1020 110, 1220 120"
          stroke="url(#flowBeamRight)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="30 180"
          fill="none"
          className="flow-stream-fast"
        />
        <circle r="3.5" fill="var(--axf-cyan, #19D7FE)" filter="url(#packetGlow)">
          <animateMotion dur="4.8s" repeatCount="indefinite" path="M 720 160 C 860 160, 1020 110, 1220 120" />
        </circle>

        {/* --- Pipeline Trace: Right Mid (To Hashnode & Medium Node) --- */}
        <path
          id="pathRightMid"
          d="M 720 160 C 880 210, 1080 280, 1280 380"
          stroke="var(--border-subtle, #142232)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          fill="none"
        />
        <path
          d="M 720 160 C 880 210, 1080 280, 1280 380"
          stroke="url(#flowBeamRight)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="45 240"
          fill="none"
          className="flow-stream-medium"
        />
        <circle r="4" fill="var(--axf-purple, #7A5CFD)" filter="url(#packetGlow)">
          <animateMotion dur="5.1s" repeatCount="indefinite" path="M 720 160 C 880 210, 1080 280, 1280 380" />
        </circle>

        {/* Terminal Connection Node Rings */}
        <g transform="translate(220, 120)">
          <circle cx="0" cy="0" r="8" fill="var(--surface-elevated, #131E2F)" stroke="var(--axf-cyan, #19D7FE)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="3" fill="var(--axf-cyan, #19D7FE)" />
        </g>
        <g transform="translate(160, 380)">
          <circle cx="0" cy="0" r="8" fill="var(--surface-elevated, #131E2F)" stroke="var(--axf-blue, #0B87FE)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="3" fill="var(--axf-blue, #0B87FE)" />
        </g>
        <g transform="translate(1220, 120)">
          <circle cx="0" cy="0" r="8" fill="var(--surface-elevated, #131E2F)" stroke="var(--axf-cyan, #19D7FE)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="3" fill="var(--axf-cyan, #19D7FE)" />
        </g>
        <g transform="translate(1280, 380)">
          <circle cx="0" cy="0" r="8" fill="var(--surface-elevated, #131E2F)" stroke="var(--axf-purple, #7A5CFD)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r="3" fill="var(--axf-purple, #7A5CFD)" />
        </g>
      </svg>

      {/* 4. Peripheral Developer & Architecture Floating Micro-Chips */}
      {/* LEFT TOP: DEV.to & Multi-Publish Status */}
      <div
        className="hero-dev-chip hero-chip-float-1"
        style={{
          position: 'absolute',
          top: '110px',
          left: 'max(20px, calc(50% - 660px))',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-lg, 12px)',
          background: 'var(--surface-glass, rgba(13, 20, 32, 0.78))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border, #1C2A3A)',
          boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.35), 0 0 16px var(--glow-primary)',
          fontSize: '12px',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#10B981',
            boxShadow: '0 0 8px #10B981',
            display: 'inline-block',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'ui-monospace, monospace' }}>
            POST /api/publish
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            DEV.to · Hashnode · Medium · Blog
          </span>
        </div>
      </div>

      {/* LEFT BOTTOM: Inngest Idempotent Pipeline */}
      <div
        className="hero-dev-chip hero-chip-float-2"
        style={{
          position: 'absolute',
          top: '370px',
          left: 'max(16px, calc(50% - 700px))',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-lg, 12px)',
          background: 'var(--surface-glass, rgba(13, 20, 32, 0.78))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border-highlight, rgba(25, 215, 254, 0.35))',
          boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.35)',
          fontSize: '12px',
        }}
      >
        <span style={{ fontSize: '16px' }}>⚡</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'ui-monospace, monospace' }}>
            Inngest Workflow
          </span>
          <span style={{ fontSize: '11px', color: 'var(--axf-cyan, #19D7FE)' }}>
            idempotent · 4 steps resolved
          </span>
        </div>
      </div>

      {/* RIGHT TOP: Canonical SEO Tag Protection */}
      <div
        className="hero-dev-chip hero-chip-float-3"
        style={{
          position: 'absolute',
          top: '110px',
          right: 'max(20px, calc(50% - 660px))',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-lg, 12px)',
          background: 'var(--surface-glass, rgba(13, 20, 32, 0.78))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border, #1C2A3A)',
          boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.35), 0 0 16px var(--glow-accent)',
          fontSize: '12px',
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: 'rgba(25, 215, 254, 0.15)',
            color: 'var(--axf-cyan, #19D7FE)',
            fontSize: '11px',
            fontWeight: 700,
          }}
        >
          ✓
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'ui-monospace, monospace' }}>
            rel=&quot;canonical&quot;
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Guaranteed 100% SEO authority
          </span>
        </div>
      </div>

      {/* RIGHT BOTTOM: Multi-Dialect Markdown Engine */}
      <div
        className="hero-dev-chip hero-chip-float-4"
        style={{
          position: 'absolute',
          top: '370px',
          right: 'max(16px, calc(50% - 700px))',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderRadius: 'var(--radius-lg, 12px)',
          background: 'var(--surface-glass, rgba(13, 20, 32, 0.78))',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid var(--border, #1C2A3A)',
          boxShadow: '0 12px 28px -6px rgba(0, 0, 0, 0.35), 0 0 16px var(--glow-purple)',
          fontSize: '12px',
        }}
      >
        <span style={{ fontSize: '16px' }}>📝</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'ui-monospace, monospace' }}>
            Dialect Adapter
          </span>
          <span style={{ fontSize: '11px', color: 'var(--axf-purple, #B49BFF)' }}>
            DEV frontmatter · Medium HTML · Hashnode AST
          </span>
        </div>
      </div>
    </div>
  );
}

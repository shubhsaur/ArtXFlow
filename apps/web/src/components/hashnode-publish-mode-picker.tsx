'use client';

import React from 'react';
import type { HashnodePublishMode } from '@artxflow/types';

export interface HashnodePublishModeOption {
  id: HashnodePublishMode;
  icon: string;
  title: string;
  costLabel: string;
  summary: string;
  details: string[];
  disclaimers: string[];
  recommended?: boolean;
}

export const HASHNODE_PUBLISH_MODE_OPTIONS: HashnodePublishModeOption[] = [
  {
    id: 'extension',
    icon: '⚡',
    title: 'Chrome Extension',
    costLabel: 'Free',
    recommended: true,
    summary: 'Silent background publishing from your Hashnode browser session.',
    details: [
      'ArtXFlow opens a hidden Hashnode editor tab, fills the post, and publishes for you.',
      'No Hashnode Pro subscription required.',
    ],
    disclaimers: [
      'Requires the ArtXFlow Companion Extension loaded in Chrome (or another Chromium browser) and being logged into hashnode.com in that same browser.',
      'Does not run on a schedule — you must click Publish in ArtXFlow while the extension is active.',
    ],
  },
  {
    id: 'hn_new',
    icon: '📋',
    title: 'Copy Markdown & Open hn.new',
    costLabel: 'Free',
    summary: 'One click copies the article and opens the Hashnode new-post editor.',
    details: [
      'Best instant fallback if you do not want to install an extension.',
      'You finish publishing in Hashnode, then paste the live URL back into ArtXFlow.',
    ],
    disclaimers: [
      'ArtXFlow cannot click Publish on Hashnode for you in this mode.',
      'Status stays pending until you record the live URL. Canonical URL / tags must be set in Hashnode if you care about them.',
    ],
  },
  {
    id: 'manual',
    icon: '🔗',
    title: 'Record Live URL',
    costLabel: 'Free',
    summary: 'You publish on Hashnode yourself, then paste the live URL to sync status.',
    details: [
      'Use this if the article is already live, or you want full control of the Hashnode editor.',
      'Recording the URL marks the ArtXFlow publication as PUBLISHED.',
    ],
    disclaimers: [
      'ArtXFlow will not post, update, or retry on Hashnode in this mode.',
      'Recording a URL only syncs ArtXFlow status — it does not change the Hashnode post.',
    ],
  },
  {
    id: 'api',
    icon: '🔑',
    title: 'Hashnode GraphQL API',
    costLabel: 'Pro',
    summary: 'Fully automated server-side publishing, including scheduled posts.',
    details: [
      'Uses your Personal Access Token against Hashnode’s publishPost API.',
      'Updates and retries run in the background without a browser session.',
    ],
    disclaimers: [
      'Hashnode paywalled write APIs behind Hashnode Pro ($19/mo per publication). A free PAT can verify identity but cannot publish.',
      'If the API rejects the request, ArtXFlow still offers the free extension / hn.new / live-URL fallbacks.',
    ],
  },
];

interface HashnodePublishModePickerProps {
  value: HashnodePublishMode;
  onChange: (mode: HashnodePublishMode) => void;
  disabled?: boolean;
  saving?: boolean;
}

export function HashnodePublishModePicker({
  value,
  onChange,
  disabled = false,
  saving = false,
}: HashnodePublishModePickerProps) {
  return (
    <fieldset
      style={{
        border: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        minWidth: 0,
      }}
    >
      <legend
        style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-primary, #F5F7FA)',
          padding: 0,
          marginBottom: '2px',
        }}
      >
        Default Hashnode publish method
      </legend>
      <p
        style={{
          fontSize: '12px',
          color: 'var(--text-secondary, #AAB5C4)',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Choose how ArtXFlow should publish to Hashnode. This is the default action when you hit
        Publish; the other free options remain available as fallbacks.
      </p>

      <div
        role="radiogroup"
        aria-label="Default Hashnode publish method"
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        {HASHNODE_PUBLISH_MODE_OPTIONS.map((option) => {
          const selected = value === option.id;
          return (
            <label
              key={option.id}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: selected
                  ? 'rgba(11, 135, 254, 0.08)'
                  : 'var(--surface-elevated, #131E2F)',
                border: `1px solid ${
                  selected ? 'rgba(11, 135, 254, 0.45)' : 'var(--border, #1C2A3A)'
                }`,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.7 : 1,
              }}
            >
              <input
                type="radio"
                name="hashnode-publish-mode"
                value={option.id}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option.id)}
                style={{ marginTop: '3px', accentColor: 'var(--axf-blue, #0B87FE)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ fontSize: '14px' }} aria-hidden>
                    {option.icon}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text-primary, #F5F7FA)',
                    }}
                  >
                    {option.title}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor:
                        option.costLabel === 'Free'
                          ? 'rgba(16, 185, 129, 0.15)'
                          : 'rgba(245, 158, 11, 0.15)',
                      color: option.costLabel === 'Free' ? '#34D399' : '#F59E0B',
                      border: `1px solid ${
                        option.costLabel === 'Free'
                          ? 'rgba(16, 185, 129, 0.3)'
                          : 'rgba(245, 158, 11, 0.3)'
                      }`,
                    }}
                  >
                    {option.costLabel}
                  </span>
                  {option.recommended && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'rgba(25, 215, 254, 0.12)',
                        color: 'var(--axf-cyan, #19D7FE)',
                        border: '1px solid rgba(25, 215, 254, 0.3)',
                      }}
                    >
                      Recommended
                    </span>
                  )}
                  {selected && saving && (
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)' }}>
                      Saving…
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: 'var(--text-secondary, #AAB5C4)',
                    lineHeight: 1.45,
                  }}
                >
                  {option.summary}
                </p>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: '16px',
                    fontSize: '12px',
                    color: 'var(--text-primary, #F5F7FA)',
                    lineHeight: 1.45,
                  }}
                >
                  {option.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
                <div
                  style={{
                    fontSize: '11px',
                    color: '#FBBF24',
                    lineHeight: 1.45,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}
                >
                  {option.disclaimers.map((disclaimer) => (
                    <span key={disclaimer}>⚠ {disclaimer}</span>
                  ))}
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function hashnodePublishModeLabel(mode: HashnodePublishMode): string {
  return HASHNODE_PUBLISH_MODE_OPTIONS.find((option) => option.id === mode)?.title ?? mode;
}

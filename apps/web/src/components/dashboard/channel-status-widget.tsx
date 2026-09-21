import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@artxflow/ui';

export interface ChannelInfo {
  id: 'devto' | 'medium' | 'hashnode' | 'site';
  name: string;
  isConnected: boolean;
  accountHandle?: string | null;
  modeLabel?: string | null;
  badgeColor: string;
  iconText: string;
}

interface ChannelStatusWidgetProps {
  channels: ChannelInfo[];
  hostedSiteUrl?: string | null;
}

export function ChannelStatusWidget({ channels, hostedSiteUrl }: ChannelStatusWidgetProps) {
  return (
    <Card style={{ backgroundColor: '#1F2937' }}>
      <CardHeader style={{ paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <CardTitle style={{ fontSize: '16px', fontWeight: 700 }}>
              Publishing Channels
            </CardTitle>
            <CardDescription style={{ fontSize: '13px', marginTop: '2px' }}>
              Connected developer network destinations.
            </CardDescription>
          </div>
          <Link
            href="/settings"
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--axf-cyan, #19D7FE)',
              textDecoration: 'none',
            }}
          >
            Manage ↗
          </Link>
        </div>
      </CardHeader>

      <CardContent style={{ padding: '0 16px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {channels.map((channel) => (
            <div
              key={channel.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border-subtle, #142232)',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface, #0D1420)',
                    border: '1px solid var(--border, #1C2A3A)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: channel.badgeColor,
                    flexShrink: 0,
                  }}
                >
                  {channel.iconText}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                      {channel.name}
                    </span>
                    {channel.modeLabel && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          backgroundColor: 'rgba(25, 215, 254, 0.1)',
                          color: 'var(--axf-cyan, #19D7FE)',
                        }}
                      >
                        {channel.modeLabel}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)' }}>
                    {channel.isConnected
                      ? channel.accountHandle
                        ? `@${channel.accountHandle}`
                        : 'Active destination'
                      : 'Not configured'}
                  </span>
                </div>
              </div>

              <div>
                {channel.isConnected ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#34D399',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        display: 'inline-block',
                      }}
                    />
                    Live
                  </span>
                ) : (
                  <Link
                    href="/settings"
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--axf-cyan, #19D7FE)',
                      textDecoration: 'none',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(25, 215, 254, 0.08)',
                    }}
                  >
                    Connect +
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {hostedSiteUrl && (
          <div
            style={{
              marginTop: '12px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'rgba(25, 215, 254, 0.04)',
              border: '1px dashed rgba(25, 215, 254, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
            }}
          >
            <span style={{ color: 'var(--text-secondary, #AAB5C4)' }}>Hosted Site URL:</span>
            <a
              href={hostedSiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--axf-cyan, #19D7FE)', fontWeight: 600, textDecoration: 'none' }}
            >
              {hostedSiteUrl.replace(/^https?:\/\//, '')} ↗
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

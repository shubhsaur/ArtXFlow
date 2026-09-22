import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@artxflow/ui';

export interface UpcomingScheduleItem {
  id: string;
  articleId: string;
  articleTitle: string;
  scheduledAt: string | Date;
  destinationCount: number;
}

interface ScheduledPipelineWidgetProps {
  schedules: UpcomingScheduleItem[];
}

export function ScheduledPipelineWidget({ schedules }: ScheduledPipelineWidgetProps) {
  return (
    <Card style={{ backgroundColor: '#1F2937' }}>
      <CardHeader style={{ paddingBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <CardTitle style={{ fontSize: '16px', fontWeight: 700 }}>
              Distribution Pipeline
            </CardTitle>
            <CardDescription style={{ fontSize: '13px', marginTop: '2px' }}>
              Scheduled releases & Inngest workflow status.
            </CardDescription>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 7px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.25)',
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
            Worker Active
          </span>
        </div>
      </CardHeader>

      <CardContent style={{ padding: '0 16px 16px' }}>
        {schedules.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border-subtle, #142232)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <Link
                    href={`/articles/${schedule.articleId}`}
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--text-primary, #F5F7FA)',
                      textDecoration: 'none',
                    }}
                  >
                    {schedule.articleTitle}
                  </Link>
                  <Badge variant="info">
                    {schedule.destinationCount} channel{schedule.destinationCount === 1 ? '' : 's'}
                  </Badge>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--axf-cyan, #19D7FE)' }}>
                  <span>⏰</span>
                  <span>
                    {new Date(schedule.scheduledAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'var(--surface-elevated, #131E2F)',
              border: '1px solid var(--border-subtle, #142232)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>⚡️</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary, #F5F7FA)' }}>
                Zero Pending Releases
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)', margin: 0, lineHeight: 1.4 }}>
              When you schedule an article release, Inngest triggers idempotent jobs to publish across destinations at the target UTC time.
            </p>
          </div>
        )}

        {/* Canonical Architecture Tip */}
        <div
          style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(122, 92, 253, 0.06)',
            border: '1px solid rgba(122, 92, 253, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13px' }}>🛡️</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--axf-purple, #7A5CFD)' }}>
              SEO Canonical Protection
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)', margin: 0, lineHeight: 1.4 }}>
            Articles syndicated to DEV.to and Medium automatically point canonical URLs back to your canonical blog to safeguard domain authority.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

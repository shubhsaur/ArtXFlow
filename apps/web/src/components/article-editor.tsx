'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge, Card, ArticlePreview } from '@artxflow/ui';
import type { Article, ArticleVersion, ArticleStatus } from '@artxflow/database';
import type { PublicationDto, ScheduleDto } from '@artxflow/publishing';

export interface ArticleEditorProps {
  initialArticle?: Article;
  initialVersion?: ArticleVersion | null;
  mode: 'create' | 'edit';
}

export function ArticleEditor({ initialArticle, initialVersion, mode }: ArticleEditorProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [isManualSlug, setIsManualSlug] = useState(mode === 'edit');
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || '');
  const [status, setStatus] = useState<ArticleStatus>(initialArticle?.status || 'DRAFT');
  const [content, setContent] = useState(initialVersion?.content || '');
  const [activeVersionNumber, setActiveVersionNumber] = useState<number>(
    initialVersion?.versionNumber || 1,
  );

  const [viewMode, setViewMode] = useState<'write' | 'preview' | 'split'>('write');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'unsaved'>('idle');
  const [publications, setPublications] = useState<PublicationDto[]>([]);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTimezone, setScheduleTimezone] = useState(
    typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'UTC',
  );
  const [scheduling, setScheduling] = useState(false);

  React.useEffect(() => {
    if (mode === 'edit' && initialArticle?.id) {
      fetch(`/api/articles/${initialArticle.id}/publications`)
        .then((res) => (res.ok ? res.json() : { publications: [] }))
        .then((data) => {
          if (data.publications) {
            setPublications(data.publications);
          }
        })
        .catch(() => {});

      fetch(`/api/articles/${initialArticle.id}/schedule`)
        .then((res) => (res.ok ? res.json() : { schedules: [] }))
        .then((data) => {
          if (data.schedules) {
            setSchedules(data.schedules);
          }
        })
        .catch(() => {});
    }
  }, [mode, initialArticle?.id]);

  const activeSchedule = schedules.find((s) => s.status === 'SCHEDULED');

  const isPublishing =
    publishing || publications.some((p) => p.status === 'PUBLISHING' || p.status === 'QUEUED');
  const publishedPublication = publications.find((p) => p.status === 'PUBLISHED');
  const failedPublication = publications.find(
    (p) => p.status === 'FAILED' || p.status === 'UNKNOWN_OUTCOME',
  );
  const isPartiallyPublished =
    publications.some((p) => p.status === 'PUBLISHED') &&
    publications.some((p) => p.status === 'FAILED' || p.status === 'UNKNOWN_OUTCOME');

  async function handleRetry(publicationId: string) {
    if (!initialArticle?.id) return;
    setError(null);
    setPublishing(true);
    setPublishMessage('Retrying publication...');

    try {
      const res = await fetch(
        `/api/articles/${initialArticle.id}/publications/${publicationId}/retry`,
        {
          method: 'POST',
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to trigger retry');
      }

      setPublications((prev) => prev.map((p) => (p.id === publicationId ? data : p)));

      // Poll briefly for retry completion
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const pollRes = await fetch(`/api/articles/${initialArticle.id}/publications`);
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            if (pollData.publications) {
              setPublications(pollData.publications);
              const target = pollData.publications.find(
                (p: PublicationDto) => p.id === publicationId,
              );
              if (
                target &&
                (target.status === 'PUBLISHED' ||
                  target.status === 'FAILED' ||
                  target.status === 'UNKNOWN_OUTCOME' ||
                  attempts >= 8)
              ) {
                clearInterval(interval);
                setPublishing(false);
                if (target.status === 'PUBLISHED') {
                  setStatus('READY');
                  setPublishMessage('Publication successfully retried and published!');
                } else if (target.status === 'UNKNOWN_OUTCOME') {
                  setPublishMessage('Retry outcome unknown. Please verify destination status.');
                } else {
                  setPublishMessage('Publication retry failed.');
                }
              }
            }
          }
        } catch {
          clearInterval(interval);
          setPublishing(false);
        }
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error retrying publication');
      setPublishing(false);
      setPublishMessage(null);
    }
  }

  async function handlePublish() {
    if (!initialArticle?.id) return;
    setError(null);
    setPublishing(true);
    setPublishMessage('Publishing queued...');

    try {
      const res = await fetch(`/api/articles/${initialArticle.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to trigger publication');
      }

      if (data.publications) {
        setPublications(data.publications);
      }

      // Poll briefly for completion
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const pollRes = await fetch(`/api/articles/${initialArticle.id}/publications`);
          if (pollRes.ok) {
            const pollData = await pollRes.json();
            if (pollData.publications) {
              setPublications(pollData.publications);
              const anyPublished = pollData.publications.some(
                (p: PublicationDto) => p.status === 'PUBLISHED',
              );
              const anyFailed = pollData.publications.some(
                (p: PublicationDto) => p.status === 'FAILED',
              );
              if (anyPublished || anyFailed || attempts >= 8) {
                clearInterval(interval);
                setPublishing(false);
                if (anyPublished) {
                  setStatus('READY');
                  setPublishMessage('Article successfully published!');
                } else if (anyFailed) {
                  setPublishMessage('Publication failed.');
                }
              }
            }
          }
        } catch {
          clearInterval(interval);
          setPublishing(false);
        }
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error publishing article');
      setPublishing(false);
      setPublishMessage(null);
    }
  }

  async function handleSchedule() {
    if (!initialArticle?.id || !scheduleDate) return;
    setError(null);
    setScheduling(true);

    try {
      const res = await fetch(`/api/articles/${initialArticle.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledAt: scheduleDate,
          timezone: scheduleTimezone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule publication');
      }

      setSchedules((prev) => [data, ...prev.filter((s) => s.id !== data.id)]);
      setShowScheduleModal(false);
      setPublishMessage(
        `Article scheduled for ${new Date(data.scheduledAt).toLocaleString()} (${data.timezone})`,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error scheduling publication');
    } finally {
      setScheduling(false);
    }
  }

  async function handleCancelSchedule(scheduleId: string) {
    if (!initialArticle?.id) return;
    setError(null);

    try {
      const res = await fetch(
        `/api/articles/${initialArticle.id}/schedule?scheduleId=${encodeURIComponent(scheduleId)}`,
        {
          method: 'DELETE',
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to cancel schedule');
      }

      setSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, status: 'CANCELED' } : s)),
      );
      setPublishMessage('Scheduled publication was canceled.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error canceling schedule');
    }
  }

  function handleTitleChange(val: string) {
    setTitle(val);
    setSaveStatus('unsaved');
    if (!isManualSlug) {
      const auto = val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(auto);
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Article title is required.');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      if (mode === 'create') {
        const res = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            slug: slug.trim() || undefined,
            excerpt: excerpt.trim() || undefined,
            content,
            contentFormat: 'markdown',
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create article');
        }

        setSaveStatus('saved');
        router.push(`/articles/${data.article.id}`);
        router.refresh();
      } else {
        const res = await fetch(`/api/articles/${initialArticle?.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            slug: slug.trim() || undefined,
            excerpt: excerpt.trim() || undefined,
            status,
            content,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update article');
        }

        if (data.version?.versionNumber) {
          setActiveVersionNumber(data.version.versionNumber);
        }
        setSaveStatus('saved');
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error saving article');
      setSaveStatus('idle');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: 'var(--text-primary, #F5F7FA)',
            }}
          >
            {mode === 'create' ? 'New Canonical Article' : 'Edit Article'}
          </h1>
          {mode === 'edit' && <Badge variant="info">v{activeVersionNumber}</Badge>}
          <Badge
            variant={status === 'READY' ? 'success' : status === 'ARCHIVED' ? 'default' : 'warning'}
          >
            {status}
          </Badge>

          {/* Publishing status badge */}
          {mode === 'edit' && isPublishing && <Badge variant="info">Publishing...</Badge>}
          {mode === 'edit' && !isPublishing && activeSchedule && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant="info">
                Scheduled: {new Date(activeSchedule.scheduledAt).toLocaleDateString()}{' '}
                {new Date(activeSchedule.scheduledAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                ({activeSchedule.timezone})
              </Badge>
              <button
                type="button"
                onClick={() => handleCancelSchedule(activeSchedule.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary, #AAB5C4)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Cancel Schedule
              </button>
            </div>
          )}
          {mode === 'edit' && !isPublishing && !activeSchedule && isPartiallyPublished && (
            <Badge variant="warning">Partially Published</Badge>
          )}
          {mode === 'edit' &&
            !isPublishing &&
            !activeSchedule &&
            publishedPublication &&
            !isPartiallyPublished && <Badge variant="success">Published</Badge>}
          {mode === 'edit' &&
            !isPublishing &&
            !activeSchedule &&
            !publishedPublication &&
            failedPublication && <Badge variant="warning">Failed</Badge>}

          {/* Public blog article link */}
          {publishedPublication?.externalUrl && (
            <a
              href={publishedPublication.externalUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: '13px',
                color: 'var(--axf-cyan, #00D4FF)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              View Public ↗
            </a>
          )}

          {saveStatus === 'saved' && (
            <span style={{ fontSize: '13px', color: '#10B981' }}>✓ Saved</span>
          )}
          {saveStatus === 'unsaved' && (
            <span style={{ fontSize: '13px', color: '#F59E0B' }}>• Unsaved changes</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Status selector */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as ArticleStatus);
              setSaveStatus('unsaved');
            }}
            aria-label="Article Status"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm, 6px)',
              backgroundColor: 'var(--surface-elevated, #131E2F)',
              border: '1px solid var(--border, #1C2A3A)',
              color: 'var(--text-primary, #F5F7FA)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="DRAFT">DRAFT</option>
            <option value="READY">READY</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>

          {/* View mode toggle */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'var(--surface-elevated, #131E2F)',
              border: '1px solid var(--border, #1C2A3A)',
              borderRadius: 'var(--radius-sm, 6px)',
              padding: '2px',
            }}
          >
            {(['write', 'preview', 'split'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setViewMode(m)}
                style={{
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: viewMode === m ? 'var(--axf-blue, #0B87FE)' : 'transparent',
                  color: viewMode === m ? '#FFFFFF' : 'var(--text-secondary, #AAB5C4)',
                  textTransform: 'capitalize',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          {mode === 'edit' && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={publishing || saving || scheduling}
                onClick={() => setShowScheduleModal(true)}
              >
                Schedule
              </Button>
              <Button
                variant="outline"
                size="sm"
                loading={publishing}
                disabled={publishing || saving}
                onClick={handlePublish}
              >
                Publish
              </Button>
            </>
          )}

          <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
            {mode === 'create' ? 'Create Article' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Schedule Modal / Inline Panel */}
      {showScheduleModal && (
        <Card
          style={{
            padding: '20px',
            backgroundColor: 'var(--surface-elevated, #131E2F)',
            border: '1px solid var(--border, #1C2A3A)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #F5F7FA)',
                  margin: 0,
                }}
              >
                Schedule Publication
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary, #AAB5C4)',
                  marginTop: '4px',
                  margin: 0,
                }}
              >
                Choose a future date, time, and timezone to publish this article version
                automatically.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '16px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-secondary, #AAB5C4)',
                    marginBottom: '6px',
                  }}
                >
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--surface-default, #0B111A)',
                    border: '1px solid var(--border, #1C2A3A)',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-secondary, #AAB5C4)',
                    marginBottom: '6px',
                  }}
                >
                  Timezone (IANA)
                </label>
                <input
                  type="text"
                  value={scheduleTimezone}
                  onChange={(e) => setScheduleTimezone(e.target.value)}
                  placeholder="e.g. America/New_York, UTC"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    backgroundColor: 'var(--surface-default, #0B111A)',
                    border: '1px solid var(--border, #1C2A3A)',
                    color: 'var(--text-primary, #F5F7FA)',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={scheduling}
                disabled={!scheduleDate || scheduling}
                onClick={handleSchedule}
              >
                Confirm Schedule
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Publish Notification Banner */}
      {publishMessage && (
        <div
          role="status"
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: isPublishing
              ? 'rgba(11, 135, 254, 0.15)'
              : publishedPublication
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${
              isPublishing
                ? 'rgba(11, 135, 254, 0.3)'
                : publishedPublication
                  ? 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(239, 68, 68, 0.3)'
            }`,
            color: isPublishing
              ? 'var(--axf-cyan, #00D4FF)'
              : publishedPublication
                ? '#34D399'
                : '#F87171',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{publishMessage}</span>
          <button
            type="button"
            onClick={() => setPublishMessage(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md, 8px)',
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid rgba(220, 38, 38, 0.3)',
            color: '#FCA5A5',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* Destination Publication Statuses & Manual Retries */}
      {publications.some(
        (p) => p.status === 'FAILED' || p.status === 'UNKNOWN_OUTCOME' || p.status === 'RETRYING',
      ) && (
        <Card style={{ backgroundColor: 'var(--surface-elevated, #131E2F)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #F5F7FA)',
                }}
              >
                Destination Publication Issues
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}>
                {
                  publications.filter(
                    (p) => p.status === 'FAILED' || p.status === 'UNKNOWN_OUTCOME',
                  ).length
                }{' '}
                requiring attention
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {publications
                .filter(
                  (p) =>
                    p.status === 'FAILED' ||
                    p.status === 'UNKNOWN_OUTCOME' ||
                    p.status === 'RETRYING',
                )
                .map((pub) => (
                  <div
                    key={pub.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm, 6px)',
                      backgroundColor:
                        pub.status === 'UNKNOWN_OUTCOME'
                          ? 'rgba(245, 158, 11, 0.08)'
                          : 'rgba(239, 68, 68, 0.08)',
                      border: `1px solid ${
                        pub.status === 'UNKNOWN_OUTCOME'
                          ? 'rgba(245, 158, 11, 0.25)'
                          : 'rgba(239, 68, 68, 0.2)'
                      }`,
                      fontSize: '13px',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge
                          variant={
                            pub.status === 'RETRYING' || pub.status === 'UNKNOWN_OUTCOME'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {pub.status}
                        </Badge>
                        <span
                          style={{
                            fontWeight: 500,
                            color: 'var(--text-primary, #F5F7FA)',
                          }}
                        >
                          Destination: {pub.destinationId.slice(0, 8)}...
                        </span>
                      </div>
                      {pub.lastErrorMessage && (
                        <span style={{ fontSize: '12px', color: '#FCA5A5' }}>
                          {pub.lastErrorCode ? `[${pub.lastErrorCode}] ` : ''}
                          {pub.lastErrorMessage}
                        </span>
                      )}
                    </div>

                    {(pub.status === 'FAILED' || pub.status === 'UNKNOWN_OUTCOME') && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isPublishing}
                        onClick={() => handleRetry(pub.id)}
                      >
                        Retry Destination
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </Card>
      )}

      {/* Metadata Configuration */}
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              htmlFor="article-title"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary, #F5F7FA)',
                marginBottom: '6px',
              }}
            >
              Article Title
            </label>
            <input
              id="article-title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Distributed Content Architecture with Next.js and Drizzle"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--surface-elevated, #131E2F)',
                border: '1px solid var(--border, #1C2A3A)',
                color: 'var(--text-primary, #F5F7FA)',
                fontSize: '15px',
                fontWeight: 500,
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <label
                  htmlFor="article-slug"
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-primary, #F5F7FA)',
                  }}
                >
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualSlug(!isManualSlug)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--axf-cyan, #19D7FE)',
                    fontSize: '11px',
                    cursor: 'pointer',
                  }}
                >
                  {isManualSlug ? 'Auto-generate' : 'Edit manually'}
                </button>
              </div>
              <input
                id="article-slug"
                type="text"
                disabled={!isManualSlug}
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSaveStatus('unsaved');
                }}
                placeholder="distributed-content-architecture"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: isManualSlug
                    ? 'var(--surface-elevated, #131E2F)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border, #1C2A3A)',
                  color: 'var(--axf-cyan, #19D7FE)',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="article-excerpt"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-primary, #F5F7FA)',
                  marginBottom: '6px',
                }}
              >
                Excerpt / Meta Description
              </label>
              <input
                id="article-excerpt"
                type="text"
                value={excerpt}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  setSaveStatus('unsaved');
                }}
                placeholder="Brief summary for search engines and platform previews"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--surface-elevated, #131E2F)',
                  border: '1px solid var(--border, #1C2A3A)',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Editor & Preview Area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'split' ? '1fr 1fr' : '1fr',
          gap: '20px',
          minHeight: '480px',
        }}
      >
        {/* Editor Pane */}
        {(viewMode === 'write' || viewMode === 'split') && (
          <Card style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
            <div
              style={{
                marginBottom: '10px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary, #AAB5C4)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Markdown Content
            </div>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setSaveStatus('unsaved');
              }}
              placeholder="# Write your canonical article in Markdown here..."
              aria-label="Markdown content editor"
              style={{
                flex: 1,
                width: '100%',
                minHeight: '400px',
                backgroundColor: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary, #F5F7FA)',
                fontFamily: 'monospace',
                fontSize: '14px',
                lineHeight: '1.6',
                resize: 'vertical',
              }}
            />
          </Card>
        )}

        {/* Preview Pane */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              minWidth: 0,
            }}
          >
            <ArticlePreview
              title={title}
              subtitle={excerpt}
              content={content}
              canonicalUrl={slug ? `/blog/${slug}` : undefined}
              publishedAt={initialArticle?.createdAt}
              showModeSelector={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

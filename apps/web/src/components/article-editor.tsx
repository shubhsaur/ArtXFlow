'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Badge, Card, ArticlePreview, toast } from '@artxflow/ui';
import { PlatformIcon } from './platform-icons';
import type { Article, ArticleVersion, ArticleStatus } from '@artxflow/database';
import type { PublicationDto, ScheduleDto, DestinationDto } from '@artxflow/publishing';
import {
  isClientManagedHashnodePublish,
  isHashnodeDestinationType,
  resolveHashnodePublishMode,
  type HashnodePublishMode,
  isClientManagedMediumPublish,
  isMediumDestinationType,
  resolveMediumPublishMode,
  type MediumPublishMode,
} from '@artxflow/types';
import { HASHNODE_PUBLISH_MODE_OPTIONS } from './hashnode-publish-mode-picker';
import { MEDIUM_PUBLISH_MODE_OPTIONS } from './medium-publish-mode-picker';
import { formatMediumMarkdown, stripFrontmatter } from '@artxflow/platform-adapters/transformers';
import { UnsplashModal, type SelectedUnsplashImage } from './unsplash-modal';
import { EditorToolbar } from './editor/editor-toolbar';
import { EditorCoverUploader } from './editor/editor-cover-uploader';
import { EditorTagInput } from './editor/editor-tag-input';
import { EditorSlashMenu, type SlashAction } from './editor/editor-slash-menu';
import { EditorSidebar } from './editor/editor-sidebar';
import {
  applyInlineFormatting,
  applyHeading,
  applyBlockquote,
  applyList,
  applyCodeBlock,
  applyLink,
  applyDivider,
  applyTable,
  calculateReadingStats,
  checkPublisherReadiness,
} from './editor/formatting-helpers';

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
  const [destinations, setDestinations] = useState<DestinationDto[]>([]);
  const [loadingDestinations, setLoadingDestinations] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedPublishDestinations, setSelectedPublishDestinations] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<ScheduleDto[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedScheduleDestinations, setSelectedScheduleDestinations] = useState<string[]>([]);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTimezone, setScheduleTimezone] = useState(
    typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : 'UTC',
  );
  const [scheduling, setScheduling] = useState(false);
  const [extensionInstalled, setExtensionInstalled] = useState(false);
  const [enablingMedium, setEnablingMedium] = useState(false);
  const mediumAutoProvisionedRef = React.useRef(false);
  const [manualUrlInput, setManualUrlInput] = useState<Record<string, string>>({});
  const [recordingExternal, setRecordingExternal] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showUnsplashModal, setShowUnsplashModal] = useState(false);
  const [unsplashTarget, setUnsplashTarget] = useState<'body' | 'cover'>('body');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(
    ((initialArticle as unknown as Record<string, unknown>)?.coverUrl as string | undefined) ||
      (((initialArticle as unknown as Record<string, unknown>)?.metadata as Record<string, unknown> | undefined)?.coverUrl as string | undefined) ||
      ((initialVersion?.metadata as Record<string, unknown> | undefined)?.coverUrl as string | undefined) ||
      null,
  );
  const [coverAssetId, setCoverAssetId] = useState<string | null>(
    initialArticle?.coverAssetId || null,
  );
  const [tags, setTags] = useState<string[]>(
    Array.isArray(((initialArticle as unknown as Record<string, unknown>)?.metadata as Record<string, unknown> | undefined)?.tags)
      ? (((initialArticle as unknown as Record<string, unknown>)?.metadata as Record<string, unknown>).tags as string[])
      : Array.isArray((initialVersion?.metadata as Record<string, unknown> | undefined)?.tags)
        ? ((initialVersion?.metadata as Record<string, unknown>).tags as string[])
        : [],
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkModalUrl, setLinkModalUrl] = useState('');
  const [linkModalText, setLinkModalText] = useState('');
  const [savedSelectionRange, setSavedSelectionRange] = useState<{ start: number; end: number }>({
    start: 0,
    end: 0,
  });
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertMarkdownSnippet = React.useCallback(
    (snippet: string) => {
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart ?? content.length;
        const end = textarea.selectionEnd ?? content.length;
        const before = content.substring(0, start);
        const after = content.substring(end);
        const prefix =
          before.length > 0 && !before.endsWith('\n\n')
            ? before.endsWith('\n')
              ? '\n'
              : '\n\n'
            : '';
        const suffix =
          after.length > 0 && !after.startsWith('\n\n')
            ? after.startsWith('\n')
              ? '\n'
              : '\n\n'
            : '';
        const newContent = `${before}${prefix}${snippet}${suffix}${after}`;
        setContent(newContent);
        setSaveStatus('unsaved');
        setTimeout(() => {
          textarea.focus();
          const cursorPosition = start + prefix.length + snippet.length;
          textarea.setSelectionRange(cursorPosition, cursorPosition);
        }, 50);
      } else {
        const prefix = content.length > 0 ? '\n\n' : '';
        setContent((prev) => `${prev}${prefix}${snippet}`);
        setSaveStatus('unsaved');
      }
    },
    [content],
  );

  const handleUploadFile = React.useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files (JPEG, PNG, WebP, GIF, SVG) are supported.');
        return;
      }

      setIsUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/assets/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to upload image');
        }

        const { asset } = await res.json();
        const alt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        insertMarkdownSnippet(`![${alt}](${asset.url})`);
        toast.success('Image uploaded successfully!');
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to upload image';
        toast.error(msg);
      } finally {
        setIsUploadingImage(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [insertMarkdownSnippet],
  );

  const coverAssetIdRef = React.useRef<string | null>(initialArticle?.coverAssetId || null);

  const handleUploadCoverFile = React.useCallback(async (file: File): Promise<string | void> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/assets/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to upload cover image');
    }
    const { asset } = await res.json();
    coverAssetIdRef.current = asset.id;
    setCoverUrl(asset.url);
    setCoverAssetId(asset.id);
    setSaveStatus('unsaved');
    toast.success('Cover image uploaded!');
    return asset.url;
  }, []);

  const handleSelectUnsplashImage = React.useCallback(
    (img: SelectedUnsplashImage) => {
      if (unsplashTarget === 'cover') {
        setCoverUrl(img.url);
        coverAssetIdRef.current = null;
        setCoverAssetId(null);
        setSaveStatus('unsaved');
        toast.success('Unsplash cover image set!');
      } else {
        const markdown = `![${img.alt}](${img.url})\n*${img.caption}*`;
        insertMarkdownSnippet(markdown);
        toast.success('Unsplash image inserted!');
      }
    },
    [insertMarkdownSnippet, unsplashTarget],
  );

  const handleInsertEmbed = React.useCallback(
    (url: string) => {
      insertMarkdownSnippet(`\n\n${url}\n\n`);
      toast.success('Embed link inserted!');
    },
    [insertMarkdownSnippet],
  );

  const handleApplyHeading = React.useCallback(
    (level: 1 | 2 | 3 | 0) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const res = applyHeading(content, textarea.selectionStart ?? 0, level);
      setContent(res.newContent);
      setSaveStatus('unsaved');
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(res.newSelectionStart, res.newSelectionEnd);
      }, 50);
    },
    [content],
  );

  const handleApplyInline = React.useCallback(
    (prefix: string, suffix?: string, placeholder?: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      const res = applyInlineFormatting(content, start, end, prefix, suffix, placeholder);
      setContent(res.newContent);
      setSaveStatus('unsaved');
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(res.newSelectionStart, res.newSelectionEnd);
      }, 50);
    },
    [content],
  );

  const handleApplyBlockquote = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const res = applyBlockquote(content, start, end);
    setContent(res.newContent);
    setSaveStatus('unsaved');
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(res.newSelectionStart, res.newSelectionEnd);
    }, 50);
  }, [content]);

  const handleApplyList = React.useCallback(
    (type: 'bullet' | 'number') => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      const res = applyList(content, start, end, type);
      setContent(res.newContent);
      setSaveStatus('unsaved');
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(res.newSelectionStart, res.newSelectionEnd);
      }, 50);
    },
    [content],
  );

  const handleApplyCodeBlock = React.useCallback(
    (lang: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      const res = applyCodeBlock(content, start, end, lang);
      setContent(res.newContent);
      setSaveStatus('unsaved');
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(res.newSelectionStart, res.newSelectionEnd);
      }, 50);
    },
    [content],
  );

  const handleApplyDivider = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const res = applyDivider(content, start);
    setContent(res.newContent);
    setSaveStatus('unsaved');
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(res.newSelectionStart, res.newSelectionEnd);
    }, 50);
  }, [content]);

  const handleApplyTable = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const res = applyTable(content, start);
    setContent(res.newContent);
    setSaveStatus('unsaved');
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(res.newSelectionStart, res.newSelectionEnd);
    }, 50);
  }, [content]);

  const handleOpenLinkModal = React.useCallback(() => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? 0;
    const end = textarea?.selectionEnd ?? 0;
    const selected = content.substring(start, end);
    setSavedSelectionRange({ start, end });
    setLinkModalText(selected);
    setLinkModalUrl('');
    setShowLinkModal(true);
  }, [content]);

  const handleConfirmLink = React.useCallback(() => {
    const textarea = textareaRef.current;
    const res = applyLink(
      content,
      savedSelectionRange.start,
      savedSelectionRange.end,
      linkModalUrl,
      linkModalText,
    );
    setContent(res.newContent);
    setSaveStatus('unsaved');
    setShowLinkModal(false);
    setTimeout(() => {
      textarea?.focus();
      textarea?.setSelectionRange(res.newSelectionStart, res.newSelectionEnd);
    }, 50);
  }, [content, linkModalUrl, linkModalText, savedSelectionRange]);

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '/') {
      const textarea = textareaRef.current;
      if (textarea) {
        const cursor = textarea.selectionStart;
        const lineBefore = content.substring(0, cursor).split('\n').pop() || '';
        if (lineBefore.trim() === '') {
          setShowSlashMenu(true);
          setSlashFilter('');
        }
      }
    } else if (showSlashMenu && (e.key === 'Escape' || e.key === ' ')) {
      setShowSlashMenu(false);
    }

    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'b') {
        e.preventDefault();
        handleApplyInline('**', '**', 'bold text');
      } else if (e.key === 'i') {
        e.preventDefault();
        handleApplyInline('*', '*', 'italic text');
      } else if (e.key === 'u') {
        e.preventDefault();
        handleApplyInline('<u>', '</u>', 'underlined text');
      } else if (e.key === 'e') {
        e.preventDefault();
        handleApplyInline('`', '`', 'code');
      } else if (e.key === 'k') {
        e.preventDefault();
        handleOpenLinkModal();
      } else if (e.shiftKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleApplyInline('~~', '~~', 'strikethrough text');
      }
    }
  };

  const handleSlashSelect = (action: SlashAction) => {
    setShowSlashMenu(false);
    const textarea = textareaRef.current;
    if (!textarea) return;
    const cursor = textarea.selectionStart;
    const beforeCursor = content.substring(0, cursor);
    const afterCursor = content.substring(cursor);
    const slashIdx = beforeCursor.lastIndexOf('/');
    const cleanedBefore = slashIdx >= 0 ? beforeCursor.substring(0, slashIdx) : beforeCursor;
    const cleanedContent = `${cleanedBefore}${afterCursor}`;
    const newCursor = cleanedBefore.length;

    setContent(cleanedContent);

    setTimeout(() => {
      switch (action) {
        case 'h1': {
          const res = applyHeading(cleanedContent, newCursor, 1);
          setContent(res.newContent);
          break;
        }
        case 'h2': {
          const res = applyHeading(cleanedContent, newCursor, 2);
          setContent(res.newContent);
          break;
        }
        case 'h3': {
          const res = applyHeading(cleanedContent, newCursor, 3);
          setContent(res.newContent);
          break;
        }
        case 'bullet': {
          const res = applyList(cleanedContent, newCursor, newCursor, 'bullet');
          setContent(res.newContent);
          break;
        }
        case 'number': {
          const res = applyList(cleanedContent, newCursor, newCursor, 'number');
          setContent(res.newContent);
          break;
        }
        case 'quote': {
          const res = applyBlockquote(cleanedContent, newCursor, newCursor);
          setContent(res.newContent);
          break;
        }
        case 'code': {
          const res = applyCodeBlock(cleanedContent, newCursor, newCursor, 'typescript');
          setContent(res.newContent);
          break;
        }
        case 'image':
          fileInputRef.current?.click();
          break;
        case 'unsplash':
          setUnsplashTarget('body');
          setShowUnsplashModal(true);
          break;
        case 'divider': {
          const res = applyDivider(cleanedContent, newCursor);
          setContent(res.newContent);
          break;
        }
        case 'table': {
          const res = applyTable(cleanedContent, newCursor);
          setContent(res.newContent);
          break;
        }
      }
      setSaveStatus('unsaved');
      textarea.focus();
    }, 50);
  };

  const readingStats = React.useMemo(() => calculateReadingStats(content), [content]);
  const publisherReadiness = React.useMemo(
    () => checkPublisherReadiness(title, tags, content, coverUrl),
    [title, tags, content, coverUrl],
  );

  const handleTextareaPaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            handleUploadFile(file);
            return;
          }
        }
      }
    },
    [handleUploadFile],
  );

  const handleTextareaDrop = React.useCallback(
    (e: React.DragEvent<HTMLTextAreaElement>) => {
      const files = e.dataTransfer?.files;
      if (files && files.length > 0 && files[0].type.startsWith('image/')) {
        e.preventDefault();
        handleUploadFile(files[0]);
      }
    },
    [handleUploadFile],
  );

  const handleEnableMedium = React.useCallback(async () => {
    setEnablingMedium(true);
    setError(null);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'medium',
          mediumPublishMode: 'extension',
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to enable Medium');
      }

      const destRes = await fetch('/api/destinations');
      if (destRes.ok) {
        const destData = await destRes.json();
        if (destData.destinations) {
          setDestinations(destData.destinations);
          const mediumDest = destData.destinations.find((d: DestinationDto) =>
            isMediumDestinationType(d.type),
          );
          if (mediumDest) {
            setSelectedPublishDestinations((prev) =>
              prev.includes(mediumDest.id) ? prev : [...prev, mediumDest.id],
            );
            setSelectedScheduleDestinations((prev) =>
              prev.includes(mediumDest.id) ? prev : [...prev, mediumDest.id],
            );
          }
        }
      }
      const mediumSuccessMsg = 'Medium added! You can now publish via the extension or web editor.';
      setPublishMessage(mediumSuccessMsg);
      toast.success(mediumSuccessMsg);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to enable Medium';
      setError(msg);
      toast.error(msg);
    } finally {
      setEnablingMedium(false);
    }
  }, []);

  async function handleCopyAndOpenHashnode() {
    const fullMarkdown = `# ${title}\n\n${content}`;
    try {
      await navigator.clipboard.writeText(fullMarkdown);
      setCopySuccess(true);
      const msg = 'Markdown copied to clipboard! Opening Hashnode web editor...';
      setPublishMessage(msg);
      toast.success(msg);
      setTimeout(() => setCopySuccess(false), 4000);
    } catch {
      const msg = 'Opening Hashnode web editor...';
      setPublishMessage(msg);
      toast.info(msg);
    }
    window.open('https://hn.new', '_blank');
  }

  async function handleCopyAndOpenMedium() {
    const fullMarkdown = `# ${title}\n\n${content}`;
    try {
      await navigator.clipboard.writeText(fullMarkdown);
      setCopySuccess(true);
      const msg = 'Markdown copied to clipboard! Opening Medium web editor...';
      setPublishMessage(msg);
      toast.success(msg);
      setTimeout(() => setCopySuccess(false), 4000);
    } catch {
      const msg = 'Opening Medium web editor...';
      setPublishMessage(msg);
      toast.info(msg);
    }
    window.open('https://medium.com/new-story', '_blank');
  }

  async function handleRecordExternalUrl(pubId: string, url: string) {
    if (!initialArticle?.id) return;
    if (!url || !url.startsWith('http')) {
      const msg = 'Please enter a valid URL (starting with http:// or https://)';
      setError(msg);
      toast.error(msg);
      return;
    }
    setRecordingExternal(pubId);
    setError(null);
    try {
      const res = await fetch(
        `/api/articles/${initialArticle.id}/publications/${pubId}/record-external`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ externalUrl: url.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to record external publication');
      }
      setPublications((prev) => prev.map((p) => (p.id === pubId ? data.publication : p)));
      setStatus('READY');
      const msg = 'Publication marked as published successfully!';
      setPublishMessage(msg);
      toast.success(msg);
      setManualUrlInput((prev) => ({ ...prev, [pubId]: '' }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to record URL';
      setError(msg);
      toast.error(msg);
    } finally {
      setRecordingExternal(null);
    }
  }

  React.useEffect(() => {
    function handleExtensionMessage(event: MessageEvent) {
      if (
        event.data?.source === 'artxflow-extension' &&
        (event.data.type === 'READY' || event.data.type === 'PONG')
      ) {
        setExtensionInstalled(true);
      }
    }

    window.addEventListener('message', handleExtensionMessage);
    window.postMessage({ source: 'artxflow-web', type: 'PING' }, '*');

    return () => {
      window.removeEventListener('message', handleExtensionMessage);
    };
  }, []);

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

      setLoadingDestinations(true);
      fetch('/api/destinations')
        .then((res) => (res.ok ? res.json() : { destinations: [] }))
        .then((data) => {
          if (data.destinations) {
            setDestinations(data.destinations);
            const activeIds = data.destinations
              .filter((d: DestinationDto) => d.status === 'ACTIVE')
              .map((d: DestinationDto) => d.id);
            setSelectedPublishDestinations(activeIds);
            setSelectedScheduleDestinations(activeIds);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingDestinations(false));
    }
  }, [mode, initialArticle?.id]);

  // Auto-provision free Medium destination when Chrome Companion extension is active
  React.useEffect(() => {
    if (
      extensionInstalled &&
      !mediumAutoProvisionedRef.current &&
      destinations.length > 0 &&
      !destinations.some((d) => isMediumDestinationType(d.type))
    ) {
      mediumAutoProvisionedRef.current = true;
      handleEnableMedium();
    }
  }, [extensionInstalled, destinations, handleEnableMedium]);

  function getHashnodePublishMode(destination?: DestinationDto): HashnodePublishMode {
    return resolveHashnodePublishMode(destination?.config);
  }

  function hashnodeModeBadge(
    mode: HashnodePublishMode,
    extReady: boolean,
  ): {
    label: string;
    color: string;
    background: string;
    border: string;
  } {
    if (mode === 'extension') {
      return extReady
        ? {
            label: '⚡ Extension (default)',
            color: 'var(--axf-cyan, #19D7FE)',
            background: 'rgba(25, 215, 254, 0.15)',
            border: 'rgba(25, 215, 254, 0.3)',
          }
        : {
            label: '⚡ Extension default — not loaded',
            color: '#F59E0B',
            background: 'rgba(245, 158, 11, 0.15)',
            border: 'rgba(245, 158, 11, 0.3)',
          };
    }
    if (mode === 'hn_new') {
      return {
        label: '📋 hn.new (default)',
        color: 'var(--axf-cyan, #19D7FE)',
        background: 'rgba(25, 215, 254, 0.12)',
        border: 'rgba(25, 215, 254, 0.3)',
      };
    }
    if (mode === 'manual') {
      return {
        label: '🔗 Record URL (default)',
        color: 'var(--axf-cyan, #19D7FE)',
        background: 'rgba(25, 215, 254, 0.12)',
        border: 'rgba(25, 215, 254, 0.3)',
      };
    }
    return {
      label: '🔑 API (Pro)',
      color: '#F59E0B',
      background: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.3)',
    };
  }

  function getMediumPublishMode(destination?: DestinationDto): MediumPublishMode {
    return resolveMediumPublishMode(destination?.config);
  }

  function mediumModeBadge(
    mode: MediumPublishMode,
    extReady: boolean,
  ): {
    label: string;
    color: string;
    background: string;
    border: string;
  } {
    if (mode === 'extension') {
      return extReady
        ? {
            label: '⚡ Extension (default)',
            color: 'var(--axf-cyan, #19D7FE)',
            background: 'rgba(25, 215, 254, 0.15)',
            border: 'rgba(25, 215, 254, 0.3)',
          }
        : {
            label: '⚡ Extension default — not loaded',
            color: '#F59E0B',
            background: 'rgba(245, 158, 11, 0.15)',
            border: 'rgba(245, 158, 11, 0.3)',
          };
    }
    if (mode === 'medium_new') {
      return {
        label: '📋 new-story (default)',
        color: 'var(--axf-cyan, #19D7FE)',
        background: 'rgba(25, 215, 254, 0.12)',
        border: 'rgba(25, 215, 254, 0.3)',
      };
    }
    if (mode === 'manual') {
      return {
        label: '🔗 Record URL (default)',
        color: 'var(--axf-cyan, #19D7FE)',
        background: 'rgba(25, 215, 254, 0.12)',
        border: 'rgba(25, 215, 254, 0.3)',
      };
    }
    return {
      label: '🔑 API (Legacy token)',
      color: '#AAB5C4',
      background: 'rgba(170, 181, 196, 0.12)',
      border: 'rgba(170, 181, 196, 0.3)',
    };
  }

  function isDestinationActionNeeded(publication: PublicationDto): boolean {
    if (
      publication.status === 'FAILED' ||
      publication.status === 'UNKNOWN_OUTCOME' ||
      publication.status === 'RETRYING'
    ) {
      return true;
    }
    const dest = destinations.find((d) => d.id === publication.destinationId);
    if (!dest) return false;
    if (
      isHashnodeDestinationType(dest.type) &&
      isClientManagedHashnodePublish(getHashnodePublishMode(dest)) &&
      publication.status === 'PENDING'
    ) {
      return true;
    }
    if (
      isMediumDestinationType(dest.type) &&
      isClientManagedMediumPublish(getMediumPublishMode(dest)) &&
      publication.status === 'PENDING'
    ) {
      return true;
    }
    return false;
  }

  function getDestinationIconId(type: string): 'devto' | 'medium' | 'hashnode' | 'artxflow' {
    const t = type.toLowerCase();
    if (t.includes('devto')) return 'devto';
    if (t.includes('hashnode')) return 'hashnode';
    if (t.includes('medium')) return 'medium';
    return 'artxflow';
  }

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
    const pub = publications.find((p) => p.id === publicationId);
    const dest = pub ? destinations.find((d) => d.id === pub.destinationId) : undefined;
    if (dest && isHashnodeDestinationType(dest.type)) {
      const mode = getHashnodePublishMode(dest);
      if (mode === 'extension') {
        return handlePublish([dest.id]);
      }
      if (mode === 'hn_new') {
        await handleCopyAndOpenHashnode();
        return;
      }
      if (mode === 'manual') {
        setPublishMessage('Paste the live Hashnode URL below to record this publication.');
        return;
      }
    }
    if (dest && isMediumDestinationType(dest.type)) {
      const mode = getMediumPublishMode(dest);
      if (mode === 'extension') {
        return handlePublish([dest.id]);
      }
      if (mode === 'medium_new') {
        await handleCopyAndOpenMedium();
        return;
      }
      if (mode === 'manual') {
        setPublishMessage('Paste the live Medium URL below to record this publication.');
        return;
      }
    }

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
                  const msg = 'Publication successfully retried and published!';
                  setPublishMessage(msg);
                  toast.success(msg);
                } else if (target.status === 'UNKNOWN_OUTCOME') {
                  const msg = 'Retry outcome unknown. Please verify destination status.';
                  setPublishMessage(msg);
                  toast.warning(msg);
                } else {
                  const msg = 'Publication retry failed.';
                  setPublishMessage(msg);
                  toast.error(msg);
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
      const msg = err instanceof Error ? err.message : 'Error retrying publication';
      setError(msg);
      toast.error(msg);
      setPublishing(false);
      setPublishMessage(null);
    }
  }

  function publishViaExtension(
    platform: 'hashnode' | 'medium',
    articlePayload: {
      title: string;
      markdown: string;
      canonicalUrl?: string;
    },
  ): Promise<{ success: boolean; publishedUrl?: string; error?: string; message?: string }> {
    return new Promise((resolve) => {
      const requestId = crypto.randomUUID();
      const platformName = platform === 'medium' ? 'Medium' : 'Hashnode';
      const type = platform === 'medium' ? 'PUBLISH_MEDIUM' : 'PUBLISH_HASHNODE';
      const timeout = setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        resolve({
          success: false,
          error: `Extension response timed out. Please ensure you are logged into ${platformName}.`,
        });
      }, 90000);

      function handleResponse(event: MessageEvent) {
        if (
          event.data?.source === 'artxflow-extension' &&
          event.data?.type === 'PUBLISH_RESPONSE' &&
          event.data?.requestId === requestId
        ) {
          clearTimeout(timeout);
          window.removeEventListener('message', handleResponse);
          resolve(event.data.result || { success: false, error: 'No response from extension' });
        }
      }

      window.addEventListener('message', handleResponse);
      window.postMessage(
        {
          source: 'artxflow-web',
          type,
          requestId,
          payload: articlePayload,
        },
        '*',
      );
    });
  }

  async function handlePublish(destinationIds?: string[]) {
    if (!initialArticle?.id) return;
    setError(null);
    setPublishing(true);
    setPublishMessage('Publishing queued...');
    setShowPublishModal(false);

    const targetIds =
      destinationIds && destinationIds.length > 0
        ? destinationIds
        : destinations.filter((d) => d.status === 'ACTIVE').map((d) => d.id);

    const hashnodeDest = destinations.find((d) => isHashnodeDestinationType(d.type));
    const isHashnodeTargeted = Boolean(hashnodeDest && targetIds.includes(hashnodeDest.id));
    const hashnodeMode = getHashnodePublishMode(hashnodeDest);
    const hashnodeClientManaged =
      isHashnodeTargeted && isClientManagedHashnodePublish(hashnodeMode);

    const mediumDest = destinations.find((d) => isMediumDestinationType(d.type));
    const isMediumTargeted = Boolean(mediumDest && targetIds.includes(mediumDest.id));
    const mediumMode = getMediumPublishMode(mediumDest);
    const mediumClientManaged =
      isMediumTargeted && isClientManagedMediumPublish(mediumMode);

    try {
      const res = await fetch(`/api/articles/${initialArticle.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationIds: destinationIds && destinationIds.length > 0 ? destinationIds : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to trigger publication');
      }

      if (data.publications) {
        setPublications(data.publications);
      }

      const clientManagedDests: Array<{
        platform: 'hashnode' | 'medium';
        dest: DestinationDto;
        mode: string;
      }> = [];

      if (hashnodeClientManaged && hashnodeDest) {
        clientManagedDests.push({ platform: 'hashnode', dest: hashnodeDest, mode: hashnodeMode });
      }
      if (mediumClientManaged && mediumDest) {
        clientManagedDests.push({ platform: 'medium', dest: mediumDest, mode: mediumMode });
      }

      // Execute client-managed publishing independently for each targeted destination
      for (const item of clientManagedDests) {
        const pub = (data.publications as PublicationDto[] | undefined)?.find(
          (p) => p.destinationId === item.dest.id,
        );
        const platformLabel = item.platform === 'hashnode' ? 'Hashnode' : 'Medium';

        try {
          if (item.mode === 'extension') {
            if (!extensionInstalled) {
              setPublishMessage(
                `${platformLabel} is waiting on the ArtXFlow Chrome extension. Load it from apps/extension, or use the 1-click fallback below.`,
              );
            } else {
              setPublishMessage(`Publishing to ${platformLabel} via Chrome Companion Extension...`);
              const canonicalUrl = initialArticle.slug
                ? `${window.location.origin}/articles/${initialArticle.id}`
                : undefined;
              const targetMarkdown =
                item.platform === 'medium'
                  ? formatMediumMarkdown(stripFrontmatter(content))
                  : stripFrontmatter(content);
              const extResult = await publishViaExtension(item.platform, {
                title,
                markdown: targetMarkdown,
                canonicalUrl,
              });
              if (!extResult.success) {
                throw new Error(
                  extResult.message || extResult.error || `Failed to publish to ${platformLabel} via extension`,
                );
              }
              if (pub?.id && extResult.publishedUrl) {
                await handleRecordExternalUrl(pub.id, extResult.publishedUrl);
              }
              setStatus('READY');
              const msg = `Article successfully published to ${platformLabel}!`;
              setPublishMessage(msg);
              toast.success(msg);
            }
          } else if (item.mode === 'hn_new') {
            await handleCopyAndOpenHashnode();
            setPublishMessage(
              'Markdown copied and hn.new opened. After Hashnode publishes, paste the live URL below to sync status.',
            );
          } else if (item.mode === 'medium_new') {
            await handleCopyAndOpenMedium();
            setPublishMessage(
              'Markdown copied and medium.com/new-story opened. After Medium publishes, paste the live URL below to sync status.',
            );
          } else {
            setPublishMessage(
              `Publish this article on ${platformLabel}, then paste the live URL below to mark it published.`,
            );
          }
        } catch (clientErr) {
          let clientErrMsg =
            clientErr instanceof Error
              ? clientErr.message
              : `Failed to publish to ${platformLabel}`;
          if (clientErrMsg.includes('sendMessage') || clientErrMsg.includes('context invalidated') || clientErrMsg.includes('Extension was reloaded')) {
            clientErrMsg = 'Extension was reloaded in Chrome. Please refresh this tab (Cmd+R / F5) to reconnect.';
          }
          setError(clientErrMsg);
          toast.error(clientErrMsg);
        }
      }

      const clientManagedIds = clientManagedDests.map((c) => c.dest.id);
      const otherTargetIds = targetIds.filter((id) => !clientManagedIds.includes(id));
      if (otherTargetIds.length === 0) {
        setPublishing(false);
        return;
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
              const targets =
                destinationIds && destinationIds.length > 0
                  ? pollData.publications.filter((p: PublicationDto) =>
                      destinationIds.includes(p.destinationId),
                    )
                  : pollData.publications;

              const isTerminal = (p: PublicationDto) => {
                if (
                  p.status === 'PUBLISHED' ||
                  p.status === 'FAILED' ||
                  p.status === 'UNKNOWN_OUTCOME'
                ) {
                  return true;
                }
                const dest = destinations.find((d) => d.id === p.destinationId);
                return Boolean(
                  dest &&
                  ((isHashnodeDestinationType(dest.type) &&
                    isClientManagedHashnodePublish(getHashnodePublishMode(dest))) ||
                   (isMediumDestinationType(dest.type) &&
                    isClientManagedMediumPublish(getMediumPublishMode(dest)))) &&
                  p.status === 'PENDING',
                );
              };

              const allTargetsFinished =
                targets.length > 0 && targets.every((p: PublicationDto) => isTerminal(p));

              if (allTargetsFinished || attempts >= 10) {
                clearInterval(interval);
                setPublishing(false);
                const allPublished = targets.every((p: PublicationDto) => p.status === 'PUBLISHED');
                const anyPublished = targets.some((p: PublicationDto) => p.status === 'PUBLISHED');
                const anyFailed = targets.some((p: PublicationDto) => p.status === 'FAILED');

                if (allPublished) {
                  setStatus('READY');
                  const msg = 'Article successfully published!';
                  setPublishMessage(msg);
                  toast.success(msg);
                } else if (anyPublished && anyFailed) {
                  setStatus('READY');
                  const msg = 'Published with some destination failures.';
                  setPublishMessage(msg);
                  toast.warning(msg);
                } else if (anyFailed) {
                  const msg = 'Publication failed.';
                  setPublishMessage(msg);
                  toast.error(msg);
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
      const msg = err instanceof Error ? err.message : 'Error publishing article';
      setError(msg);
      toast.error(msg);
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
          destinationIds:
            selectedScheduleDestinations.length > 0 ? selectedScheduleDestinations : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule publication');
      }

      setSchedules((prev) => [data, ...prev.filter((s) => s.id !== data.id)]);
      setShowScheduleModal(false);
      const schedMsg = `Article scheduled for ${new Date(data.scheduledAt).toLocaleString()} (${data.timezone})`;
      setPublishMessage(schedMsg);
      toast.success(schedMsg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error scheduling publication';
      setError(msg);
      toast.error(msg);
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
      const msg = 'Scheduled publication was canceled.';
      setPublishMessage(msg);
      toast.info(msg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error canceling schedule';
      setError(msg);
      toast.error(msg);
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
      const msg = 'Article title is required.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setError(null);
    setSaving(true);

    const mergedMetadata = {
      ...(((initialArticle as unknown as Record<string, unknown>)?.metadata as Record<string, unknown> | undefined) || {}),
      ...((initialVersion?.metadata as Record<string, unknown> | undefined) || {}),
      tags,
      coverUrl,
    };

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
            coverAssetId: coverAssetId || undefined,
            metadata: mergedMetadata,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create article');
        }

        setSaveStatus('saved');
        toast.success('Article created successfully!');
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
            coverAssetId: coverAssetId || null,
            metadata: mergedMetadata,
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
        toast.success(
          data.version?.versionNumber
            ? `Saved version v${data.version.versionNumber}`
            : 'Article saved successfully!',
        );
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving article';
      setError(msg);
      toast.error(msg);
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
                onClick={() => {
                  setError(null);
                  setShowPublishModal(true);
                  if (destinations.length === 0) {
                    setLoadingDestinations(true);
                    fetch('/api/destinations')
                      .then((res) => (res.ok ? res.json() : { destinations: [] }))
                      .then((data) => {
                        if (data.destinations) {
                          setDestinations(data.destinations);
                          const activeIds = data.destinations
                            .filter((d: DestinationDto) => d.status === 'ACTIVE')
                            .map((d: DestinationDto) => d.id);
                          setSelectedPublishDestinations(activeIds);
                        }
                      })
                      .finally(() => setLoadingDestinations(false));
                  }
                }}
              >
                Publish...
              </Button>
            </>
          )}

          <Button variant="primary" size="sm" loading={saving} onClick={handleSave}>
            {mode === 'create' ? 'Create Article' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Publish Selection Modal */}
      {showPublishModal && (
        <Card
          style={{
            padding: '24px',
            backgroundColor: 'var(--surface-elevated, #131E2F)',
            border: '1px solid var(--border, #1C2A3A)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--text-primary, #F5F7FA)',
                    margin: 0,
                  }}
                >
                  Publish Article
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary, #AAB5C4)',
                    marginTop: '4px',
                    margin: 0,
                  }}
                >
                  Choose which connected developer platforms to distribute this article to.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary, #AAB5C4)',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1,
                }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {loadingDestinations ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: 'var(--text-secondary, #AAB5C4)',
                  fontSize: '14px',
                }}
              >
                Loading available publishing platforms...
              </div>
            ) : destinations.length === 0 ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '14px', color: '#F87171', fontWeight: 500 }}>
                  No publishing platforms connected
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #AAB5C4)', margin: 0 }}>
                  You don&apos;t have any publishing destinations configured yet. Connect DEV.to,
                  Hashnode, or Medium in your account settings first.
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <Button size="sm" variant="outline" onClick={() => router.push('/settings')}>
                    Go to Settings →
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    loading={enablingMedium}
                    disabled={enablingMedium}
                    onClick={handleEnableMedium}
                  >
                    ⚡ Enable Medium (Free)
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--text-secondary, #AAB5C4)',
                    paddingBottom: '6px',
                    borderBottom: '1px solid var(--border, #1C2A3A)',
                  }}
                >
                  <span>
                    {selectedPublishDestinations.length} of {destinations.length} platform
                    {destinations.length > 1 ? 's' : ''} selected
                  </span>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedPublishDestinations(destinations.map((d) => d.id))}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--axf-cyan, #19D7FE)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Select All
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setSelectedPublishDestinations([])}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary, #AAB5C4)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {destinations.map((destination) => {
                    const isSelected = selectedPublishDestinations.includes(destination.id);
                    const pub = publications.find((p) => p.destinationId === destination.id);
                    const isPublished = pub?.status === 'PUBLISHED';
                    const isFailed = pub?.status === 'FAILED' || pub?.status === 'UNKNOWN_OUTCOME';
                    const isPublishingThis =
                      pub?.status === 'PUBLISHING' || pub?.status === 'QUEUED';
                    const iconId = getDestinationIconId(destination.type);
                    const isHashnode = isHashnodeDestinationType(destination.type);
                    const hashnodeMode = isHashnode ? getHashnodePublishMode(destination) : 'api';
                    const isMedium = isMediumDestinationType(destination.type);
                    const mediumMode = isMedium ? getMediumPublishMode(destination) : 'api';
                    const modeBadge = isHashnode
                      ? hashnodeModeBadge(hashnodeMode, extensionInstalled)
                      : isMedium
                        ? mediumModeBadge(mediumMode, extensionInstalled)
                        : null;
                    const isPendingClientDestination =
                      (isHashnode &&
                        pub?.status === 'PENDING' &&
                        isClientManagedHashnodePublish(hashnodeMode)) ||
                      (isMedium &&
                        pub?.status === 'PENDING' &&
                        isClientManagedMediumPublish(mediumMode));

                    let statusSubtitle = 'Ready to publish';
                    if (isPublished) {
                      if (isHashnode) {
                        statusSubtitle =
                          hashnodeMode === 'extension'
                            ? 'Live on Hashnode • Default: Chrome Extension'
                            : hashnodeMode === 'hn_new'
                              ? 'Live on Hashnode • Default: hn.new'
                              : hashnodeMode === 'manual'
                                ? 'Live on Hashnode • Default: record live URL'
                                : 'Live on Hashnode • Default: GraphQL API (Pro)';
                      } else if (isMedium) {
                        statusSubtitle =
                          mediumMode === 'extension'
                            ? 'Live on Medium • Default: Chrome Extension'
                            : mediumMode === 'medium_new'
                              ? 'Live on Medium • Default: medium.com/new-story'
                              : mediumMode === 'manual'
                                ? 'Live on Medium • Default: record live URL'
                                : 'Live on Medium • Default: REST API v1';
                      } else {
                        statusSubtitle = 'Live on platform • Will update with latest version';
                      }
                    } else if (isFailed) {
                      statusSubtitle = pub?.lastErrorMessage
                        ? pub.lastErrorMessage.replace(
                            /^Hashnode GraphQL authorization error:\s*/i,
                            '',
                          )
                        : 'Previous attempt failed • Ready to retry';
                    } else if (isPendingClientDestination) {
                      if (isHashnode) {
                        statusSubtitle =
                          hashnodeMode === 'hn_new'
                            ? 'Waiting • Finish on hn.new, then paste the live URL'
                            : hashnodeMode === 'manual'
                              ? 'Waiting • Paste the live Hashnode URL to record it'
                              : 'Waiting • Load the extension or use a free fallback';
                      } else if (isMedium) {
                        statusSubtitle =
                          mediumMode === 'medium_new'
                            ? 'Waiting • Finish on medium.com/new-story, then paste the live URL'
                            : mediumMode === 'manual'
                              ? 'Waiting • Paste the live Medium URL to record it'
                              : 'Waiting • Load the extension or use a free fallback';
                      }
                    } else if (isPublishingThis) {
                      statusSubtitle = 'Publishing in progress...';
                    } else if (isHashnode) {
                      statusSubtitle =
                        hashnodeMode === 'extension'
                          ? extensionInstalled
                            ? 'Ready • Will publish via Chrome Extension (free)'
                            : 'Ready • Default is Extension — load it, or use hn.new / live URL'
                          : hashnodeMode === 'hn_new'
                            ? 'Ready • Will copy markdown and open hn.new'
                            : hashnodeMode === 'manual'
                              ? 'Ready • You publish on Hashnode, then record the live URL'
                              : 'Ready • GraphQL API (Hashnode Pro $19/mo). Free fallbacks remain available if it fails.';
                    } else if (isMedium) {
                      statusSubtitle =
                        mediumMode === 'extension'
                          ? extensionInstalled
                            ? 'Ready • Will publish via Chrome Extension (free)'
                            : 'Ready • Default is Extension — load it, or use new-story / live URL'
                          : mediumMode === 'medium_new'
                            ? 'Ready • Will copy markdown and open medium.com/new-story'
                            : mediumMode === 'manual'
                              ? 'Ready • You publish on Medium, then record the live URL'
                              : 'Ready • Medium REST API v1. Free fallbacks remain available if it fails.';
                    }

                    return (
                      <div
                        key={destination.id}
                        onClick={() => {
                          setSelectedPublishDestinations((prev) =>
                            prev.includes(destination.id)
                              ? prev.filter((id) => id !== destination.id)
                              : [...prev, destination.id],
                          );
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius-md, 8px)',
                          backgroundColor: isSelected
                            ? 'rgba(11, 135, 254, 0.08)'
                            : 'var(--surface-default, #0B111A)',
                          border: `1px solid ${
                            isSelected ? 'rgba(11, 135, 254, 0.4)' : 'var(--border, #1C2A3A)'
                          }`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedPublishDestinations((prev) =>
                                e.target.checked
                                  ? [...prev, destination.id]
                                  : prev.filter((id) => id !== destination.id),
                              );
                            }}
                            style={{
                              width: '18px',
                              height: '18px',
                              accentColor: 'var(--axf-blue, #0B87FE)',
                              cursor: 'pointer',
                            }}
                          />

                          <PlatformIcon id={iconId} size={32} />

                          <div>
                            <div
                              style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'var(--text-primary, #F5F7FA)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                              }}
                            >
                              <span>{destination.name}</span>
                              {modeBadge && (
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    padding: '2px 7px',
                                    borderRadius: '4px',
                                    backgroundColor: modeBadge.background,
                                    color: modeBadge.color,
                                    border: `1px solid ${modeBadge.border}`,
                                  }}
                                >
                                  {modeBadge.label}
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: '12px',
                                color: isFailed
                                  ? 'var(--danger, #EF4444)'
                                  : 'var(--text-secondary, #AAB5C4)',
                              }}
                            >
                              {statusSubtitle}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isPublished ? (
                            <Badge variant="success">Published</Badge>
                          ) : isFailed ? (
                            <Badge variant="warning">Failed</Badge>
                          ) : isPendingClientDestination ? (
                            <Badge variant="warning">Needs action</Badge>
                          ) : isPublishingThis ? (
                            <Badge variant="default">Publishing</Badge>
                          ) : (
                            <Badge variant="default">Ready</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {!destinations.some((d) => isMediumDestinationType(d.type)) && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-md, 8px)',
                        backgroundColor: 'rgba(0, 171, 108, 0.05)',
                        border: '1px dashed rgba(0, 171, 108, 0.35)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: '#00AB6C',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '11px',
                            color: 'white',
                            flexShrink: 0,
                          }}
                        >
                          MED
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                fontWeight: 600,
                                color: 'var(--text-primary, #F5F7FA)',
                                fontSize: '13px',
                              }}
                            >
                              Medium
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                padding: '2px 7px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(0, 171, 108, 0.15)',
                                color: '#34D399',
                                border: '1px solid rgba(0, 171, 108, 0.3)',
                              }}
                            >
                              {extensionInstalled ? '⚡ Extension Ready' : 'Free / Tokenless'}
                            </span>
                          </div>
                          <div
                            style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}
                          >
                            {extensionInstalled
                              ? 'Companion extension is active. Click to add Medium to this publish run.'
                              : 'Publish via companion extension or web editor. No API token required.'}
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        loading={enablingMedium}
                        disabled={enablingMedium}
                        onClick={handleEnableMedium}
                      >
                        + Add Medium
                      </Button>
                    </div>
                  )}
                </div>

                {(() => {
                  const hashnodeDest = destinations.find((d) => isHashnodeDestinationType(d.type));
                  if (!hashnodeDest || !selectedPublishDestinations.includes(hashnodeDest.id)) {
                    return null;
                  }
                  const mode = getHashnodePublishMode(hashnodeDest);
                  const option = HASHNODE_PUBLISH_MODE_OPTIONS.find((o) => o.id === mode);
                  const warnExtensionMissing = mode === 'extension' && !extensionInstalled;
                  return (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md, 8px)',
                        backgroundColor: warnExtensionMissing
                          ? 'rgba(245, 158, 11, 0.08)'
                          : mode === 'api'
                            ? 'rgba(245, 158, 11, 0.08)'
                            : 'rgba(25, 215, 254, 0.08)',
                        border: `1px solid ${
                          warnExtensionMissing || mode === 'api'
                            ? 'rgba(245, 158, 11, 0.25)'
                            : 'rgba(25, 215, 254, 0.25)'
                        }`,
                        fontSize: '12px',
                        color: 'var(--text-primary, #F5F7FA)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '16px', lineHeight: 1 }}>
                          {option?.icon || '💡'}
                        </span>
                        <div>
                          <strong>Default Hashnode method: {option?.title}.</strong>{' '}
                          {mode === 'extension' && extensionInstalled
                            ? 'The companion extension is loaded. Publish will run silently in the background.'
                            : mode === 'extension'
                              ? 'The extension is not loaded. Load it from apps/extension, or use a fallback below.'
                              : mode === 'hn_new'
                                ? 'Publish will copy markdown and open hn.new. Paste the live URL afterward to sync status.'
                                : mode === 'manual'
                                  ? 'ArtXFlow will not post to Hashnode. After you publish there, paste the live URL to record it.'
                                  : 'Uses Hashnode GraphQL write APIs, which require Hashnode Pro ($19/mo). Free fallbacks stay available if the API rejects the request.'}{' '}
                          Change this in Settings.
                        </div>
                      </div>
                      {mode !== 'api' && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            marginTop: '2px',
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={handleCopyAndOpenHashnode}
                          >
                            {copySuccess
                              ? '✓ Copied! Opening hn.new...'
                              : '📋 1-Click Copy & Open hn.new'}
                          </Button>
                          <span
                            style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)' }}
                          >
                            Instant fallback. After publishing, record the live URL on the article.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {(() => {
                  const mediumDest = destinations.find((d) => isMediumDestinationType(d.type));
                  if (!mediumDest || !selectedPublishDestinations.includes(mediumDest.id)) {
                    return null;
                  }
                  const mode = getMediumPublishMode(mediumDest);
                  const option = MEDIUM_PUBLISH_MODE_OPTIONS.find((o) => o.id === mode);
                  const warnExtensionMissing = mode === 'extension' && !extensionInstalled;
                  return (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md, 8px)',
                        backgroundColor: warnExtensionMissing
                          ? 'rgba(245, 158, 11, 0.08)'
                          : mode === 'api'
                            ? 'rgba(245, 158, 11, 0.08)'
                            : 'rgba(25, 215, 254, 0.08)',
                        border: `1px solid ${
                          warnExtensionMissing || mode === 'api'
                            ? 'rgba(245, 158, 11, 0.25)'
                            : 'rgba(25, 215, 254, 0.25)'
                        }`,
                        fontSize: '12px',
                        color: 'var(--text-primary, #F5F7FA)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ fontSize: '16px', lineHeight: 1 }}>
                          {option?.icon || '💡'}
                        </span>
                        <div>
                          <strong>Default Medium method: {option?.title}.</strong>{' '}
                          {mode === 'extension' && extensionInstalled
                            ? 'The companion extension is loaded. Publish will run silently in the background.'
                            : mode === 'extension'
                              ? 'The extension is not loaded. Load it from apps/extension, or use a fallback below.'
                              : mode === 'medium_new'
                                ? 'Publish will copy markdown and open medium.com/new-story. Paste the live URL afterward to sync status.'
                                : mode === 'manual'
                                  ? 'ArtXFlow will not post to Medium. After you publish there, paste the live URL to record it.'
                                  : 'Uses Medium REST API v1 with your Integration Token (discontinued in 2025). Free fallbacks stay available if the API rejects the request.'}{' '}
                          Change this in Settings.
                        </div>
                      </div>
                      {mode !== 'api' && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            marginTop: '2px',
                          }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={handleCopyAndOpenMedium}
                          >
                            {copySuccess
                              ? '✓ Copied! Opening Medium...'
                              : '📋 1-Click Copy & Open medium.com/new-story'}
                          </Button>
                          <span
                            style={{ fontSize: '11px', color: 'var(--text-secondary, #AAB5C4)' }}
                          >
                            Instant fallback. After publishing, record the live URL on the article.
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    marginTop: '8px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border, #1C2A3A)',
                  }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPublishModal(false)}
                    disabled={publishing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    loading={publishing}
                    disabled={selectedPublishDestinations.length === 0 || publishing}
                    onClick={() => handlePublish(selectedPublishDestinations)}
                  >
                    Publish to {selectedPublishDestinations.length} Platform
                    {selectedPublishDestinations.length === 1 ? '' : 's'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

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

            {/* Target destinations for schedule */}
            {destinations.length > 0 && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--text-secondary, #AAB5C4)',
                    marginBottom: '8px',
                  }}
                >
                  Target Platforms ({selectedScheduleDestinations.length} selected)
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {destinations.map((dest) => {
                    const isSelected = selectedScheduleDestinations.includes(dest.id);
                    return (
                      <label
                        key={dest.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--surface-default, #0B111A)',
                          border: `1px solid ${
                            isSelected ? 'rgba(11, 135, 254, 0.4)' : 'var(--border, #1C2A3A)'
                          }`,
                          fontSize: '13px',
                          color: 'var(--text-primary, #F5F7FA)',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            setSelectedScheduleDestinations((prev) =>
                              e.target.checked
                                ? [...prev, dest.id]
                                : prev.filter((id) => id !== dest.id),
                            );
                          }}
                          style={{ accentColor: 'var(--axf-blue, #0B87FE)' }}
                        />
                        <span>{dest.name}</span>
                      </label>
                    );
                  })}
                </div>
                {destinations.some(
                  (d) =>
                    selectedScheduleDestinations.includes(d.id) &&
                    isHashnodeDestinationType(d.type) &&
                    isClientManagedHashnodePublish(getHashnodePublishMode(d)),
                ) && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#FBBF24',
                      margin: '8px 0 0',
                      lineHeight: 1.45,
                    }}
                  >
                    ⚠ Hashnode is set to a free client-side method (extension / hn.new / live URL).
                    Scheduled runs cannot complete that destination in the background. Use Hashnode
                    GraphQL API (Pro) in Settings if you need true scheduled Hashnode publishing.
                  </p>
                )}
                {destinations.some(
                  (d) =>
                    selectedScheduleDestinations.includes(d.id) &&
                    isMediumDestinationType(d.type) &&
                    isClientManagedMediumPublish(getMediumPublishMode(d)),
                ) && (
                  <p
                    style={{
                      fontSize: '12px',
                      color: '#FBBF24',
                      margin: '8px 0 0',
                      lineHeight: 1.45,
                    }}
                  >
                    ⚠ Medium is set to a free client-side method (extension / medium.com/new-story / live URL).
                    Scheduled runs cannot complete that destination in the background. Use Medium
                    Integration Token in Settings if you have an active token and need scheduled publishing.
                  </p>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="ghost" size="sm" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={scheduling}
                disabled={!scheduleDate || scheduling || selectedScheduleDestinations.length === 0}
                onClick={handleSchedule}
              >
                Confirm Schedule ({selectedScheduleDestinations.length} Platform
                {selectedScheduleDestinations.length === 1 ? '' : 's'})
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
      {publications.some((p) => isDestinationActionNeeded(p)) && (
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
                {publications.some((p) => p.status === 'FAILED' || p.status === 'UNKNOWN_OUTCOME')
                  ? 'Destination Publication Issues'
                  : 'Complete Publication'}
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary, #AAB5C4)' }}>
                {publications.filter((p) => isDestinationActionNeeded(p)).length} requiring attention
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {publications
                .filter((p) => isDestinationActionNeeded(p))
                .map((pub) => {
                  const targetDest = destinations.find((d) => d.id === pub.destinationId);
                  const isHashnode = isHashnodeDestinationType(targetDest?.type);
                  const hashnodeMode = getHashnodePublishMode(targetDest);
                  const isMedium = isMediumDestinationType(targetDest?.type);
                  const mediumMode = getMediumPublishMode(targetDest);

                  return (
                    <div
                      key={pub.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm, 6px)',
                        backgroundColor:
                          pub.status === 'FAILED'
                            ? 'rgba(239, 68, 68, 0.08)'
                            : 'rgba(245, 158, 11, 0.08)',
                        border: `1px solid ${
                          pub.status === 'FAILED'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(245, 158, 11, 0.25)'
                        }`,
                        fontSize: '13px',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Badge variant={pub.status === 'FAILED' ? 'default' : 'warning'}>
                            {pub.status}
                          </Badge>
                          <span
                            style={{
                              fontWeight: 500,
                              color: 'var(--text-primary, #F5F7FA)',
                            }}
                          >
                            {targetDest?.name || `Destination: ${pub.destinationId.slice(0, 8)}...`}
                          </span>
                        </div>
                        {pub.lastErrorMessage && (
                          <span style={{ fontSize: '12px', color: '#FCA5A5' }}>
                            {pub.lastErrorCode ? `[${pub.lastErrorCode}] ` : ''}
                            {pub.lastErrorMessage}
                          </span>
                        )}
                        {isHashnode && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-secondary, #AAB5C4)',
                              marginTop: '2px',
                            }}
                          >
                            Default method:{' '}
                            {
                              HASHNODE_PUBLISH_MODE_OPTIONS.find((o) => o.id === hashnodeMode)
                                ?.title
                            }
                            . Other free options remain available below.
                          </span>
                        )}

                        {isHashnode && (
                          <div
                            style={{
                              marginTop: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                              }}
                            >
                              <Button
                                size="sm"
                                variant={hashnodeMode === 'hn_new' ? 'primary' : 'outline'}
                                type="button"
                                onClick={handleCopyAndOpenHashnode}
                              >
                                {copySuccess ? '✓ Copied!' : '📋 Copy Markdown & Open hn.new'}
                              </Button>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                                marginTop: '2px',
                              }}
                            >
                              <input
                                type="url"
                                placeholder="Paste live Hashnode URL (e.g. https://yourblog.hashnode.dev/...)"
                                value={manualUrlInput[pub.id] || ''}
                                onChange={(e) =>
                                  setManualUrlInput((prev) => ({
                                    ...prev,
                                    [pub.id]: e.target.value,
                                  }))
                                }
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  borderRadius: 'var(--radius-sm, 6px)',
                                  backgroundColor: 'rgba(0,0,0,0.3)',
                                  border: '1px solid var(--border, #1C2A3A)',
                                  color: 'var(--text-primary, #F5F7FA)',
                                  outline: 'none',
                                  width: '320px',
                                }}
                              />
                              <Button
                                size="sm"
                                variant={hashnodeMode === 'manual' ? 'primary' : 'secondary'}
                                disabled={recordingExternal === pub.id || !manualUrlInput[pub.id]}
                                onClick={() =>
                                  handleRecordExternalUrl(pub.id, manualUrlInput[pub.id] || '')
                                }
                              >
                                {recordingExternal === pub.id ? 'Recording...' : 'Record Live URL'}
                              </Button>
                            </div>
                          </div>
                        )}

                        {isMedium && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: 'var(--text-secondary, #AAB5C4)',
                              marginTop: '2px',
                            }}
                          >
                            Default method:{' '}
                            {
                              MEDIUM_PUBLISH_MODE_OPTIONS.find((o) => o.id === mediumMode)
                                ?.title
                            }
                            . Other free options remain available below.
                          </span>
                        )}

                        {isMedium && (
                          <div
                            style={{
                              marginTop: '8px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                              }}
                            >
                              <Button
                                size="sm"
                                variant={mediumMode === 'medium_new' ? 'primary' : 'outline'}
                                type="button"
                                onClick={handleCopyAndOpenMedium}
                              >
                                {copySuccess ? '✓ Copied!' : '📋 Copy Markdown & Open medium.com/new-story'}
                              </Button>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'center',
                                marginTop: '2px',
                              }}
                            >
                              <input
                                type="url"
                                placeholder="Paste live Medium URL (e.g. https://medium.com/@user/story-slug-id)"
                                value={manualUrlInput[pub.id] || ''}
                                onChange={(e) =>
                                  setManualUrlInput((prev) => ({
                                    ...prev,
                                    [pub.id]: e.target.value,
                                  }))
                                }
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  borderRadius: 'var(--radius-sm, 6px)',
                                  backgroundColor: 'rgba(0,0,0,0.3)',
                                  border: '1px solid var(--border, #1C2A3A)',
                                  color: 'var(--text-primary, #F5F7FA)',
                                  outline: 'none',
                                  width: '320px',
                                }}
                              />
                              <Button
                                size="sm"
                                variant={mediumMode === 'manual' ? 'primary' : 'secondary'}
                                disabled={recordingExternal === pub.id || !manualUrlInput[pub.id]}
                                onClick={() =>
                                  handleRecordExternalUrl(pub.id, manualUrlInput[pub.id] || '')
                                }
                              >
                                {recordingExternal === pub.id ? 'Recording...' : 'Record Live URL'}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {(pub.status === 'FAILED' ||
                        pub.status === 'UNKNOWN_OUTCOME' ||
                        (isHashnode && hashnodeMode === 'extension') ||
                        (isMedium && mediumMode === 'extension')) &&
                        !(isHashnode && hashnodeMode === 'manual') &&
                        !(isMedium && mediumMode === 'manual') && (
                          <Button
                            size="sm"
                            variant={
                              (isHashnode && hashnodeMode === 'extension' && extensionInstalled) ||
                              (isMedium && mediumMode === 'extension' && extensionInstalled)
                                ? 'primary'
                                : 'secondary'
                            }
                            disabled={isPublishing}
                            onClick={() => handleRetry(pub.id)}
                          >
                            {(isHashnode && hashnodeMode === 'extension') ||
                            (isMedium && mediumMode === 'extension')
                              ? '⚡ Retry via Extension (Free)'
                              : isHashnode && hashnodeMode === 'hn_new'
                                ? '📋 Open hn.new'
                                : isMedium && mediumMode === 'medium_new'
                                  ? '📋 Open new-story'
                                  : 'Retry Destination'}
                          </Button>
                        )}
                    </div>
                  );
                })}
            </div>
          </div>
        </Card>
      )}

      {/* Dev.to-inspired Header Suite: Cover Image, Title, Tags & Advanced Options */}
      <Card
        style={{
          padding: '24px',
          backgroundColor: 'var(--surface-elevated, #131E2F)',
          border: '1px solid var(--border, #1C2A3A)',
          borderRadius: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Cover Uploader */}
          <EditorCoverUploader
            coverUrl={coverUrl}
            onCoverChange={(url) => {
              setCoverUrl(url);
              if (url === null) {
                coverAssetIdRef.current = null;
                setCoverAssetId(null);
              }
              setSaveStatus('unsaved');
            }}
            onUploadFile={handleUploadCoverFile}
            onOpenUnsplashModal={() => {
              setUnsplashTarget('cover');
              setShowUnsplashModal(true);
            }}
          />

          {/* Large DEV.to-style Title */}
          <div>
            <input
              id="article-title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="New post title here..."
              style={{
                width: '100%',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--border, #1C2A3A)',
                padding: '4px 0 14px 0',
                fontSize: '28px',
                fontWeight: 800,
                color: 'var(--text-primary, #F5F7FA)',
                outline: 'none',
                letterSpacing: '-0.02em',
              }}
            />
          </div>

          {/* Tags Input */}
          <div>
            <EditorTagInput
              tags={tags}
              onChange={(newTags) => {
                setTags(newTags);
                setSaveStatus('unsaved');
              }}
              maxTags={4}
            />
          </div>

          {/* Collapsible Advanced Options (Slug & Excerpt) */}
          <div style={{ borderTop: '1px solid var(--border, #1C2A3A)', paddingTop: '10px' }}>
            <button
              type="button"
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary, #AAB5C4)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              <span>{showAdvancedSettings ? '▼' : '▶'}</span>
              <span>Advanced Options (Slug, Meta Description)</span>
            </button>

            {showAdvancedSettings && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  marginTop: '12px',
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
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--text-secondary, #AAB5C4)',
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
                    placeholder="post-title-slug"
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
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--text-secondary, #AAB5C4)',
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
            )}
          </div>
        </div>
      </Card>

      {/* Hidden image file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUploadFile(file);
        }}
      />

      {/* Editor & Preview Area */}
      {viewMode === 'write' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isZenMode
              ? '1fr'
              : isSidebarCollapsed
                ? '1fr 48px'
                : '1fr 280px',
            gap: '20px',
            alignItems: 'start',
            transition: 'grid-template-columns 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Main Editor Card */}
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
              overflow: 'hidden',
              border: '1px solid var(--border, #1C2A3A)',
              backgroundColor: 'var(--surface-elevated, #131E2F)',
              borderRadius: '12px',
            }}
          >
            <EditorToolbar
              onApplyHeading={handleApplyHeading}
              onApplyInline={handleApplyInline}
              onApplyBlockquote={handleApplyBlockquote}
              onApplyList={handleApplyList}
              onApplyCodeBlock={handleApplyCodeBlock}
              onApplyDivider={handleApplyDivider}
              onApplyTable={handleApplyTable}
              onOpenLinkModal={handleOpenLinkModal}
              onUploadImageClick={() => fileInputRef.current?.click()}
              onOpenUnsplashModal={() => {
                setUnsplashTarget('body');
                setShowUnsplashModal(true);
              }}
              onInsertEmbed={handleInsertEmbed}
              isUploadingImage={isUploadingImage}
              isZenMode={isZenMode}
              onToggleZenMode={() => setIsZenMode(!isZenMode)}
            />

            <div style={{ position: 'relative', padding: '16px' }}>
              <EditorSlashMenu
                isOpen={showSlashMenu}
                filterText={slashFilter}
                onSelect={handleSlashSelect}
                onClose={() => setShowSlashMenu(false)}
              />

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  const newContent = e.target.value;
                  setContent(newContent);
                  setSaveStatus('unsaved');
                  if (showSlashMenu) {
                    const cursor = e.target.selectionStart;
                    const lineBefore = newContent.substring(0, cursor).split('\n').pop() || '';
                    const slashIdx = lineBefore.lastIndexOf('/');
                    if (slashIdx >= 0) {
                      setSlashFilter(lineBefore.substring(slashIdx + 1));
                    } else {
                      setShowSlashMenu(false);
                    }
                  }
                }}
                onKeyDown={handleTextareaKeyDown}
                onPaste={handleTextareaPaste}
                onDrop={handleTextareaDrop}
                onDragOver={(e) => e.preventDefault()}
                placeholder="Write your article in plain English here... (Use toolbar above, press '/' for commands, or Cmd+B/I/U/K)"
                aria-label="Article content editor"
                style={{
                  width: '100%',
                  minHeight: '520px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  resize: 'vertical',
                }}
              />
            </div>
          </Card>

          {/* Assistant Sidebar */}
          {!isZenMode && (
            <EditorSidebar
              stats={readingStats}
              readiness={publisherReadiness}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          )}
        </div>
      )}

      {viewMode === 'split' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* Left: Editor */}
          <Card
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '0',
              overflow: 'hidden',
              border: '1px solid var(--border, #1C2A3A)',
              backgroundColor: 'var(--surface-elevated, #131E2F)',
              borderRadius: '12px',
            }}
          >
            <EditorToolbar
              onApplyHeading={handleApplyHeading}
              onApplyInline={handleApplyInline}
              onApplyBlockquote={handleApplyBlockquote}
              onApplyList={handleApplyList}
              onApplyCodeBlock={handleApplyCodeBlock}
              onApplyDivider={handleApplyDivider}
              onApplyTable={handleApplyTable}
              onOpenLinkModal={handleOpenLinkModal}
              onUploadImageClick={() => fileInputRef.current?.click()}
              onOpenUnsplashModal={() => {
                setUnsplashTarget('body');
                setShowUnsplashModal(true);
              }}
              onInsertEmbed={handleInsertEmbed}
              isUploadingImage={isUploadingImage}
              isZenMode={false}
            />

            <div style={{ position: 'relative', padding: '16px' }}>
              <EditorSlashMenu
                isOpen={showSlashMenu}
                filterText={slashFilter}
                onSelect={handleSlashSelect}
                onClose={() => setShowSlashMenu(false)}
              />

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => {
                  const newContent = e.target.value;
                  setContent(newContent);
                  setSaveStatus('unsaved');
                  if (showSlashMenu) {
                    const cursor = e.target.selectionStart;
                    const lineBefore = newContent.substring(0, cursor).split('\n').pop() || '';
                    const slashIdx = lineBefore.lastIndexOf('/');
                    if (slashIdx >= 0) {
                      setSlashFilter(lineBefore.substring(slashIdx + 1));
                    } else {
                      setShowSlashMenu(false);
                    }
                  }
                }}
                onKeyDown={handleTextareaKeyDown}
                onPaste={handleTextareaPaste}
                onDrop={handleTextareaDrop}
                onDragOver={(e) => e.preventDefault()}
                placeholder="Write your article in plain English here..."
                aria-label="Article content editor"
                style={{
                  width: '100%',
                  minHeight: '520px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  resize: 'vertical',
                }}
              />
            </div>
          </Card>

          {/* Right: Live Preview */}
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
              coverImageUrl={coverUrl}
              tags={tags}
              canonicalUrl={slug ? `/blog/${slug}` : undefined}
              publishedAt={initialArticle?.createdAt}
              showModeSelector={true}
            />
          </div>
        </div>
      )}

      {viewMode === 'preview' && (
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
            coverImageUrl={coverUrl}
            tags={tags}
            canonicalUrl={slug ? `/blog/${slug}` : undefined}
            publishedAt={initialArticle?.createdAt}
            showModeSelector={true}
          />
        </div>
      )}

      {/* Link Insertion Modal */}
      {showLinkModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
          onClick={() => setShowLinkModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--surface-elevated, #131E2F)',
              border: '1px solid var(--border, #1C2A3A)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary, #F5F7FA)',
              }}
            >
              Insert Link
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary, #AAB5C4)',
                }}
              >
                Text to display
              </label>
              <input
                type="text"
                value={linkModalText}
                onChange={(e) => setLinkModalText(e.target.value)}
                placeholder="Link text"
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--surface-sunken, #0A121E)',
                  border: '1px solid var(--border, #1C2A3A)',
                  borderRadius: '6px',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary, #AAB5C4)',
                }}
              >
                Link URL
              </label>
              <input
                type="url"
                autoFocus
                value={linkModalUrl}
                onChange={(e) => setLinkModalUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && linkModalUrl.trim()) {
                    e.preventDefault();
                    handleConfirmLink();
                  }
                }}
                style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--surface-sunken, #0A121E)',
                  border: '1px solid var(--border, #1C2A3A)',
                  borderRadius: '6px',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowLinkModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!linkModalUrl.trim()}
                onClick={handleConfirmLink}
              >
                Insert Link
              </Button>
            </div>
          </div>
        </div>
      )}

      <UnsplashModal
        isOpen={showUnsplashModal}
        onClose={() => setShowUnsplashModal(false)}
        onSelectImage={handleSelectUnsplashImage}
      />
    </div>
  );
}

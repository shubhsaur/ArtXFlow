'use client';

import React, { useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { ProfileChangeEmail } from './profile-change-email';
import type { Point, Area } from 'react-easy-crop';
import type { ProfileFormData } from './profile-types';

interface ProfileAuthorCardProps {
  formData: ProfileFormData;
  onChange: <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => void;
  onAvatarUpload: (file: File) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
  isUploadingAvatar: boolean;
}

export function ProfileAuthorCard({
  formData,
  onChange,
  onAvatarUpload,
  onAvatarRemove,
  isUploadingAvatar,
}: ProfileAuthorCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cropModal, setCropModal] = useState<{
    open: boolean;
    imageUrl: string;
    file: File;
  } | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const initials = (formData.name || formData.email || '?')
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setCropModal({ open: true, imageUrl, file });
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropCancel = () => {
    if (cropModal?.imageUrl) {
      URL.revokeObjectURL(cropModal.imageUrl);
    }
    setCropModal(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleCropConfirm = async () => {
    if (!cropModal || !croppedAreaPixels) return;

    try {
      const croppedFile = await getCroppedFile(
        cropModal.imageUrl,
        croppedAreaPixels,
        cropModal.file.name,
      );
      URL.revokeObjectURL(cropModal.imageUrl);
      setCropModal(null);
      await onAvatarUpload(croppedFile);
    } catch {
      handleCropCancel();
    }
  };

  const bioCharCount = formData.bio ? formData.bio.length : 0;

  return (
    <div className="profile-card">
      {/* Card Header */}
      <div className="profile-card-header">
        <div>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-primary, #F5F7FA)',
              margin: 0,
            }}
          >
            Canonical Author Profile
          </h2>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-muted, #66768D)',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            This identity anchors your published markdown frontmatter and metadata payloads.
          </p>
        </div>
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '22px', color: 'var(--text-muted, #66768D)', flexShrink: 0 }}
        >
          badge
        </span>
      </div>

      {/* Avatar Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          padding: '24px 0',
          borderBottom: '1px solid var(--border-subtle, #172333)',
        }}
      >
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--surface-container, #1C2027), #262A32)',
              border: '2px solid var(--border-default, #243447)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--flow-cyan, #19D7FE)',
              fontSize: '22px',
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {formData.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.image}
                alt={formData.name || 'Author Avatar'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              backgroundColor: 'var(--flow-blue, #0B87FE)',
              color: '#ffffff',
              borderRadius: '9999px',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--surface-raised, #0D1420)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
              verified_user
            </span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileSelected}
            />
            <button
              type="button"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-container, #1C2027)',
                border: '1px solid var(--border-default, #243447)',
                color: 'var(--text-primary, #F5F7FA)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: isUploadingAvatar ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isUploadingAvatar ? (
                <span
                  aria-hidden="true"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    border: '2px solid var(--text-muted, #66768D)',
                    borderTopColor: 'var(--text-primary, #F5F7FA)',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  upload_file
                </span>
              )}
              <span>{isUploadingAvatar ? 'Uploading...' : 'Upload new picture'}</span>
            </button>

            {formData.image && (
              <button
                type="button"
                onClick={onAvatarRemove}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  border: '1px solid transparent',
                  color: 'var(--text-muted, #66768D)',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F87171')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted, #66768D)')}
              >
                Remove
              </button>
            )}
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', margin: 0 }}>
            Recommended 400x400px. JPG, PNG or WebP. Uploaded images are resized and compressed to 400x400 WebP before storage.
          </p>
        </div>
      </div>

      {/* Crop Modal */}
      {cropModal?.open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
          }}
          onClick={handleCropCancel}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: 'var(--surface-raised, #0D1420)',
              border: '1px solid var(--border-default, #243447)',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: 'var(--text-primary, #F5F7FA)',
                  margin: 0,
                }}
              >
                Position your avatar
              </h3>
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted, #66768D)',
                  margin: '4px 0 0 0',
                }}
              >
                Drag and zoom to frame your profile picture.
              </p>
            </div>

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '320px',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: 'var(--surface-base, #070B12)',
                border: '1px solid var(--border-default, #243447)',
              }}
            >
              <Cropper
                image={cropModal.imageUrl}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label
                htmlFor="avatar-crop-zoom"
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted, #66768D)',
                }}
              >
                Zoom
              </label>
              <input
                id="avatar-crop-zoom"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--primary, #0B62F5)',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCropCancel}
                disabled={isUploadingAvatar}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-default, #243447)',
                  color: 'var(--text-primary, #F5F7FA)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: isUploadingAvatar ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                disabled={isUploadingAvatar || !croppedAreaPixels}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary, #0B62F5)',
                  border: '1px solid var(--primary, #0B62F5)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isUploadingAvatar || !croppedAreaPixels ? 'not-allowed' : 'pointer',
                }}
              >
                {isUploadingAvatar ? 'Uploading...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Author Input Grid */}
      <div className="profile-grid-2col" style={{ paddingTop: '24px' }}>
        {/* Full Name */}
        <div className="profile-form-control">
          <label className="profile-label">Full Name</label>
          <input
            type="text"
            className="profile-input-field"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            placeholder="e.g. Alex Rivera"
          />
        </div>

        {/* Primary Account Email */}
        <div className="profile-form-control">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="profile-label">Account Email</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ProfileChangeEmail currentEmail={formData.email} />
              {formData.emailVerified ? (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(18, 183, 106, 0.1)',
                    border: '1px solid rgba(18, 183, 106, 0.3)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    color: 'var(--status-success, #12B76A)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                    check_circle
                  </span>
                  <span>Verified</span>
                </span>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '11px',
                    color: '#FBBF24',
                  }}
                >
                  <span>Unverified</span>
                </span>
              )}
            </div>
          </div>
          <input
            type="email"
            disabled
            className="profile-input-field"
            style={{ opacity: 0.75, cursor: 'not-allowed' }}
            value={formData.email}
            readOnly
          />
        </div>

        {/* Origin Blog URL (Canonical SEO Destination) */}
        <div className="profile-form-control profile-grid-full">
          <label className="profile-label">Origin Blog URL (Canonical SEO Target)</label>
          <div style={{ position: 'relative' }}>
            <input
              type="url"
              className="profile-input-field"
              style={{ fontFamily: "'JetBrains Mono', monospace", paddingLeft: '34px' }}
              value={formData.canonicalUrl}
              onChange={(e) => onChange('canonicalUrl', e.target.value)}
              placeholder="https://yourblog.dev"
            />
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: 'var(--text-muted, #66768D)',
              }}
            >
              link
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted, #66768D)', marginTop: '4px', marginBottom: 0 }}>
            When publishing across external platforms (DEV.to, Hashnode, Medium), this URL is automatically configured as your <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--flow-cyan, #19D7FE)' }}>rel=&quot;canonical&quot;</code> target so search engines credit your original site.
          </p>
        </div>

        {/* Author Bio */}
        <div className="profile-form-control profile-grid-full">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label className="profile-label">Author Bio (Markdown Supported)</label>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: bioCharCount > 240 ? 'var(--status-error, #D92D20)' : 'var(--text-muted, #66768D)',
                fontWeight: bioCharCount > 240 ? 700 : 400,
              }}
            >
              {bioCharCount}/240
            </span>
          </div>
          <textarea
            rows={3}
            maxLength={240}
            className="profile-textarea"
            value={formData.bio}
            onChange={(e) => onChange('bio', e.target.value)}
            placeholder="Technical author writing about software engineering, distributed systems, and web architecture..."
          />
        </div>
      </div>
    </div>
  );
}

async function getCroppedFile(
  imageUrl: string,
  croppedAreaPixels: Area,
  originalName: string,
): Promise<File> {
  const image = await createImage(imageUrl);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create canvas context');
  }

  canvas.width = croppedAreaPixels.width;
  canvas.height = croppedAreaPixels.height;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
  );

  const blob = await getCanvasBlob(canvas);
  const ext = originalName.split('.').pop() || 'png';
  const fileName = `avatar-cropped.${ext === 'webp' ? 'png' : ext}`;

  return new File([blob], fileName, { type: blob.type });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (err) => reject(err));
    img.src = url;
  });
}

function getCanvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to create blob from canvas'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

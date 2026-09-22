'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OnboardingHeader } from '@/components/onboarding/onboarding-header';
import { OnboardingStepper, type OnboardingStep } from '@/components/onboarding/onboarding-stepper';
import { StepWorkspaceProfile } from '@/components/onboarding/step-workspace-profile';
import { StepCanonicalSource, type CanonicalSourceType } from '@/components/onboarding/step-canonical-source';
import { StepConnectDestinations, type ConnectedDestinationsState } from '@/components/onboarding/step-connect-destinations';
import { StepVerifyDispatch } from '@/components/onboarding/step-verify-dispatch';
import { OnboardingFooter } from '@/components/onboarding/onboarding-footer';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Wizard Navigation
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);

  // Loading & Session State
  const [isInitializing, setIsInitializing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Step 1: Workspace Profile State
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceSlug, setWorkspaceSlug] = useState('');

  // Step 2: Canonical Source State
  const [canonicalSource, setCanonicalSource] = useState<CanonicalSourceType>('editor');
  const [canonicalUrl, setCanonicalUrl] = useState('');

  // Step 3: Connected Destinations State
  const [destinations, setDestinations] = useState<ConnectedDestinationsState>({
    devtoConnected: false,
    devtoDraftMode: true,
    devtoToken: '',
    hashnodeConnected: false,
    hashnodeToken: '',
    hashnodeHandle: '',
    mediumConnected: false,
  });

  // Step 4: Sample Article Toggle
  const [createSampleArticle, setCreateSampleArticle] = useState(true);

  // Initialize from search param step if provided
  useEffect(() => {
    const rawStep = searchParams.get('step');
    if (rawStep) {
      const parsed = parseInt(rawStep, 10);
      if (parsed >= 1 && parsed <= 4) {
        setCurrentStep(parsed as OnboardingStep);
      }
    }
  }, [searchParams]);

  // Fetch initial workspace data
  useEffect(() => {
    async function loadWorkspaceData() {
      try {
        const res = await fetch('/api/workspace');
        if (res.status === 401) {
          router.push('/login');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.organization) {
            setWorkspaceName(data.organization.name || '');
            setWorkspaceSlug(data.organization.slug || '');
          }
          if (data.user) {
            setUserName(data.user.name || null);
            setUserEmail(data.user.email || null);
          }
          if (Array.isArray(data.connections)) {
            const devConn = data.connections.find((c: { provider: string }) => c.provider === 'devto');
            const hnConn = data.connections.find((c: { provider: string }) => c.provider === 'hashnode');
            const medConn = data.connections.find((c: { provider: string }) => c.provider === 'medium');

            setDestinations((prev) => ({
              ...prev,
              devtoConnected: !!devConn,
              hashnodeConnected: !!hnConn,
              mediumConnected: !!medConn,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load workspace identity:', err);
      } finally {
        setIsInitializing(false);
      }
    }

    loadWorkspaceData();
  }, [router]);

  // Save Step 1 changes to backend
  async function persistWorkspaceProfile(): Promise<boolean> {
    try {
      const res = await fetch('/api/workspace', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workspaceName.trim() || undefined,
          slug: workspaceSlug.trim() || undefined,
        }),
      });
      return res.ok;
    } catch (err) {
      console.error('Failed to save workspace profile:', err);
      return false;
    }
  }

  // Save connection token to backend
  async function handleSaveToken(provider: 'devto' | 'hashnode', token: string): Promise<boolean> {
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: token,
          tokenMetadata: {
            source: 'onboarding_wizard',
          },
        }),
      });
      return res.ok;
    } catch (err) {
      console.error(`Failed to connect ${provider}:`, err);
      return false;
    }
  }

  // Next Step Action Handler
  async function handleNext() {
    setIsSubmitting(true);
    try {
      if (currentStep === 1) {
        await persistWorkspaceProfile();
        setCompletedSteps((prev) => Array.from(new Set([...prev, 1])));
        setCurrentStep(2);
      } else if (currentStep === 2) {
        setCompletedSteps((prev) => Array.from(new Set([...prev, 2])));
        setCurrentStep(3);
      } else if (currentStep === 3) {
        setCompletedSteps((prev) => Array.from(new Set([...prev, 3])));
        setCurrentStep(4);
      } else if (currentStep === 4) {
        const res = await fetch('/api/onboarding/launch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            createSampleArticle,
            canonicalSource,
            canonicalUrl: canonicalSource === 'external' ? canonicalUrl.trim() : undefined,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (data.articleId) {
          router.push(`/articles/${data.articleId}`);
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Previous Step Action Handler
  function handlePrev() {
    if (currentStep === 1) {
      router.push('/login');
    } else {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  }

  // Save & Exit to Dashboard
  async function handleSaveAndExit() {
    await persistWorkspaceProfile();
    router.push('/dashboard');
    router.refresh();
  }

  if (isInitializing) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--surface-base, #070B12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary, #AAB5C4)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '13px',
        }}
      >
        Initializing ArtXFlow Workspace Onboarding...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--surface-base, #070B12)',
        color: 'var(--text-primary, #F5F7FA)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Application Header */}
      <OnboardingHeader
        userName={userName}
        userEmail={userEmail}
        onSaveAndExit={handleSaveAndExit}
      />

      {/* Main Wizard Container */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '24px clamp(16px, 3vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Stepper Ribbon */}
        <OnboardingStepper
          currentStep={currentStep}
          completedSteps={completedSteps}
          onSelectStep={(step) => setCurrentStep(step)}
        />

        {/* Step Stage Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {currentStep === 1 && (
            <StepWorkspaceProfile
              workspaceName={workspaceName}
              workspaceSlug={workspaceSlug}
              onWorkspaceNameChange={setWorkspaceName}
              onWorkspaceSlugChange={setWorkspaceSlug}
            />
          )}

          {currentStep === 2 && (
            <StepCanonicalSource
              sourceType={canonicalSource}
              onSourceTypeChange={setCanonicalSource}
              canonicalUrl={canonicalUrl}
              onCanonicalUrlChange={setCanonicalUrl}
            />
          )}

          {currentStep === 3 && (
            <StepConnectDestinations
              state={destinations}
              onChange={setDestinations}
              onSaveToken={handleSaveToken}
            />
          )}

          {currentStep === 4 && (
            <StepVerifyDispatch
              workspaceName={workspaceName}
              workspaceSlug={workspaceSlug}
              canonicalSource={canonicalSource}
              canonicalUrl={canonicalUrl}
              destinations={destinations}
              createSampleArticle={createSampleArticle}
              onCreateSampleArticleToggle={setCreateSampleArticle}
            />
          )}
        </div>
      </main>

      {/* Sticky Bottom Actions Bar */}
      <OnboardingFooter
        currentStep={currentStep}
        onPrev={handlePrev}
        onNext={handleNext}
        onSkip={handleSaveAndExit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            backgroundColor: 'var(--surface-base, #070B12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary, #AAB5C4)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
          }}
        >
          Loading workspace setup...
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}

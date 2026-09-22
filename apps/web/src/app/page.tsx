import React from 'react';
import { headers } from 'next/headers';
import { getSession, bootstrapPersonalOrganization } from '@artxflow/auth';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import { HeroBackdrop } from '../components/hero-backdrop';
import { LandingHero } from '../components/landing/landing-hero';
import { LandingProofBar } from '../components/landing/landing-proof-bar';
import { LandingHeroVisual } from '../components/landing/landing-hero-visual';
import { LandingComparison } from '../components/landing/landing-comparison';
import { LandingPipelineBar } from '../components/landing/landing-pipeline-bar';
import { LandingSeoProtection } from '../components/landing/landing-seo-protection';
import { LandingAstRewrites } from '../components/landing/landing-ast-rewrites';
import { LandingArchitectureCards } from '../components/landing/landing-architecture-cards';
import { LandingCompetitiveMatrix } from '../components/landing/landing-competitive-matrix';
import { LandingDeveloperSection } from '../components/landing/landing-developer-section';
import { LandingCommunityMetrics } from '../components/landing/landing-community-metrics';
import { LandingCta } from '../components/landing/landing-cta';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const headersList = await headers();
  const session = await getSession(headersList);

  let user = null;
  let organization = null;
  let membership = null;

  if (session?.user) {
    user = session.user;
    const bootstrapResult = await bootstrapPersonalOrganization({
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
    });
    organization = bootstrapResult.organization;
    membership = bootstrapResult.membership;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--surface-base, #070B12)',
        color: 'var(--text-primary, #F5F7FA)',
        position: 'relative',
        overflowX: 'clip',
      }}
    >
      {/* Dynamic Ambient Background */}
      <HeroBackdrop />

      {/* Sticky Top Header Navigation */}
      <Navbar
        user={user}
        organizationName={organization?.name}
        role={membership?.role}
      />

      {/* Main Landing Flow */}
      <main
        id="main-content"
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <LandingHero />
        <LandingProofBar />
        <LandingHeroVisual />
        <LandingComparison />
        <LandingPipelineBar />
        <LandingSeoProtection />
        <LandingAstRewrites />
        <LandingArchitectureCards />
        <LandingCompetitiveMatrix />
        <LandingDeveloperSection />
        <LandingCommunityMetrics />
        <LandingCta />
      </main>

      {/* Enterprise Global Footer */}
      <Footer />
    </div>
  );
}

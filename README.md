# ArtXFlow

> **Write once. Flow everywhere.**

ArtXFlow is an open-source content distribution platform for creating, managing, and publishing articles across multiple destinations from a single source.

Instead of writing an article separately for every platform, ArtXFlow aims to give creators and developers one unified workspace where content can be authored once, adapted for different destinations, published, updated, and eventually analyzed from one place.

---

## Why ArtXFlow?

Publishing technical and editorial content across the web often means repeating the same work:

- Write the article.
- Reformat it for another platform.
- Upload images again.
- Adjust tags and metadata.
- Publish it.
- Repeat the process for every destination.
- Keep track of which version is live where.

ArtXFlow is built around a simple idea:

```text
                    ONE SOURCE
                        │
                  ┌─────┴─────┐
                  │ ArtXFlow  │
                  └─────┬─────┘
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
        Blog          Dev.to        Medium
          ↓             ↓             ↓
      Hashnode       LinkedIn     Newsletter
```

**One source. Every destination.**

---

## Vision

ArtXFlow is intended to grow from a cross-publishing tool into a broader **content distribution platform**.

The long-term direction is:

```text
Create
  ↓
Transform
  ↓
Distribute
  ↓
Synchronize
  ↓
Analyze
```

Potential capabilities include:

- Long-form article publishing
- Platform-specific content transformation
- Multi-destination publishing
- Scheduled publishing
- Canonical URL management
- Media management
- Content versioning
- Publishing status and retries
- Social post generation
- Newsletter distribution
- Unified analytics
- AI-assisted content adaptation

---

## Supported Destinations

The integration layer is designed to support publishing destinations through isolated platform adapters.

Initial and planned integrations include:

| Destination | Type | Status |
|---|---|---|
| Own Blog | Website | Planned |
| DEV Community | Developer publishing | Planned |
| Medium | Publishing | Planned |
| Hashnode | Developer publishing | Planned |
| WordPress | CMS | Planned |
| Ghost | Publishing platform | Planned |
| Substack | Newsletter | Planned |
| LinkedIn | Social / professional | Planned |
| X | Social | Planned |

> Availability and API capabilities vary by platform. ArtXFlow will only use officially supported APIs or integrations where practical.

---

## Core Product Model

ArtXFlow treats your article as the **canonical source of truth**.

```text
                         Article
                            │
                   ┌────────┴────────┐
                   │   ArtXFlow      │
                   │ Distribution    │
                   └────────┬────────┘
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
          Platform A     Platform B     Platform C
             │              │              │
             └──────────────┼──────────────┘
                            ↓
                        Analytics
```

Each destination can have its own publishing configuration while remaining connected to the original article.

This allows ArtXFlow to eventually support:

- Per-platform titles
- Platform-specific descriptions
- Tags
- Canonical URLs
- Formatting transformations
- Media handling
- Publication state
- Update synchronization

---

## Design Philosophy

ArtXFlow is designed as a **premium developer-focused SaaS experience**, not as a traditional social-media scheduler.

### Brand concept

**Art + X + Flow**

- **Art** → Article / Authoring
- **X** → Cross-platform / intersection / connection
- **Flow** → Movement of content from one source to many destinations

### Visual identity

The ArtXFlow mark represents a single source flowing through an intersection and branching into multiple destinations.

**Primary tagline**

> **Write once. Flow everywhere.**

**Supporting statement**

> **One source. Every destination.**

See [`design.md`](./design.md) for the complete design system, including:

- Logo guidelines
- AXF monogram
- Color palette
- Typography
- Spacing
- Component principles
- Dark/light mode
- Motion
- Accessibility
- Brand voice

---

## Project Status

🚧 **Early-stage open-source project**

ArtXFlow is currently being developed from the ground up.

The repository is intentionally evolving, and APIs, architecture, database models, and UI patterns may change significantly during early development.

The goal is to build the product in public while keeping the codebase modular, documented, and contributor-friendly.

---

## Technology Direction

The exact stack may evolve as the project develops, but ArtXFlow is being designed around a modern TypeScript-centric architecture.

Potential stack:

```text
Frontend
├── Next.js
├── React
├── TypeScript
└── Tailwind CSS / custom design system

Backend
├── TypeScript
├── API layer
├── Background jobs
└── Platform integration adapters

Data
├── PostgreSQL
└── ORM / database toolkit

Infrastructure
├── Vercel
├── Managed PostgreSQL
└── Object storage

Tooling
├── pnpm
├── Turborepo
└── GitHub Actions
```

> These technologies are directional rather than a promise that every item will remain in the final implementation.

---

## Architecture Principles

ArtXFlow should remain modular as the number of publishing destinations grows.

### Platform adapter architecture

Each publishing destination should implement a common interface rather than being tightly coupled to the core application.

Conceptually:

```ts
interface PublishingPlatform {
  authenticate(): Promise<void>;

  createArticle(
    article: Article
  ): Promise<PublishedArticle>;

  updateArticle(
    id: string,
    article: Article
  ): Promise<PublishedArticle>;

  deleteArticle(
    id: string
  ): Promise<void>;

  getArticle(
    id: string
  ): Promise<PublishedArticle>;

  transform(
    article: Article
  ): PlatformArticle;
}
```

This allows new destinations to be added without rewriting the core publishing workflow.

### Reliability

Publishing integrations should account for:

- Rate limits
- Retries
- Idempotency
- Partial failures
- Authentication expiration
- API differences
- Platform-specific formatting
- Publishing state transitions

---

## Development Principles

ArtXFlow aims to follow a few core engineering principles:

**Content first**  
The article remains the primary object. Platform complexity should stay secondary.

**One canonical source**  
The original content should remain the source of truth.

**Adapters over conditionals**  
Platform-specific behavior belongs in isolated adapters.

**Async by design**  
Long-running publishing operations should not block the main request unnecessarily.

**Observable workflows**  
Every publishing action should have clear state and useful error information.

**Accessible by default**  
The UI should target WCAG 2.2 AA.

**Open by default**  
The project should favor understandable architecture, documentation, and contributor-friendly workflows.

---

## Architecture

- **Modular Monolith**: TypeScript monorepo orchestrated with pnpm workspaces and Turborepo.
- **Web App**: Next.js App Router (`apps/web`).
- **Background Worker**: Inngest background event-driven workflows (`apps/worker`).
- **Database**: PostgreSQL (Neon-compatible) with Drizzle ORM (`packages/database`).
- **Auth**: Better Auth (`packages/auth`).
- **Publishing & Distribution**: Multi-destination publishing engine (`packages/publishing`, `packages/platform-adapters`).

## Monorepo Structure

```text
artxflow/
├── apps/
│   ├── web/                     # Next.js web application
│   └── worker/                  # Inngest background worker
├── packages/
│   ├── analytics/               # Normalized metrics and analytics ingestion
│   ├── auth/                    # Authentication configuration and session helpers
│   ├── config/                  # Typed environment configuration
│   ├── content-core/            # Article and ArticleVersion domain models
│   ├── database/                # Drizzle schema, migrations, and database client
│   ├── design-system/           # Tokens, themes, and CSS variables
│   ├── platform-adapters/       # Adapters for ArtXFlow blog, DEV.to, Medium, etc.
│   ├── publishing/              # Publishing orchestration and state machine
│   ├── storage/                 # Storage provider abstraction
│   ├── transformations/         # Markdown transformations
│   ├── types/                   # Cross-domain shared types
│   └── ui/                      # Shared reusable UI components
├── docs/                        # Architecture and implementation documentation
└── AGENTS.md                    # Agent guidelines
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Run type checks
pnpm typecheck

# Run linter
pnpm lint

# Build all packages and applications
pnpm build

# Start development servers
pnpm dev
```

---

## Environment Variables

Environment configuration will vary by application and integration.

A future `.env.example` should document variables such as:

```env
DATABASE_URL=

AUTH_SECRET=

# Platform integrations
DEVTO_API_KEY=
MEDIUM_TOKEN=
HASHNODE_TOKEN=

# Application
NEXT_PUBLIC_APP_URL=
```

Never commit real credentials, API keys, or tokens.

---

## Contributing

Contributions are welcome.

ArtXFlow is being built in public, and the project benefits from:

- Bug reports
- Feature discussions
- Documentation improvements
- UI/UX ideas
- Platform integrations
- Tests
- Performance improvements
- Accessibility improvements
- Developer tooling

Before making larger changes, open an issue or discussion so the proposed direction can be aligned with the architecture.

Please read [`CONTRIBUTING.md`](./CONTRIBUTING.md) before submitting a pull request once contribution guidelines are available.

---

## Roadmap

The roadmap is expected to evolve as the product is validated.

### Phase 1 — Foundation

- [ ] Monorepo setup
- [ ] Web application shell
- [ ] Authentication
- [ ] Database foundation
- [ ] Core design system
- [ ] Article editor
- [ ] Draft management

### Phase 2 — Publishing

- [ ] Canonical article model
- [ ] Media handling
- [ ] Publishing workflow
- [ ] Platform adapter interface
- [ ] DEV integration
- [ ] Hashnode integration
- [ ] Medium integration
- [ ] Own blog publishing

### Phase 3 — Distribution

- [ ] Multi-platform publishing
- [ ] Platform-specific transformations
- [ ] Scheduling
- [ ] Publishing history
- [ ] Retry handling
- [ ] Sync/update published articles
- [ ] Destination management

### Phase 4 — Intelligence

- [ ] AI-assisted adaptation
- [ ] SEO metadata generation
- [ ] Social post generation
- [ ] Newsletter generation
- [ ] Content recommendations

### Phase 5 — Analytics

- [ ] Unified publishing analytics
- [ ] Platform performance
- [ ] Article-level performance
- [ ] Engagement tracking
- [ ] Distribution insights

---

## License

ArtXFlow source code is released under the **MIT License**.

See [`LICENSE`](./LICENSE).

### Trademark Notice

The MIT License applies to the source code and associated copyrightable materials covered by that license.

**ArtXFlow**, the ArtXFlow name, logo, AXF monogram, visual identity, and other brand assets are not automatically licensed under the MIT License.

The ArtXFlow brand and associated marks may only be used in accordance with applicable trademark and brand guidelines.

---

## Community

This project is intended to be built openly.

As the community grows, additional project resources may include:

- GitHub Discussions
- Issue templates
- Feature request templates
- Contribution guides
- Architecture decision records
- Documentation site
- Community chat

---

## Acknowledgements

ArtXFlow is inspired by the broader ecosystem of open-source publishing tools, developer platforms, content management systems, and web infrastructure.

The project does not claim affiliation with any third-party publishing platform unless explicitly stated.

---

## Star the Project

If the idea is useful or interesting, consider starring the repository ⭐

It helps signal interest and makes it easier for others to discover the project.

---

**ArtXFlow**

> **Write once. Flow everywhere.**

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getSession } from '@artxflow/auth';
import { logger } from '@/lib/logger';

export interface UnsplashPhotoDto {
  id: string;
  description: string;
  alt: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    username: string;
    link: string;
  };
}

const CURATED_TECH_PHOTOS: UnsplashPhotoDto[] = [
  {
    id: 'tech-1',
    description: 'Code on screen in dark mode',
    alt: 'Computer screen showing syntax highlighted code',
    urls: {
      raw: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
      full: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1920&q=80',
      regular: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1080&q=80',
      small: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80',
      thumb: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=200&q=80',
    },
    user: {
      name: 'Fotis Fotopoulos',
      username: 'ffstop',
      link: 'https://unsplash.com/@ffstop?utm_source=artxflow&utm_medium=referral',
    },
  },
  {
    id: 'tech-2',
    description: 'Developer workspace with MacBook and notebook',
    alt: 'Clean modern desk with laptop and coffee',
    urls: {
      raw: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
      full: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1920&q=80',
      regular: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1080&q=80',
      small: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80',
      thumb: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=200&q=80',
    },
    user: {
      name: 'Luca Bravo',
      username: 'lucabravo',
      link: 'https://unsplash.com/@lucabravo?utm_source=artxflow&utm_medium=referral',
    },
  },
  {
    id: 'tech-3',
    description: 'HTML & CSS programming on modern display',
    alt: 'Source code editor display',
    urls: {
      raw: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
      full: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80',
      regular: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1080&q=80',
      small: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
      thumb: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=200&q=80',
    },
    user: {
      name: 'Ilya Pavlov',
      username: 'ilyapavlov',
      link: 'https://unsplash.com/@ilyapavlov?utm_source=artxflow&utm_medium=referral',
    },
  },
  {
    id: 'tech-4',
    description: 'Developer typing on silver laptop',
    alt: 'Top view of person coding on a laptop',
    urls: {
      raw: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
      full: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1920&q=80',
      regular: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1080&q=80',
      small: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
      thumb: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80',
    },
    user: {
      name: 'Christopher Gower',
      username: 'cgower',
      link: 'https://unsplash.com/@cgower?utm_source=artxflow&utm_medium=referral',
    },
  },
  {
    id: 'tech-5',
    description: 'Abstract digital matrix data visualization',
    alt: 'Binary glowing data stream visualization',
    urls: {
      raw: 'https://images.unsplash.com/photo-1510519138111-550711910609',
      full: 'https://images.unsplash.com/photo-1510519138111-550711910609?auto=format&fit=crop&w=1920&q=80',
      regular: 'https://images.unsplash.com/photo-1510519138111-550711910609?auto=format&fit=crop&w=1080&q=80',
      small: 'https://images.unsplash.com/photo-1510519138111-550711910609?auto=format&fit=crop&w=400&q=80',
      thumb: 'https://images.unsplash.com/photo-1510519138111-550711910609?auto=format&fit=crop&w=200&q=80',
    },
    user: {
      name: 'Roman Synkevych',
      username: 'synkevych',
      link: 'https://unsplash.com/@synkevych?utm_source=artxflow&utm_medium=referral',
    },
  },
  {
    id: 'tech-6',
    description: 'Server hardware and high tech cloud infrastructure',
    alt: 'High tech fiber network and server cables',
    urls: {
      raw: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      full: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80',
      regular: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1080&q=80',
      small: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80',
      thumb: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=200&q=80',
    },
    user: {
      name: 'Kevin Ku',
      username: 'kevinkunothingisimmposible',
      link: 'https://unsplash.com/@kevinkunothingisimmposible?utm_source=artxflow&utm_medium=referral',
    },
  },
  {
    id: 'tech-7',
    description: 'Web developer workstation with code and coffee',
    alt: 'Modern workspace setup for software engineer',
    urls: {
      raw: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97',
      full: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1920&q=80',
      regular: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1080&q=80',
      small: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=400&q=80',
      thumb: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=200&q=80',
    },
    user: {
      name: 'AltumCode',
      username: 'altumcode',
      link: 'https://unsplash.com/@altumcode?utm_source=artxflow&utm_medium=referral',
    },
  },
  {
    id: 'tech-8',
    description: 'Clean coding environment with terminal',
    alt: 'Code terminal window and minimalist desk',
    urls: {
      raw: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935',
      full: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1920&q=80',
      regular: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1080&q=80',
      small: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=400&q=80',
      thumb: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=200&q=80',
    },
    user: {
      name: 'Markus Spiske',
      username: 'markusspiske',
      link: 'https://unsplash.com/@markusspiske?utm_source=artxflow&utm_medium=referral',
    },
  },
];

export async function GET(request: Request) {
  const headersList = await headers();
  const session = await getSession(headersList);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('query') || '').trim();
  const page = searchParams.get('page') || '1';
  const perPage = searchParams.get('per_page') || '12';

  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

  if (unsplashKey) {
    try {
      const endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
        query || 'technology software programming',
      )}&page=${page}&per_page=${perPage}&client_id=${unsplashKey}`;

      const res = await fetch(endpoint, {
        headers: {
          'Accept-Version': 'v1',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const photos: UnsplashPhotoDto[] = (data.results || []).map(
          (p: {
            id: string;
            description?: string;
            alt_description?: string;
            urls: { raw: string; full: string; regular: string; small: string; thumb: string };
            user: { name: string; username: string };
          }) => ({
            id: p.id,
            description: p.description || p.alt_description || 'Unsplash image',
            alt: p.alt_description || p.description || 'Unsplash image',
            urls: p.urls,
            user: {
              name: p.user.name,
              username: p.user.username,
              link: `https://unsplash.com/@${p.user.username}?utm_source=artxflow&utm_medium=referral`,
            },
          }),
        );
        return NextResponse.json({ results: photos, total: data.total });
      }
    } catch (err) {
      logger.warn({ err }, '[Unsplash Search] External API failed, falling back to curated list');
    }
  }

  // Curated fallback filter if query is specified
  let results = CURATED_TECH_PHOTOS;
  if (query) {
    const q = query.toLowerCase();
    const filtered = CURATED_TECH_PHOTOS.filter(
      (p) =>
        p.description.toLowerCase().includes(q) ||
        p.alt.toLowerCase().includes(q) ||
        p.user.name.toLowerCase().includes(q),
    );
    if (filtered.length > 0) {
      results = filtered;
    }
  }

  return NextResponse.json({
    results,
    total: results.length,
    isFallback: !unsplashKey,
  });
}

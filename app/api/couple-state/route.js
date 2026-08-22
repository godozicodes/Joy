import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const STATE_KEY = 'joy:private:couple-state:v1';

const DEFAULT_STATE = {
  wishlist: [],
  memories: [],
};

function freshState() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

async function redisCommand(command) {
  const response = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('Shared store unavailable');
  const data = await response.json();
  return data.result;
}

async function readState() {
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      const stored = await redisCommand(['GET', STATE_KEY]);
      if (!stored) return freshState();
      const parsed = JSON.parse(stored);
      return {
        wishlist: Array.isArray(parsed?.wishlist) ? parsed.wishlist : [],
        memories: Array.isArray(parsed?.memories) ? parsed.memories : [],
      };
    } catch {
      // Fall through to warm-instance memory.
    }
  }

  if (!globalThis.__joySharedState) globalThis.__joySharedState = freshState();
  return globalThis.__joySharedState;
}

async function writeState(state) {
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      await redisCommand(['SET', STATE_KEY, JSON.stringify(state)]);
      return true;
    } catch {
      // Keep the page usable if the shared store is briefly unavailable.
    }
  }

  globalThis.__joySharedState = state;
  return false;
}

function getUser(request) {
  const user = request.cookies.get('joy_user')?.value;
  return user === 'joy' || user === 'ozioma' ? user : null;
}

function cleanWishlistItem(raw, user, now) {
  const image = String(raw?.image || '');
  const safeImage = image.startsWith('data:image/') && image.length <= 650000 ? image : '';
  const title = String(raw?.title || '').trim().slice(0, 80);
  if (!title) return null;

  let link = String(raw?.link || '').trim().slice(0, 500);
  if (link && !/^https?:\/\//i.test(link)) link = '';

  return {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    price: String(raw?.price || '').trim().slice(0, 30),
    link,
    note: String(raw?.note || '').trim().slice(0, 160),
    image: safeImage,
    by: user,
    at: now,
  };
}

export async function GET(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const state = await readState();
  return NextResponse.json(
    { state, persistent: Boolean(REDIS_URL && REDIS_TOKEN) },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}

export async function POST(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action = String(body.action || '');
  const now = Date.now();
  const state = await readState();
  state.wishlist ||= [];
  state.memories ||= [];

  if (action === 'wishlist-add') {
    if (user !== 'joy') return NextResponse.json({ error: 'Only Joy can add wishlist items.' }, { status: 403 });
    const item = cleanWishlistItem(body.item, user, now);
    if (!item) return NextResponse.json({ error: 'Item name is required.' }, { status: 400 });
    state.wishlist = [item, ...state.wishlist].slice(0, 24);
  } else if (action === 'wishlist-remove') {
    if (user !== 'joy') return NextResponse.json({ error: 'Only Joy can remove wishlist items.' }, { status: 403 });
    const id = String(body.id || '');
    state.wishlist = state.wishlist.filter((item) => item.id !== id);
  } else if (action === 'memory-add') {
    const value = String(body.value || '').trim().slice(0, 220);
    if (!value) return NextResponse.json({ error: 'Write a memory first.' }, { status: 400 });
    state.memories = [
      {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        text: value,
        by: user,
        at: now,
      },
      ...state.memories,
    ].slice(0, 120);
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const persistent = await writeState(state);
  return NextResponse.json(
    { state, persistent },
    { headers: { 'Cache-Control': 'no-store, max-age=0' } }
  );
}

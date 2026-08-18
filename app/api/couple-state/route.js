import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const STATE_KEY = 'joy:private:couple-state:v1';

const DEFAULT_STATE = {
  moods: { ozioma: 'Thinking about you 💭', joy: 'Sweet & calm 💗' },
  notes: {
    ozioma: { text: '', at: 0 },
    joy: { text: '', at: 0 },
  },
  presence: { ozioma: 0, joy: 0 },
  kiss: { id: '', from: '', at: 0 },
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
      return { ...freshState(), ...JSON.parse(stored) };
    } catch {
      // Fall through to warm-instance memory so the UI never breaks.
    }
  }

  if (!globalThis.__joyCoupleState) globalThis.__joyCoupleState = freshState();
  return globalThis.__joyCoupleState;
}

async function writeState(state) {
  if (REDIS_URL && REDIS_TOKEN) {
    try {
      await redisCommand(['SET', STATE_KEY, JSON.stringify(state)]);
      return true;
    } catch {
      // Keep the experience working even if the shared store has an outage.
    }
  }

  globalThis.__joyCoupleState = state;
  return false;
}

function getUser(request) {
  const user = request.cookies.get('joy_user')?.value;
  return user === 'joy' || user === 'ozioma' ? user : null;
}

function responsePayload(state, persistent) {
  const now = Date.now();
  return {
    state,
    persistent,
    online: {
      ozioma: now - Number(state.presence?.ozioma || 0) < 45000,
      joy: now - Number(state.presence?.joy || 0) < 45000,
    },
  };
}

export async function GET(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const state = await readState();
  return NextResponse.json(responsePayload(state, Boolean(REDIS_URL && REDIS_TOKEN)), {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const action = String(body.action || '');
  const now = Date.now();
  const state = await readState();

  state.moods ||= freshState().moods;
  state.notes ||= freshState().notes;
  state.presence ||= freshState().presence;
  state.kiss ||= freshState().kiss;

  if (action === 'presence') {
    state.presence[user] = now;
  } else if (action === 'mood') {
    const value = String(body.value || '').trim().slice(0, 48);
    if (value) state.moods[user] = value;
  } else if (action === 'note') {
    const value = String(body.value || '').trim().slice(0, 180);
    state.notes[user] = { text: value, at: now };
  } else if (action === 'kiss') {
    state.kiss = {
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      from: user,
      at: now,
    };
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const persistent = await writeState(state);
  return NextResponse.json(responsePayload(state, persistent), {
    headers: { 'Cache-Control': 'no-store' },
  });
}

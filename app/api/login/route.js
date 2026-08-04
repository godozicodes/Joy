import { NextResponse } from 'next/server';

export async function POST(request) {
  const { username = '', password = '' } = await request.json();
  const normalized = String(username).trim().toLowerCase();

  const validOzioma = normalized === 'ozioma' && password === process.env.OZIOMA_PASSWORD;
  const validJoy = normalized === 'joy' && password === process.env.JOY_PASSWORD;
  const secret = process.env.AUTH_SECRET;

  if (!secret || (!validOzioma && !validJoy)) {
    return NextResponse.json({ error: 'Wrong username or password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('joy_session', secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });
  response.cookies.set('joy_user', normalized, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return response;
}

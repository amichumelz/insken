import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createSessionToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { ok: false, message: 'Sila masukkan Emel dan Kata Laluan.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, message: 'Emel atau kata laluan tidak sah.' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { ok: false, message: 'Emel atau kata laluan tidak sah.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json({
      ok: true,
      message: 'Log masuk berjaya!',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    res.cookies.set('insken_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error?.message || 'Ralat log masuk.' },
      { status: 500 }
    );
  }
}

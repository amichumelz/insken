import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSessionToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { ok: false, message: 'Sila lengkapkan Nama, Emel dan Kata Laluan.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, message: 'Akaun dengan emel ini sudah wujud.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role === 'STAFF' ? 'STAFF' : 'ADMIN';

    const user = await db.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: userRole,
      },
    });

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json({
      ok: true,
      message: 'Pendaftaran berjaya!',
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
      { ok: false, message: error?.message || 'Ralat pendaftaran akaun.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, createSessionToken } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function ensureUserTable() {
  try {
    await db.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'ADMIN',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await db.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);
  } catch (err) {
    console.error('ensureUserTable warning:', err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { ok: false, message: 'Sila lengkapkan Nama, Emel dan Kata Laluan.' },
        { status: 400 }
      );
    }

    if (password.trim().length < 6) {
      return NextResponse.json(
        { ok: false, message: 'Kata laluan sekurang-kurangnya 6 aksara.' },
        { status: 400 }
      );
    }

    // Ensure User table exists in Cloudflare D1
    await ensureUserTable();

    const cleanEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    let existing = null;
    try {
      existing = await db.user.findUnique({
        where: { email: cleanEmail },
      });
    } catch (dbErr: any) {
      // If table was missing, retry once after create table
      console.warn('findUnique retry after table init:', dbErr?.message);
      await ensureUserTable();
      existing = await db.user.findUnique({
        where: { email: cleanEmail },
      });
    }

    if (existing) {
      return NextResponse.json(
        { ok: false, message: 'Akaun dengan emel ini sudah wujud. Sila log masuk.' },
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
      message: 'Pendaftaran akaun admin berjaya!',
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { ok: false, message: error?.message || 'Ralat semasa mendaftar akaun pentadbir.' },
      { status: 500 }
    );
  }
}

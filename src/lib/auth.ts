/**
 * Edge-compatible Authentication Helper using Web Crypto API.
 * 100% compatible with Cloudflare Workers, Node.js, and browser runtimes.
 */

const AUTH_SECRET = process.env.AUTH_SECRET || 'insken-asean-msme-secure-secret-2026';

// Helper: Convert ArrayBuffer to Hex String
function buf2hex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

// Pure Web Standard Base64 URL Safe Encoder/Decoder
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Hash password with SHA-256 + salt
export async function hashPassword(password: string, salt?: string): Promise<string> {
  const activeSalt = salt || Math.random().toString(36).substring(2, 10);
  const encoder = new TextEncoder();
  const data = encoder.encode(`${password}:${activeSalt}:${AUTH_SECRET}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashHex = buf2hex(hashBuffer);
  return `${activeSalt}$${hashHex}`;
}

// Verify password
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !storedHash.includes('$')) return false;
  const [salt] = storedHash.split('$');
  const computed = await hashPassword(password, salt);
  return computed === storedHash;
}

export interface AuthSession {
  id: string;
  name: string;
  email: string;
  role: string;
  exp: number;
}

// Simple signed token for Edge runtimes
export async function createSessionToken(user: { id: string; name: string; email: string; role: string }): Promise<string> {
  const session: AuthSession = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const payloadStr = JSON.stringify(session);
  const payloadB64 = toBase64Url(payloadStr);

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(`${payloadB64}.${AUTH_SECRET}`));
  const signature = buf2hex(signatureBuffer);

  return `${payloadB64}.${signature}`;
}

export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  if (!token || !token.includes('.')) return null;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const encoder = new TextEncoder();
  const expectedSigBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(`${payloadB64}.${AUTH_SECRET}`));
  const expectedSig = buf2hex(expectedSigBuffer);

  if (signature !== expectedSig) return null;

  try {
    const payloadStr = fromBase64Url(payloadB64);
    const session = JSON.parse(payloadStr) as AuthSession;
    if (Date.now() > session.exp) return null;
    return session;
  } catch {
    return null;
  }
}

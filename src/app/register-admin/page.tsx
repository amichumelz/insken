'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Lock, Mail, User, Shield, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function RegisterAdminPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error('Sila lengkapkan semua maklumat pendaftaran.');
      return;
    }
    if (password.length < 6) {
      toast.error('Kata laluan sekurang-kurangnya 6 aksara.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        toast.success('Akaun admin berjaya didaftarkan!');
        router.push('/admin');
        router.refresh();
      } else {
        toast.error(data.message || 'Pendaftaran akaun gagal.');
      }
    } catch {
      toast.error('Ralat sambungan ke pelayan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b bg-[#0B1F3A] text-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A017] to-[#F59E0B] text-sm font-bold text-[#0B1F3A] shadow">
              I
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base">INSKEN Portal</span>
                <span className="rounded bg-[#D4A017]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#F59E0B]">
                  Daftar Admin
                </span>
              </div>
              <p className="text-[11px] text-white/70 hidden sm:block">
                ASEAN MSME A.I. Skills Training
              </p>
            </div>
          </div>

          <Link href="/login">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Log Masuk
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <Card className="border shadow-lg">
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Daftar Akaun Pentadbir</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Cipta akaun pegawai atau pentadbir operasi INSKEN.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Nama Penuh
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ahmad Zaki"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    Emel Rasmi
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="zaki@insken.gov.my"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    Kata Laluan
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 aksara"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 h-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Peranan / Role</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Pilih peranan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Pentadbir (Full Admin Access)</SelectItem>
                      <SelectItem value="STAFF">Pegawai Operasi (Staff)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-10 text-sm font-semibold gap-2 mt-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mendaftar Akaun...
                    </>
                  ) : (
                    <>
                      Daftar &amp; Masuk ke Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  Sudah mempunyai akaun?{' '}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    Log Masuk di sini
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-4 text-center text-xs text-muted-foreground">
        <p>© 2026 INSKEN · Institut Keusahawanan Negara</p>
      </footer>
    </div>
  );
}

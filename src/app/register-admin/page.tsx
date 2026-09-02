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
import { useLanguage, LanguageToggle } from '@/lib/i18n';

export default function RegisterAdminPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error(lang === 'ms' ? 'Sila lengkapkan semua maklumat pendaftaran.' : 'Please complete all registration fields.');
      return;
    }
    if (password.length < 6) {
      toast.error(lang === 'ms' ? 'Kata laluan sekurang-kurangnya 6 aksara.' : 'Password must be at least 6 characters.');
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
        toast.success(lang === 'ms' ? 'Akaun admin berjaya didaftarkan!' : 'Admin account registered successfully!');
        router.push('/admin');
        router.refresh();
      } else {
        toast.error(data.message || (lang === 'ms' ? 'Pendaftaran akaun gagal.' : 'Registration failed.'));
      }
    } catch {
      toast.error(lang === 'ms' ? 'Ralat sambungan ke pelayan.' : 'Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b bg-[#0B1F3A] text-white shadow-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#D4A017] to-[#F59E0B] text-sm font-bold text-[#0B1F3A] shadow">
              I
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-semibold text-xs sm:text-base truncate">{t.brandTitle}</span>
                <span className="shrink-0 rounded bg-[#D4A017]/20 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold text-[#F59E0B]">
                  {t.adminRegTitle}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-white/70 truncate hidden xs:block sm:block">
                {t.brandSub}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <LanguageToggle />

            <Link href="/login">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white text-xs gap-1 px-2 sm:px-3"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{t.navLogin}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Card */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-8 sm:py-12">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <Card className="border shadow-lg">
            <CardHeader className="space-y-1 text-center pb-4 px-4 sm:px-6 pt-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">{t.adminRegTitle}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t.adminRegSubtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    {t.adminRegName}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Ahmad Zaki"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-11 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    {t.loginEmail}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="zaki@insken.gov.my"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold">
                    {t.loginPassword}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 aksara / characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 h-11 text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">{t.adminRegRole}</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-11 text-sm">
                      <SelectValue placeholder="Pilih peranan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">{t.adminRegRoleAdmin}</SelectItem>
                      <SelectItem value="STAFF">{t.adminRegRoleStaff}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-11 text-sm font-semibold gap-2 bg-[#0B1F3A] hover:bg-[#1E3A8A] text-white mt-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {lang === 'ms' ? 'Mendaftar Akaun...' : 'Registering Account...'}
                    </>
                  ) : (
                    <>
                      {t.adminRegSubmitBtn}
                      <ArrowRight className="h-4 w-4 text-[#D4A017]" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t text-center">
                <p className="text-xs text-muted-foreground">
                  {t.adminRegHaveAccount}{' '}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    {t.navLogin}
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

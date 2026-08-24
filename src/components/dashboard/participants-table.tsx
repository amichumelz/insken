'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Participant } from '@/lib/types';
import { Search, RefreshCw, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STATUS_TONE: Record<string, string> = {
  DUPLICATE_ENTRY: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
  Registered_Physical: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  Registered_Online: 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  Attended_Physical: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  Attended_Online: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
};

export function ParticipantsTable() {
  const [items, setItems] = useState<Participant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (region !== 'all') params.set('region', region);
    if (status !== 'all') params.set('status', status);
    params.set('limit', String(pageSize));
    params.set('offset', String(page * pageSize));
    try {
      const res = await fetch(`/api/participants?${params.toString()}`, { cache: 'no-store' });
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [q, region, status, page]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (region !== 'all') params.set('region', region);
        if (status !== 'all') params.set('status', status);
        params.set('limit', String(pageSize));
        params.set('offset', String(page * pageSize));
        const res = await fetch(`/api/participants?${params.toString()}`, { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) {
          setItems(data.items ?? []);
          setTotal(data.total ?? 0);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q, region, status, page]);

  useEffect(() => {
    setPage(0);
  }, [q, region, status]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" />
              Participant Registry
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {total.toLocaleString()} records · IC is the unique primary key
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name, IC, ID, email…"
                className="h-8 w-[180px] pl-7 text-xs sm:w-[220px]"
              />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="KL">Kuala Lumpur</SelectItem>
                <SelectItem value="JHR">Johor</SelectItem>
                <SelectItem value="PNG">Penang</SelectItem>
                <SelectItem value="SBH">Sabah</SelectItem>
                <SelectItem value="SWK">Sarawak</SelectItem>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Registered_Physical">Registered (Physical)</SelectItem>
                <SelectItem value="Registered_Online">Registered (Online)</SelectItem>
                <SelectItem value="Attended_Physical">Attended (Physical)</SelectItem>
                <SelectItem value="Attended_Online">Attended (Online)</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={load} disabled={loading} className="h-8 w-8">
              <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-y bg-muted/40">
              <tr className="text-left text-muted-foreground">
                <th className="px-3 py-2 font-medium">Participant ID</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="hidden px-3 py-2 font-medium md:table-cell">IC Number</th>
                <th className="hidden px-3 py-2 font-medium lg:table-cell">Sector</th>
                <th className="px-3 py-2 font-medium">Region</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="hidden px-3 py-2 font-medium sm:table-cell">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-muted-foreground">
                    No participants found.
                  </td>
                </tr>
              ) : (
                items.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b transition-colors hover:bg-muted/30"
                  >
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] font-semibold text-primary">
                      {p.participantId}
                    </td>
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="hidden whitespace-nowrap px-3 py-2 font-mono text-[11px] text-muted-foreground md:table-cell">
                      {p.icNumber}
                    </td>
                    <td className="hidden px-3 py-2 text-muted-foreground lg:table-cell">{p.sector}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 rounded bg-foreground/5 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/70">
                        {p.region}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={cn(
                          'inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold',
                          STATUS_TONE[p.status] ?? 'bg-muted text-muted-foreground',
                        )}
                      >
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="hidden px-3 py-2 text-[11px] text-muted-foreground sm:table-cell">
                      {p.checkInAt
                        ? new Date(p.checkInAt).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t px-3 py-2 text-xs">
          <span className="text-muted-foreground">
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="h-7 px-2"
            >
              <ChevronLeft className="h-3 w-3" />
              Prev
            </Button>
            <span className="px-2 tabular-nums">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="h-7 px-2"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

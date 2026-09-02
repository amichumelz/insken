'use client';

import { Participant, WhatsAppDispatch } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Calendar,
  MapPin,
  Video,
  Tag,
  Download,
  Send,
} from 'lucide-react';

interface WhatsAppPreviewProps {
  participant: Participant;
  qrDataUrl: string;
  whatsapp: WhatsAppDispatch;
  capacityRouted: boolean;
  regionName: string;
}

/**
 * Realistic WhatsApp Business mockup showing the digital pass dispatched to the
 * participant once their QR asset has been generated (PRD §4 Phase 2 — Asset Delivery).
 */
export function WhatsAppPreview({
  participant,
  qrDataUrl,
  whatsapp,
  capacityRouted,
  regionName,
}: WhatsAppPreviewProps) {
  const modeLabel =
    participant.finalMode === 'Registered_Physical' ? 'Physical Venue' : 'Priority Online Session';
  const dispatchedTime = new Date(whatsapp.dispatchedAt).toLocaleTimeString('en-MY', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="mx-auto flex w-full max-w-[320px] flex-col">
      <div className="mb-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Send className="h-3 w-3 text-emerald-500" />
        <span>Asset Delivery Preview</span>
      </div>

      {/* Phone mockup */}
      <div className="relative flex h-[560px] flex-col overflow-hidden rounded-[2.5rem] border-4 border-surface-container-highest bg-black p-3 shadow-xl">
        {/* Notch */}
        <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-xl bg-black" />

        {/* Screen */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-[2rem] bg-[#EFEAE2]">
          {/* WhatsApp header */}
          <div className="z-10 flex items-center gap-3 bg-[#075E54] p-3 pt-6 text-white shadow-sm">
            <ArrowLeft className="h-4 w-4" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <Bot className="h-4 w-4 text-[#075E54]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">ASEAN MSME Bot</div>
              <div className="text-[10px] opacity-80">business account · online</div>
            </div>
          </div>

          {/* Chat area */}
          <div className="relative flex-1 overflow-y-auto p-3 scroll-styled">
            {/* Background pattern */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M20 20L0 0H40L20 20z' fill='%23000' fill-opacity='0.08'/%3E%3C/svg%3E\")",
              }}
            />

            <div className="relative z-10 flex flex-col gap-2">
              {/* Incoming message bubble */}
              <div className="max-w-[92%] rounded-lg rounded-tl-none bg-white p-2 shadow-sm">
                <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-[#075E54]">
                  <CheckCircle2 className="h-3 w-3" />
                  {capacityRouted ? 'Upgraded to Priority Online' : 'Pendaftaran Tempat Disahkan'}
                </div>
                <p className="text-[12px] leading-relaxed text-on-surface">
                  ✅ Hai <strong>{participant.name.split(' ')[0]}</strong>! Pendaftaran anda untuk <strong>Program Latihan A.I. PMKS ASEAN</strong> telah DISAHKAN.
                  Slip digital anda telah sedia di bawah.
                </p>

                {/* Digital pass with QR */}
                <div className="mb-2 mt-2 flex flex-col items-center rounded-md border border-outline-variant bg-surface-container-low p-3">
                  <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                    SLIP PENGESAHAN TEMPAT
                  </div>
                  <div className="text-[9px] text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 rounded px-1.5 py-0.5 mb-2 font-semibold">
                    🔒 QR Kehadiran: Aktif Pada Hari Kelas
                  </div>
                  <div className="relative mb-2 h-32 w-32 bg-white p-2">
                    {/* Real QR code (rendered server-side via `qrcode` lib) */}
                    <img
                      src={qrDataUrl}
                      alt={`QR code for ${participant.participantId}`}
                      className="h-full w-full"
                    />
                    {/* INSKEN logo overlay in QR center */}
                    <div className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded bg-[#0B1F3A] text-[10px] font-bold text-[#D4A017]">
                      I
                    </div>
                  </div>
                  <div className="font-mono text-xs font-semibold text-[#0B1F3A]">
                    {participant.participantId}
                  </div>
                  <div className="mt-0.5 text-[10px] text-on-surface-variant">
                    {participant.region} · {modeLabel}
                  </div>
                </div>

                {/* Pass details */}
                <div className="space-y-1 text-[12px] text-on-surface">
                  <div className="flex items-center gap-1.5">
                    <Tag className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Sector:</span>
                    <span className="font-medium">{participant.sector}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Venue:</span>
                    <span className="font-medium">{regionName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {participant.finalMode === 'Registered_Physical' ? (
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <Video className="h-3 w-3 text-muted-foreground" />
                    )}
                    <span className="text-muted-foreground">Mode:</span>
                    <span className="font-medium">{modeLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Event:</span>
                    <span className="font-medium">{whatsapp.eventDate}</span>
                  </div>
                </div>

                <div className="mt-1.5 text-right text-[10px] text-on-surface-variant">
                  {dispatchedTime}
                </div>
              </div>

              {/* Delivery status line */}
              <div className="flex items-center gap-1.5 self-end rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Delivered · WhatsApp Business API
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="z-10 flex items-center gap-2 border-t border-[#d1d7db] bg-[#F0F0F0] p-2">
            <div className="flex-1 rounded-full bg-white px-4 py-1.5 text-xs text-on-surface-variant">
              Message the bot…
            </div>
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#00A884] text-white">
              <Send className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Delivery Confirmation */}
      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-[#075E54] px-3 py-2 text-xs font-bold text-white shadow-sm">
        <CheckCircle2 className="h-4 w-4 text-white" />
        <span>Dihantar Terus ke WhatsApp Peserta</span>
      </div>
    </div>
  );
}

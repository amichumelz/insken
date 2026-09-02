'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Language = 'ms' | 'en';

export interface Translations {
  // Brand & General
  brandTitle: string;
  brandSub: string;
  participantBadge: string;
  adminBadge: string;
  checkinBadge: string;
  
  // Navigation & Actions
  navDashboard: string;
  navTrainers: string;
  navRegistry: string;
  navRegisterAdmin: string;
  navCheckinAdmin: string;
  navAlreadyRegistered: string;
  navCheckAttendance: string;
  navNotRegistered: string;
  navRegisterNow: string;
  navPublicRegister: string;
  navPublicCheckin: string;
  navLogin: string;
  navLogout: string;
  navRefresh: string;
  navAdminAccess: string;
  navBackToHome: string;

  // Participant Registration
  regOfficialForm: string;
  regTitle: string;
  regSubtitle: string;
  regIcRoutingBadge: string;
  regFormTitle: string;
  regFormSubtitle: string;
  regFullName: string;
  regIcNumber: string;
  regIcPlaceholder: string;
  regEmail: string;
  regPhone: string;
  regSector: string;
  regSelectSector: string;
  regRegion: string;
  regSelectRegion: string;
  regPreferredMode: string;
  regPhysicalMode: string;
  regOnlineMode: string;
  regPhysicalDesc: string;
  regOnlineDesc: string;
  regCapacityWarning: string;
  regSubmitBtn: string;
  regSubmitting: string;
  regSuccessTitle: string;
  regSuccessMsg: string;
  regParticipantId: string;
  regAssignedMode: string;
  regDownloadPass: string;
  regWhatsAppPreview: string;
  regRegisterAnother: string;
  regSlipTitle: string;
  regQrLockedBadge: string;
  regQrLockedDesc: string;
  regEventDateLabel: string;
  regConfirmedBadge: string;

  // Check-in Portal
  checkinCounterTitle: string;
  checkinMainTitle: string;
  checkinSubtitle: string;
  checkinInstantBadge: string;
  checkinInputLabel: string;
  checkinInputPlaceholder: string;
  checkinInputHelp: string;
  checkinModeLabel: string;
  checkinPhysicalBtn: string;
  checkinOnlineBtn: string;
  checkinSubmitBtn: string;
  checkinVerifying: string;
  checkinSuccessTitle: string;
  checkinAlreadyTitle: string;
  checkinNotFoundTitle: string;
  checkinSector: string;
  checkinRegion: string;
  checkinTime: string;

  // Admin Login & Register
  loginTitle: string;
  loginSubtitle: string;
  loginEmail: string;
  loginPassword: string;
  loginSubmitBtn: string;
  loginLoggingIn: string;
  loginNoAccount: string;
  loginCreateAccount: string;
  loginParticipantPrompt: string;
  
  adminRegTitle: string;
  adminRegSubtitle: string;
  adminRegName: string;
  adminRegRole: string;
  adminRegRoleAdmin: string;
  adminRegRoleStaff: string;
  adminRegSubmitBtn: string;
  adminRegHaveAccount: string;

  // Admin Dashboard
  dashGlobalKpi: string;
  dashOfTarget: string;
  dashActiveAlerts: string;
  dashSystemsHealthy: string;
  dashLiveDb: string;
  dashRegionalProgress: string;
  dashSectoralBreakdown: string;
  dashTrainerPerformance: string;
  dashMasterRegistry: string;
  dashAlertsSystem: string;
  dashTotalParticipants: string;
  dashAttended: string;
  dashCapacity: string;
  dashSearchPlaceholder: string;
  dashFilterRegion: string;
  dashFilterStatus: string;
  dashExportCsv: string;
  dashName: string;
  dashStatus: string;
  dashActions: string;
}

export const translations: Record<Language, Translations> = {
  ms: {
    brandTitle: 'INSKEN Portal',
    brandSub: 'Program Latihan Kemahiran A.I. PMKS ASEAN',
    participantBadge: 'Pendaftaran Peserta',
    adminBadge: 'Pentadbir',
    checkinBadge: 'Kaunter Kehadiran',
    
    navDashboard: 'Dashboard Eksekutif',
    navTrainers: 'Prestasi Jurulatih',
    navRegistry: 'Pangkalan Data Peserta',
    navRegisterAdmin: 'Pendaftaran (Admin)',
    navCheckinAdmin: 'Kehadiran (Admin)',
    navAlreadyRegistered: 'Sudah Daftar?',
    navCheckAttendance: 'Semak Kehadiran',
    navNotRegistered: 'Belum Daftar?',
    navRegisterNow: 'Daftar Sekarang',
    navPublicRegister: 'Portal Pendaftaran',
    navPublicCheckin: 'Portal Kehadiran',
    navLogin: 'Log Masuk',
    navLogout: 'Log Keluar',
    navRefresh: 'Muat Semula',
    navAdminAccess: 'Akses Pentadbir (Admin)',
    navBackToHome: 'Kembali ke Utama',

    regOfficialForm: 'Borang Pendaftaran Rasmi',
    regTitle: 'Pendaftaran Program Latihan A.I. PMKS ASEAN',
    regSubtitle: 'Sila lengkapkan butiran perniagaan anda. Pas kehadiran digital ber-QR akan dijana secara automatik.',
    regIcRoutingBadge: 'Pengesahan IC Unik & Laluan Kapasiti Automatik',
    regFormTitle: 'Maklumat Pendaftaran Peserta',
    regFormSubtitle: 'Setiap No. Kad Pengenalan hanya sah untuk 1 pendaftaran.',
    regFullName: 'Nama Penuh (Seperti Dalam IC/Pasport)',
    regIcNumber: 'Nombor Kad Pengenalan / Pasport',
    regIcPlaceholder: 'Cth: 881024-14-5231 atau 881024145231',
    regEmail: 'Alamat Emel Perniagaan',
    regPhone: 'Nombor Telefon (WhatsApp)',
    regSector: 'Sektor Perniagaan',
    regSelectSector: 'Pilih Sektor Perniagaan',
    regRegion: 'Wilayah / Zon Latihan',
    regSelectRegion: 'Pilih Wilayah Latihan',
    regPreferredMode: 'Pilihan Mod Kehadiran',
    regPhysicalMode: 'Fizikal (Bersemuka)',
    regOnlineMode: 'Dalam Talian (Online Zoom)',
    regPhysicalDesc: 'Tertakluk kepada had kapasiti kerusi dewan fizikal wilayah.',
    regOnlineDesc: 'Akses tanpa had melalui platform sesi interaktif live.',
    regCapacityWarning: 'Dewan fizikal telah penuh (Kapasiti 100%). Anda akan dialihkan secara automatik ke Mod Online.',
    regSubmitBtn: 'Hantar Pendaftaran & Jana Pas QR',
    regSubmitting: 'Mengesahkan & Menjana Pas...',
    regSuccessTitle: 'Pendaftaran Berjaya Disahkan!',
    regSuccessMsg: 'Pas Kehadiran Digital anda telah sedia. Sila simpan atau tangkap layar (*screenshot*) kod QR ini.',
    regParticipantId: 'ID Peserta Rasmi',
    regAssignedMode: 'Mod Disahkan',
    regDownloadPass: 'Muat Turun Slip Pengesahan',
    regWhatsAppPreview: 'Pratonton Pengesahan WhatsApp',
    regRegisterAnother: 'Daftar Peserta Lain',
    regSlipTitle: 'SLIP PENGESAHAN PENDAFTARAN',
    regQrLockedBadge: 'KOD QR KEHADIRAN (DIAKTIFKAN PADA HARI KELAS)',
    regQrLockedDesc: 'Sila simpan kod QR ini. Imbasan kehadiran hanya akan dibuka pada hari sesi latihan anda bermula.',
    regEventDateLabel: 'Tarikh Sesi Program',
    regConfirmedBadge: 'TEMPAT DISAHKAN',

    checkinCounterTitle: 'Kaunter Imbasan Kehadiran',
    checkinMainTitle: 'Pengesahan Kehadiran Peserta (Check-in)',
    checkinSubtitle: 'Imbas kod QR pada Pas Digital anda atau masukkan No. IC / ID Peserta untuk mengesahkan kehadiran.',
    checkinInstantBadge: 'Pengesahan Serta-merta ke Cloudflare D1',
    checkinInputLabel: 'Nombor IC atau ID Peserta (ASEAN-XXXXX)',
    checkinInputPlaceholder: 'Masukkan No. IC atau ID Peserta...',
    checkinInputHelp: 'Contoh format: 881024-14-5231 atau ASEAN-01234',
    checkinModeLabel: 'Pilih Mod Kehadiran Hari Ini',
    checkinPhysicalBtn: 'Fizikal (Di Dewan)',
    checkinOnlineBtn: 'Dalam Talian (Online)',
    checkinSubmitBtn: 'Sahkan Kehadiran Peserta',
    checkinVerifying: 'Menyemak Pangkalan Data...',
    checkinSuccessTitle: 'Kehadiran Berjaya Direkodkan!',
    checkinAlreadyTitle: 'Peserta Ini Sudah Mendaftar Kehadiran',
    checkinNotFoundTitle: 'Rekod Peserta Tidak Dijumpai',
    checkinSector: 'Sektor',
    checkinRegion: 'Wilayah',
    checkinTime: 'Masa Kehadiran',

    loginTitle: 'Log Masuk Pentadbir',
    loginSubtitle: 'Akses ke Executive Dashboard, Trainer Performance & Registry Peserta.',
    loginEmail: 'Emel Rasmi Pentadbir',
    loginPassword: 'Kata Laluan',
    loginSubmitBtn: 'Log Masuk ke Dashboard',
    loginLoggingIn: 'Mengesahkan...',
    loginNoAccount: 'Belum mempunyai akaun pentadbir?',
    loginCreateAccount: 'Daftar Akaun Admin',
    loginParticipantPrompt: 'Anda peserta latihan?',

    adminRegTitle: 'Daftar Akaun Pentadbir',
    adminRegSubtitle: 'Cipta akaun pegawai atau pentadbir operasi INSKEN.',
    adminRegName: 'Nama Penuh Pegawai',
    adminRegRole: 'Peranan / Jawatan',
    adminRegRoleAdmin: 'Pentadbir (Full Admin Access)',
    adminRegRoleStaff: 'Pegawai Operasi (Staff)',
    adminRegSubmitBtn: 'Daftar & Masuk ke Dashboard',
    adminRegHaveAccount: 'Sudah mempunyai akaun?',

    dashGlobalKpi: 'KPI Global Program',
    dashOfTarget: 'daripada sasaran',
    dashActiveAlerts: 'amaran kritikal',
    dashSystemsHealthy: 'Semua sistem operasi stabil',
    dashLiveDb: 'Pangkalan Data Live',
    dashRegionalProgress: 'Kemajuan Sasaran Mengikut Wilayah',
    dashSectoralBreakdown: 'Pecahan Sektor Perniagaan PMKS',
    dashTrainerPerformance: 'Prestasi & Maklum Balas Jurulatih',
    dashMasterRegistry: 'Pangkalan Data Penuh Peserta',
    dashAlertsSystem: 'Sistem Amaran Automatik',
    dashTotalParticipants: 'Jumlah Pendaftaran',
    dashAttended: 'Kehadiran Selesai',
    dashCapacity: 'Kapasiti',
    dashSearchPlaceholder: 'Cari nama, IC, ID atau emel...',
    dashFilterRegion: 'Semua Wilayah',
    dashFilterStatus: 'Semua Status',
    dashExportCsv: 'Eksport CSV',
    dashName: 'Nama Peserta',
    dashStatus: 'Status Kehadiran',
    dashActions: 'Tindakan',
  },
  en: {
    brandTitle: 'INSKEN Portal',
    brandSub: 'ASEAN MSME A.I. Skills Training Program',
    participantBadge: 'Participant Registration',
    adminBadge: 'Administrator',
    checkinBadge: 'Attendance Counter',
    
    navDashboard: 'Executive Dashboard',
    navTrainers: 'Trainer Performance',
    navRegistry: 'Participant Registry',
    navRegisterAdmin: 'Registration (Admin)',
    navCheckinAdmin: 'Check-in (Admin)',
    navAlreadyRegistered: 'Already Registered?',
    navCheckAttendance: 'Check-in Attendance',
    navNotRegistered: 'New Participant?',
    navRegisterNow: 'Register Now',
    navPublicRegister: 'Registration Portal',
    navPublicCheckin: 'Check-in Portal',
    navLogin: 'Log In',
    navLogout: 'Log Out',
    navRefresh: 'Refresh',
    navAdminAccess: 'Admin Portal',
    navBackToHome: 'Back to Home',

    regOfficialForm: 'Official Registration Form',
    regTitle: 'ASEAN MSME A.I. Training Program Registration',
    regSubtitle: 'Please complete your business details below. A digital QR entry pass will be generated instantly.',
    regIcRoutingBadge: 'Unique IC Verification & Automatic Capacity Routing',
    regFormTitle: 'Participant Details',
    regFormSubtitle: 'Each National IC / Passport is valid for only one registration.',
    regFullName: 'Full Name (As per IC/Passport)',
    regIcNumber: 'National IC / Passport Number',
    regIcPlaceholder: 'e.g. 881024-14-5231 or 881024145231',
    regEmail: 'Business Email Address',
    regPhone: 'Phone Number (WhatsApp)',
    regSector: 'Business Sector',
    regSelectSector: 'Select Business Sector',
    regRegion: 'Training Region / Zone',
    regSelectRegion: 'Select Training Region',
    regPreferredMode: 'Preferred Attendance Mode',
    regPhysicalMode: 'Physical (In-Person)',
    regOnlineMode: 'Online (Interactive Zoom)',
    regPhysicalDesc: 'Subject to regional physical venue seating capacity limits.',
    regOnlineDesc: 'Unlimited access via interactive live online sessions.',
    regCapacityWarning: 'Physical venue is currently full (100% Capacity). You will be automatically routed to Online Mode.',
    regSubmitBtn: 'Submit Registration & Generate QR Pass',
    regSubmitting: 'Validating & Generating Pass...',
    regSuccessTitle: 'Registration Successfully Confirmed!',
    regSuccessMsg: 'Your Digital QR Attendance Pass is ready. Please save or screenshot this pass for event entry.',
    regParticipantId: 'Official Participant ID',
    regAssignedMode: 'Confirmed Mode',
    regDownloadPass: 'Download Confirmation Slip',
    regWhatsAppPreview: 'WhatsApp Confirmation Preview',
    regRegisterAnother: 'Register Another Participant',
    regSlipTitle: 'REGISTRATION CONFIRMATION SLIP',
    regQrLockedBadge: 'ATTENDANCE QR (ACTIVE ON EVENT DAY)',
    regQrLockedDesc: 'Please save this QR code. Attendance scanning will open on your session date.',
    regEventDateLabel: 'Session Date',
    regConfirmedBadge: 'SEAT CONFIRMED',

    checkinCounterTitle: 'Attendance Check-in Desk',
    checkinMainTitle: 'Participant Attendance Check-in',
    checkinSubtitle: 'Scan the QR code on your Digital Pass or enter your IC / Participant ID to confirm attendance.',
    checkinInstantBadge: 'Instant Sync with Cloudflare D1 Database',
    checkinInputLabel: 'National IC or Participant ID (ASEAN-XXXXX)',
    checkinInputPlaceholder: 'Enter IC or Participant ID...',
    checkinInputHelp: 'Example format: 881024-14-5231 or ASEAN-01234',
    checkinModeLabel: 'Today\'s Attendance Mode',
    checkinPhysicalBtn: 'Physical (On-site)',
    checkinOnlineBtn: 'Online (Virtual)',
    checkinSubmitBtn: 'Confirm Participant Attendance',
    checkinVerifying: 'Verifying Registry...',
    checkinSuccessTitle: 'Attendance Successfully Recorded!',
    checkinAlreadyTitle: 'Participant Already Checked In',
    checkinNotFoundTitle: 'Participant Record Not Found',
    checkinSector: 'Sector',
    checkinRegion: 'Region',
    checkinTime: 'Check-in Time',

    loginTitle: 'Admin Log In',
    loginSubtitle: 'Access the Executive Dashboard, Trainer Performance & Participant Registry.',
    loginEmail: 'Official Email Address',
    loginPassword: 'Password',
    loginSubmitBtn: 'Log In to Dashboard',
    loginLoggingIn: 'Authenticating...',
    loginNoAccount: 'Don\'t have an admin account?',
    loginCreateAccount: 'Register Admin Account',
    loginParticipantPrompt: 'Are you a training participant?',

    adminRegTitle: 'Register Admin Account',
    adminRegSubtitle: 'Create an operations officer or admin account for INSKEN.',
    adminRegName: 'Officer Full Name',
    adminRegRole: 'Role / Designation',
    adminRegRoleAdmin: 'Administrator (Full Access)',
    adminRegRoleStaff: 'Operations Staff',
    adminRegSubmitBtn: 'Register & Access Dashboard',
    adminRegHaveAccount: 'Already have an account?',

    dashGlobalKpi: 'Global Program KPI',
    dashOfTarget: 'of target',
    dashActiveAlerts: 'critical alerts',
    dashSystemsHealthy: 'All operations healthy',
    dashLiveDb: 'Live D1 Database',
    dashRegionalProgress: 'Regional Capacity & Progress',
    dashSectoralBreakdown: 'MSME Business Sectors Breakdown',
    dashTrainerPerformance: 'Trainer Performance & Feedback',
    dashMasterRegistry: 'Master Participant Registry',
    dashAlertsSystem: 'Automated Alert System',
    dashTotalParticipants: 'Total Registrations',
    dashAttended: 'Attended',
    dashCapacity: 'Capacity',
    dashSearchPlaceholder: 'Search name, IC, ID or email...',
    dashFilterRegion: 'All Regions',
    dashFilterStatus: 'All Statuses',
    dashExportCsv: 'Export CSV',
    dashName: 'Participant Name',
    dashStatus: 'Status',
    dashActions: 'Actions',
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'ms',
  setLang: () => {},
  t: translations.ms,
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ms');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('insken_lang') as Language;
      if (saved === 'ms' || saved === 'en') {
        setLangState(saved);
      }
    } catch {}
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('insken_lang', newLang);
    } catch {}
  };

  const toggleLang = () => {
    setLang(lang === 'ms' ? 'en' : 'ms');
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang], toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Sleek, touch-friendly bilingual switcher component
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-white/20 bg-white/10 p-0.5 text-xs font-medium text-white shadow-sm',
        className
      )}
      role="group"
      aria-label="Language Toggle"
    >
      <button
        type="button"
        onClick={() => setLang('ms')}
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1 transition-all min-h-[28px]',
          lang === 'ms'
            ? 'bg-[#D4A017] font-bold text-[#0B1F3A] shadow-sm'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        )}
      >
        <span className="text-xs">🇲🇾</span>
        <span>BM</span>
      </button>

      <button
        type="button"
        onClick={() => setLang('en')}
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1 transition-all min-h-[28px]',
          lang === 'en'
            ? 'bg-[#D4A017] font-bold text-[#0B1F3A] shadow-sm'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        )}
      >
        <span className="text-xs">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
}

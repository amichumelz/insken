'use client';

import React, { createContext, useContext } from 'react';

export type Language = 'en';

export interface Translations {
  // Brand & General
  brandTitle: string;
  brandSub: string;
  participantBadge: string;
  adminBadge: string;
  checkinBadge: string;
  
  // Navigation & Actions
  navDashboard: string;
  navSchedules: string;
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
  en: {
    brandTitle: 'INSKEN Portal',
    brandSub: 'ASEAN MSMEs AI Skills Training Programme',
    participantBadge: 'Participant Registration',
    adminBadge: 'Administrator',
    checkinBadge: 'Attendance Check-in',
    
    navDashboard: 'Executive Dashboard',
    navSchedules: 'Session & Coach Management',
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
    regTitle: 'ASEAN MSMEs AI Skills Training Programme Registration',
    regSubtitle: 'Please complete your enterprise details below. A digital QR attendance pass will be generated instantly.',
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
    regPhysicalMode: 'Physical (Hall)',
    regOnlineMode: 'Online (Interactive Virtual)',
    regPhysicalDesc: 'Subject to regional physical venue seating capacity limits.',
    regOnlineDesc: 'Unlimited access via interactive live online sessions.',
    regCapacityWarning: 'Physical venue is currently full (100% Capacity). You will be automatically routed to Online Mode.',
    regSubmitBtn: 'Submit Registration & Generate Digital Pass',
    regSubmitting: 'Validating & Generating Pass...',
    regSuccessTitle: 'Registration Successfully Confirmed!',
    regSuccessMsg: 'Your Official Digital QR Attendance Pass is ready. Please save or screenshot this pass for event entry.',
    regParticipantId: 'Official Participant ID',
    regAssignedMode: 'Confirmed Mode',
    regDownloadPass: 'Download Confirmation Slip',
    regWhatsAppPreview: 'WhatsApp Confirmation Preview',
    regRegisterAnother: 'Register Another Participant',
    regSlipTitle: 'REGISTRATION CONFIRMATION SLIP',
    regQrLockedBadge: 'OFFICIAL ATTENDANCE PASS',
    regQrLockedDesc: 'Please save this QR pass. Present this QR code or scan to confirm your attendance.',
    regEventDateLabel: 'Session Date',
    regConfirmedBadge: 'SEAT CONFIRMED',

    checkinCounterTitle: 'Attendance Check-in Desk',
    checkinMainTitle: 'Participant Attendance Check-in',
    checkinSubtitle: 'Scan the on-screen QR code or enter your IC / Participant ID to confirm attendance.',
    checkinInstantBadge: 'Instant Sync with Cloudflare Database',
    checkinInputLabel: 'National IC or Participant ID (e.g. ASEAN-00001)',
    checkinInputPlaceholder: 'Enter IC or Participant ID...',
    checkinInputHelp: 'Example format: 881024-14-5231 or ASEAN-00001',
    checkinModeLabel: 'Today\'s Attendance Mode',
    checkinPhysicalBtn: 'Physical (Hall)',
    checkinOnlineBtn: 'Online (Virtual)',
    checkinSubmitBtn: 'Confirm Attendance Now',
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

    dashGlobalKpi: 'Global Programme KPI',
    dashOfTarget: 'of target',
    dashActiveAlerts: 'critical alerts',
    dashSystemsHealthy: 'All systems operational',
    dashLiveDb: 'Live DB',
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
  lang: 'en',
  setLang: () => {},
  t: translations.en,
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang: Language = 'en';
  const setLang = () => {};
  const toggleLang = () => {};

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations.en, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageToggle({ className }: { className?: string }) {
  return null;
}

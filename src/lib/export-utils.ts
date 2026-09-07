import { StatsResponse, Trainer, Participant, SectorStat, RegionStat, TrendPoint, LiveCheckinsResponse } from '@/lib/types';

/**
 * Trigger a browser download of CSV text with UTF-8 BOM for proper Excel compatibility.
 */
export function downloadCsv(filename: string, csvContent: string) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * 1. Export Comprehensive Executive Dashboard Report (Multi-Section CSV)
 */
export function exportExecutiveDashboardCsv(stats: StatsResponse, liveAttendance?: LiveCheckinsResponse | null) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nowFormatted = new Date().toLocaleString('en-MY');

  let csv = `ASEAN MSMEs AI Skills Training Programme — Executive Dashboard Report\n`;
  csv += `Generated On:,"${nowFormatted}"\n\n`;

  // SECTION 1: GLOBAL KPI SUMMARY
  csv += `=== GLOBAL PROGRAMME OVERVIEW ===\n`;
  csv += `Metric,Value\n`;
  csv += `Total Registered Participants,${stats.global.total}\n`;
  csv += `Global Target Participants,${stats.global.target}\n`;
  csv += `Progress to Target (%),${stats.global.pct}%\n`;
  csv += `Total Attended Participants,${stats.global.attended}\n`;
  csv += `Attended Physical (Hall),${stats.global.attendedPhysical}\n`;
  csv += `Attended Online (Virtual),${stats.global.attendedOnline}\n`;
  csv += `Registered Physical Mode,${stats.global.registeredPhysical}\n`;
  csv += `Registered Online Mode,${stats.global.registeredOnline}\n`;
  csv += `Duplicate IC Attempts Blocked,${stats.global.duplicateBlocked}\n\n`;

  // SECTION 2: REGIONAL PROGRESS BREAKDOWN
  csv += `=== REGIONAL CAPACITY & PROGRESS ===\n`;
  csv += `Region Code,Region Name,Physical Attended,Online Attended,Total Attended,Total Registered,Physical Capacity,Online Target,Physical Capacity Used (%),Status\n`;
  for (const r of stats.regions) {
    csv += [
      escapeCsvCell(r.code),
      escapeCsvCell(r.name),
      r.attendedPhysical,
      r.attendedOnline,
      r.attended,
      r.total,
      r.physicalCap,
      r.onlineTarget,
      `${r.physicalPct}%`,
      escapeCsvCell(r.state),
    ].join(',') + '\n';
  }
  csv += '\n';

  // SECTION 3: MSME SECTORAL BREAKDOWN
  csv += `=== MSME BUSINESS SECTORAL DISTRIBUTION ===\n`;
  csv += `Sector,Participant Count,Share of Total (%)\n`;
  for (const s of stats.sectors) {
    csv += [
      escapeCsvCell(s.sector),
      s.count,
      `${s.pct}%`,
    ].join(',') + '\n';
  }
  csv += '\n';

  // SECTION 4: HOURLY ATTENDANCE VELOCITY (IF AVAILABLE)
  if (liveAttendance?.velocity && liveAttendance.velocity.length > 0) {
    csv += `=== HOURLY ATTENDANCE VELOCITY (PAST 24 HOURS) ===\n`;
    csv += `Hour,Physical Attendance,Online Attendance,Total Attendance\n`;
    for (const v of liveAttendance.velocity) {
      csv += [
        escapeCsvCell(v.hour),
        v.physical,
        v.online,
        v.total,
      ].join(',') + '\n';
    }
    csv += '\n';
  }

  downloadCsv(`INSKEN_Executive_Report_${timestamp}.csv`, csv);
}

/**
 * 2. Export Trainer Performance & Evaluation Report
 */
export function exportTrainerPerformanceCsv(trainer: Trainer) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nowFormatted = new Date().toLocaleString('en-MY');

  let csv = `ASEAN MSMEs AI Skills Training Programme — Trainer Performance Report\n`;
  csv += `Trainer Name:,"${trainer.name}"\n`;
  csv += `Role:,"${trainer.role}"\n`;
  csv += `Specialty:,"${trainer.specialty}"\n`;
  csv += `Report Date:,"${nowFormatted}"\n\n`;

  // SECTION 1: TRAINER KPIS
  csv += `=== TRAINER PERFORMANCE KPIS ===\n`;
  csv += `Metric,Value\n`;
  csv += `Sessions Conducted,${trainer.kpi.sessionsConducted}\n`;
  csv += `Total Participants Trained,${trainer.kpi.totalParticipants}\n`;
  csv += `Attendance Rate (%),${trainer.kpi.attendanceRate}%\n`;
  csv += `Completion Rate (%),${trainer.kpi.completionRate}%\n`;
  csv += `Average Rating (out of 5),${trainer.kpi.avgRating}\n\n`;

  // SECTION 2: 12-MONTH PERFORMANCE TREND
  csv += `=== 12-MONTH PERFORMANCE TREND ===\n`;
  csv += `Month,Sessions Conducted,Attendance Rate (%),Rating\n`;
  for (const p of trainer.performance) {
    csv += [
      escapeCsvCell(p.month),
      p.sessions,
      `${p.attendance}%`,
      p.rating,
    ].join(',') + '\n';
  }
  csv += '\n';

  // SECTION 3: PARTICIPANT TESTIMONIES
  const allTestimonies = [...trainer.postFeedback, ...trainer.preFeedback];
  csv += `=== PARTICIPANT TESTIMONIALS ===\n`;
  csv += `Participant ID,Participant Name,Session,Rating (out of 5),Comment,Submitted At\n`;
  for (const f of allTestimonies) {
    csv += [
      escapeCsvCell(f.participantId),
      escapeCsvCell(f.participantName),
      escapeCsvCell(f.session),
      f.rating,
      escapeCsvCell(f.comment),
      escapeCsvCell(f.submittedAt),
    ].join(',') + '\n';
  }

  const cleanName = trainer.name.replace(/[^a-zA-Z0-9]/g, '_');
  downloadCsv(`Trainer_Report_${cleanName}_${timestamp}.csv`, csv);
}

/**
 * 3. Export Master Participant Registry CSV
 */
export function exportParticipantRegistryCsv(participants: Participant[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nowFormatted = new Date().toLocaleString('en-MY');

  let csv = `ASEAN MSMEs AI Skills Training Programme — Master Participant Registry\n`;
  csv += `Generated On:,"${nowFormatted}"\n`;
  csv += `Total Records Exported:,${participants.length}\n\n`;

  csv += `Participant ID,Full Name,National IC / Passport,Business Sector,Training Region,Preferred Mode,Final Mode,Status,Registered Date,Check-in Date\n`;

  for (const p of participants) {
    const regDate = p.createdAt
      ? new Date(p.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';
    const checkinDate = p.checkInAt
      ? new Date(p.checkInAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : '—';

    csv += [
      escapeCsvCell(p.participantId),
      escapeCsvCell(p.name),
      escapeCsvCell(p.icNumber),
      escapeCsvCell(p.sector),
      escapeCsvCell(p.region),
      escapeCsvCell(p.preferredMode),
      escapeCsvCell(p.finalMode.replace('Registered_', '')),
      escapeCsvCell(p.status.replace(/_/g, ' ')),
      escapeCsvCell(regDate),
      escapeCsvCell(checkinDate),
    ].join(',') + '\n';
  }

  downloadCsv(`Participant_Registry_Report_${timestamp}.csv`, csv);
}

/**
 * 4. Export Daily Registration Trend CSV
 */
export function exportDailyRegistrationCsv(trend: TrendPoint[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const total = trend.reduce((s, t) => s + t.total, 0);

  let csv = `ASEAN MSMEs AI Skills Training Programme — Daily Registration Trend\n`;
  csv += `Total Registrations:,${total}\n\n`;
  csv += `Date / Day,Physical (Hall),Online (Virtual),Total Registrations\n`;

  for (const t of trend) {
    csv += [
      escapeCsvCell(t.day || t.month),
      t.physical,
      t.online,
      t.total,
    ].join(',') + '\n';
  }

  downloadCsv(`Daily_Registration_Report_${timestamp}.csv`, csv);
}

/**
 * 5. Export Sectoral Breakdown CSV
 */
export function exportSectoralBreakdownCsv(sectors: SectorStat[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  let csv = `ASEAN MSMEs AI Skills Training Programme — Sectoral Distribution Report\n\n`;
  csv += `Business Sector,Total Participants,Share (%)\n`;

  for (const s of sectors) {
    csv += [
      escapeCsvCell(s.sector),
      s.count,
      `${s.pct}%`,
    ].join(',') + '\n';
  }

  downloadCsv(`MSME_Sectoral_Report_${timestamp}.csv`, csv);
}

/**
 * 6. Export Regional Capacity & Attendance Report CSV
 */
export function exportRegionalProgressCsv(regions: RegionStat[]) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  let csv = `ASEAN MSMEs AI Skills Training Programme — Regional Capacity & Attendance Report\n\n`;
  csv += `Region Code,Region Name,Physical Attended,Online Attended,Total Attended,Total Registered,Physical Capacity,Online Target,Physical Capacity Used (%),State\n`;

  for (const r of regions) {
    csv += [
      escapeCsvCell(r.code),
      escapeCsvCell(r.name),
      r.attendedPhysical,
      r.attendedOnline,
      r.attended,
      r.total,
      r.physicalCap,
      r.onlineTarget,
      `${r.physicalPct}%`,
      escapeCsvCell(r.state),
    ].join(',') + '\n';
  }

  downloadCsv(`Regional_Attendance_Report_${timestamp}.csv`, csv);
}

/**
 * 7. Export Finance & Milestone Payment Tracking Report CSV
 */
export function exportFinanceMilestonesCsv(
  overview: any,
  programmes: any[],
  internalDepts: any[],
  milestones: any[]
) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const nowFormatted = new Date().toLocaleString('en-MY');

  let csv = `INSKEN — Finance Tracking & Programme Milestone Payment Audit Report\n`;
  csv += `Generated On:,"${nowFormatted}"\n\n`;

  // SECTION 1: FINANCIAL OVERVIEW
  csv += `=== FINANCIAL OVERVIEW ===\n`;
  csv += `Metric,Amount (RM) / Value\n`;
  csv += `Total Project Costs,${overview.totalCosts?.toLocaleString('en-US') || 0}\n`;
  csv += `Net Profit,${overview.netProfit?.toLocaleString('en-US') || 0}\n`;
  csv += `Profit Margin,${overview.profitMarginPct || 0}%\n`;
  csv += `Total DE Allocation,${overview.deAllocationTotal?.toLocaleString('en-US') || 0}\n`;
  csv += `Total DE Utilized,${overview.deUtilizedTotal?.toLocaleString('en-US') || 0}\n`;
  csv += `Total DE Remaining,${overview.deRemainingTotal?.toLocaleString('en-US') || 0}\n`;
  csv += `Total Internal Allocation,${overview.internalAllocationTotal?.toLocaleString('en-US') || 0}\n`;
  csv += `Total Milestones Billed / Claimed,${overview.totalClaimAmount?.toLocaleString('en-US') || 0}\n`;
  csv += `Total Amount Paid to INSKEN,${overview.totalPaidAmount?.toLocaleString('en-US') || 0}\n`;
  csv += `Total Outstanding Payment,${overview.totalOutstandingAmount?.toLocaleString('en-US') || 0}\n\n`;

  // SECTION 2: PROGRAMME ALLOCATION BREAKDOWN (DE)
  csv += `=== PROGRAMME BUDGET ALLOCATION (DE ALLOCATION) ===\n`;
  csv += `Programme,Allocation (RM),Utilized (RM),Committed (RM),Variance (RM)\n`;
  for (const p of programmes) {
    csv += [
      escapeCsvCell(p.name),
      p.allocation,
      p.utilized,
      p.committed,
      p.variance,
    ].join(',') + '\n';
  }
  csv += '\n';

  // SECTION 3: INTERNAL DEPARTMENT ALLOCATION
  csv += `=== INTERNAL DEPARTMENT ALLOCATION ===\n`;
  csv += `Department,Allocation (RM),Utilized (RM),Committed (RM),Variance (RM)\n`;
  for (const d of internalDepts) {
    csv += [
      escapeCsvCell(d.name),
      d.allocation,
      d.utilized,
      d.committed,
      d.variance,
    ].join(',') + '\n';
  }
  csv += '\n';

  // SECTION 4: MILESTONE & PAYMENT SCHEDULE (BAYARAN INSKEN)
  csv += `=== MILESTONE DELIVERABLES & PAYMENT AUDIT (INSKEN) ===\n`;
  csv += `Milestone #,Title,Deliverables & Scope,Target Due Date,Invoice No.,Claim Amount (RM),Amount Paid (RM),Outstanding (RM),Milestone Status,Payment Status,Payment Date,Recipient,Notes\n`;
  for (const m of milestones) {
    csv += [
      escapeCsvCell(m.milestoneNumber),
      escapeCsvCell(m.title),
      escapeCsvCell(m.deliverable),
      escapeCsvCell(m.dueDate),
      escapeCsvCell(m.invoiceNo),
      m.claimAmount,
      m.amountPaid,
      m.outstanding,
      escapeCsvCell(m.milestoneStatus),
      escapeCsvCell(m.paymentStatus),
      escapeCsvCell(m.paymentDate || '—'),
      escapeCsvCell(m.recipient || 'INSKEN'),
      escapeCsvCell(m.notes || ''),
    ].join(',') + '\n';
  }

  downloadCsv(`INSKEN_Finance_Milestones_Report_${timestamp}.csv`, csv);
}


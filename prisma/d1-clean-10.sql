-- 1. Remove specific participants (Umar, Fatin, ASEAN-02063, ASEAN-02064, ASEAN-02065)
DELETE FROM Participant WHERE participantId IN ('ASEAN-02063', 'ASEAN-02064', 'ASEAN-02065');
DELETE FROM Participant WHERE LOWER(name) LIKE '%umar%' OR LOWER(name) LIKE '%fatin%';
DELETE FROM Participant WHERE icNumber IN ('040222140768', '040221140768');

-- 2. Clear out excess data and insert exactly 10 clean baseline records
DELETE FROM Participant;

INSERT OR REPLACE INTO Participant (id, participantId, icNumber, name, email, phone, sector, region, preferredMode, finalMode, status, checkInAt, createdAt, updatedAt) VALUES
('p-01', 'ASEAN-00001', '880115-14-5521', 'Ahmad Farhan bin Rosli', 'farhan.rosli@msme.my', '+60123456701', 'Retail', 'KL', 'Physical', 'Registered_Physical', 'Attended_Physical', '2026-09-02 08:30:00', '2026-08-20 10:00:00', '2026-09-02 08:30:00'),
('p-02', 'ASEAN-00002', '910322-01-6644', 'Nur Aisyah binti Zakaria', 'aisyah.z@msme.my', '+60123456702', 'Food & Beverage', 'JHR', 'Online', 'Registered_Online', 'Attended_Online', '2026-09-02 08:45:00', '2026-08-21 11:15:00', '2026-09-02 08:45:00'),
('p-03', 'ASEAN-00003', '850711-07-5123', 'Tan Wei Loon', 'weiloon.tan@msme.my', '+60123456703', 'Manufacturing', 'PNG', 'Physical', 'Registered_Physical', 'Registered_Physical', NULL, '2026-08-22 09:30:00', '2026-08-22 09:30:00'),
('p-04', 'ASEAN-00004', '931205-12-5890', 'Mohd Danial bin Yusof', 'danial.y@msme.my', '+60123456704', 'Professional Services', 'SBH', 'Physical', 'Registered_Physical', 'Attended_Physical', '2026-09-02 09:10:00', '2026-08-23 14:20:00', '2026-09-02 09:10:00'),
('p-05', 'ASEAN-00005', '890418-13-5012', 'Grace Ting Sie Ping', 'grace.ting@msme.my', '+60123456705', 'Agriculture', 'SWK', 'Online', 'Registered_Online', 'Registered_Online', NULL, '2026-08-24 16:40:00', '2026-08-24 16:40:00'),
('p-06', 'ASEAN-00006', '940809-10-5341', 'Priya a/p Subramaniam', 'priya.s@msme.my', '+60123456706', 'Retail', 'KL', 'Physical', 'Registered_Physical', 'Registered_Physical', NULL, '2026-08-25 10:10:00', '2026-08-25 10:10:00'),
('p-07', 'ASEAN-00007', '900214-01-5788', 'Hafiz bin Mansor', 'hafiz.m@msme.my', '+60123456707', 'Food & Beverage', 'JHR', 'Physical', 'Registered_Physical', 'Attended_Physical', '2026-09-02 09:40:00', '2026-08-26 13:00:00', '2026-09-02 09:40:00'),
('p-08', 'ASEAN-00008', '870930-08-5911', 'Lim Chee Keong', 'cheekeong.lim@msme.my', '+60123456708', 'Tech & Digital', 'PNG', 'Online', 'Registered_Online', 'Attended_Online', '2026-09-02 10:05:00', '2026-08-27 15:30:00', '2026-09-02 10:05:00'),
('p-09', 'ASEAN-00009', '950619-12-6102', 'Siti Hajar binti Ibrahim', 'hajar.i@msme.my', '+60123456709', 'Agriculture', 'SBH', 'Online', 'Registered_Online', 'Registered_Online', NULL, '2026-08-28 11:20:00', '2026-08-28 11:20:00'),
('p-10', 'ASEAN-00010', '920311-13-5490', 'Brandon Anak Walter', 'brandon.w@msme.my', '+60123456710', 'Professional Services', 'SWK', 'Physical', 'Registered_Physical', 'Registered_Physical', NULL, '2026-08-29 17:00:00', '2026-08-29 17:00:00');

-- 3. Clean audit log
DELETE FROM AuditLog WHERE LOWER(participant) LIKE '%umar%' OR LOWER(participant) LIKE '%fatin%' OR icNumber IN ('040222140768', '040221140768');

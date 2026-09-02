DELETE FROM "Participant" WHERE LOWER(name) LIKE '%fatin%' OR participantId = 'ASEAN-02063';
DELETE FROM "AuditLog" WHERE LOWER(participant) LIKE '%fatin%' OR LOWER(detail) LIKE '%fatin%';

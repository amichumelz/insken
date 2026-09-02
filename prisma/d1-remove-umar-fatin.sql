DELETE FROM "Participant" WHERE LOWER(name) LIKE '%umar%' OR LOWER(name) LIKE '%fatin%' OR LOWER(email) LIKE '%umar%' OR LOWER(email) LIKE '%fatin%';
DELETE FROM "AuditLog" WHERE LOWER(participant) LIKE '%umar%' OR LOWER(participant) LIKE '%fatin%' OR LOWER(detail) LIKE '%umar%' OR LOWER(detail) LIKE '%fatin%';
DELETE FROM "User" WHERE LOWER(name) LIKE '%umar%' OR LOWER(name) LIKE '%fatin%' OR LOWER(email) LIKE '%umar%' OR LOWER(email) LIKE '%fatin%';

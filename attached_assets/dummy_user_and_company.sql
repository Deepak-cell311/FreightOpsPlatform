-- Dummy company insert
INSERT INTO companies (
  id, name, email, isactive, createdat, updatedat
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Dummy Company',
  'company@example.com',
  true,
  NOW(),
  NOW()
);

-- Dummy user insert (password: password123, bcrypt hash)
INSERT INTO users (
  id, email, password, companyid, firstname, lastname, phone, role, isactive, createdat, updatedat
) VALUES (
  'user-001',
  'dummyuser@example.com',
  '$2b$10$u1Q6Qn6QwQwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw',
  '11111111-1111-1111-1111-111111111111',
  'Dummy',
  'User',
  '1234567890',
  'admin',
  true,
  NOW(),
  NOW()
);

-- Note: Replace the password hash with your actual hash if you use a different password or hashing rounds. 
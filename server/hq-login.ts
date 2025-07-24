import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

const router = Router();

// HQ Login endpoint using unified authentication with platform_owner role
router.post('/hq/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user with platform_owner role in unified database
    const user = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const foundUser = user[0];

    // Check if user has platform_owner role
    if (foundUser.role !== 'platform_owner') {
      return res.status(403).json({ error: 'Access denied. Platform owner access required.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, foundUser.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Store user in session (unified authentication)
    req.session.user = {
      id: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName
    };

    res.json({
      success: true,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName
      }
    });

  } catch (error) {
    console.error('HQ login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
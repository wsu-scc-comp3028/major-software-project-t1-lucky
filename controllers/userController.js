// controllers/userController.js
import db from '../config/memoryDb.js';
import bcrypt from 'bcryptjs';

export async function register(req, res) {
  try {
    const { name, email, password, skills } = req.body;
    
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.createUser({
      name,
      email,
      password: hashedPassword,
      skills: skills || []
    });
    
    req.session.userId = user.id;
    req.session.user = user;
    
    // Don't send password back
    delete user.password;
    
    res.json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    req.session.userId = user.id;
    req.session.user = user;
    
    // Don't send password back
    delete user.password;
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function logout(req, res) {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function getProfile(req, res) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const user = await db.findUserById(req.session.userId);
    const savedOpportunities = await db.getUserSavedOpportunities(req.session.userId);
    const applications = await db.getUserApplications(req.session.userId);
    
    // Don't send password back
    delete user.password;
    
    res.json({ 
      success: true, 
      data: { 
        user,
        savedOpportunities,
        applications
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function updateSkills(req, res) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    const { skills } = req.body;
    const user = await db.updateUserSkills(req.session.userId, skills);
    
    req.session.user = user;
    delete user.password;
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
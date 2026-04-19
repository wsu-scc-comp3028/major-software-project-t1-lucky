import db from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
    static async findByEmail(email) {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0];
    }
    
    static async findById(id) {
        const result = await db.query('SELECT id, name, email, skills, created_at FROM users WHERE id = $1', [id]);
        return result.rows[0];
    }
    
    static async create(userData) {
        const { name, email, password, skills } = userData;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await db.query(
            'INSERT INTO users (name, email, password, skills) VALUES ($1, $2, $3, $4) RETURNING id, name, email, skills',
            [name, email, hashedPassword, skills || []]
        );
        return result.rows[0];
    }
    
    static async validatePassword(email, password) {
        const user = await this.findByEmail(email);
        if (!user) return null;
        
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;
        
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    
    static async updateSkills(userId, skills) {
        const result = await db.query(
            'UPDATE users SET skills = $1 WHERE id = $2 RETURNING id, name, email, skills',
            [skills, userId]
        );
        return result.rows[0];
    }
    
    static async saveOpportunity(userId, opportunityId) {
        await db.query(
            'INSERT INTO saved_opportunities (user_id, opportunity_id) VALUES ($1, $2) ON CONFLICT (user_id, opportunity_id) DO NOTHING',
            [userId, opportunityId]
        );
    }
    
    static async getSavedOpportunities(userId) {
        const result = await db.query(
            `SELECT o.* FROM opportunities o 
             JOIN saved_opportunities s ON o.id = s.opportunity_id 
             WHERE s.user_id = $1`,
            [userId]
        );
        return result.rows;
    }
    
    static async getApplications(userId) {
        const result = await db.query(
            `SELECT o.*, a.status, a.applied_at FROM opportunities o 
             JOIN applications a ON o.id = a.opportunity_id 
             WHERE a.user_id = $1`,
            [userId]
        );
        return result.rows;
    }
}

export default User;
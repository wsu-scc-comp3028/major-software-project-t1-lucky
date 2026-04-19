import db from '../config/database.js';

class Opportunity {
    static async findAll(filters = {}) {
        let query = 'SELECT * FROM opportunities WHERE 1=1';
        const values = [];
        let paramCount = 1;
        
        if (filters.type && filters.type !== 'all') {
            query += ` AND type = $${paramCount}`;
            values.push(filters.type);
            paramCount++;
        }
        
        if (filters.location && filters.location !== 'all') {
            query += ` AND location = $${paramCount}`;
            values.push(filters.location);
            paramCount++;
        }
        
        if (filters.search) {
            query += ` AND (title ILIKE $${paramCount} OR company ILIKE $${paramCount})`;
            values.push(`%${filters.search}%`);
            paramCount++;
        }
        
        query += ' ORDER BY match_score DESC';
        
        const result = await db.query(query, values);
        return result.rows;
    }
    
    static async findById(id) {
        const result = await db.query('SELECT * FROM opportunities WHERE id = $1', [id]);
        return result.rows[0];
    }
    
    static async updateMatchScore(id, userSkills) {
        const opportunity = await this.findById(id);
        if (!opportunity) return 0;
        
        const oppSkills = opportunity.skills || [];
        const matchingSkills = oppSkills.filter(skill => 
            userSkills.some(us => us.toLowerCase() === skill.toLowerCase())
        );
        
        const matchScore = oppSkills.length > 0 
            ? Math.round((matchingSkills.length / oppSkills.length) * 100)
            : 0;
        
        await db.query('UPDATE opportunities SET match_score = $1 WHERE id = $2', [matchScore, id]);
        return matchScore;
    }
}

export default Opportunity;
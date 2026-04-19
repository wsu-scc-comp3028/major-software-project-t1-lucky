// config/memoryDb.js - In-memory database for development
// Use this temporarily until PostgreSQL is set up

// In-memory storage
const users = [];
const opportunities = [];
const applications = [];
const savedOpportunities = [];

// Sample opportunities data
const sampleOpportunities = [
    {
        id: 1,
        title: "Software Engineering Intern",
        company: "Google",
        type: "internship",
        location: "remote",
        skills: ["Python", "Java", "SQL"],
        deadline: "2026-05-15",
        salary: "$45/hr",
        description: "Join Google's engineering team to work on next-gen products.",
        match_score: 85,
        created_at: new Date()
    },
    {
        id: 2,
        title: "Data Science Workshop Series",
        company: "Coursera",
        type: "workshop",
        location: "remote",
        skills: ["Machine Learning", "Python", "Statistics"],
        deadline: "2026-05-20",
        salary: "Free",
        description: "Master data science with hands-on projects.",
        match_score: 88,
        created_at: new Date()
    },
    {
        id: 3,
        title: "Frontend Developer",
        company: "Stripe",
        type: "job",
        location: "hybrid",
        skills: ["React", "TypeScript", "CSS"],
        deadline: "2026-05-30",
        salary: "$120k/year",
        description: "Build amazing user experiences for millions of users.",
        match_score: 92,
        created_at: new Date()
    },
    {
        id: 4,
        title: "Tech Mentorship Program",
        company: "Alumni Network",
        type: "mentoring",
        location: "remote",
        skills: ["Leadership", "Communication", "Problem Solving"],
        deadline: "2026-06-01",
        salary: "Free",
        description: "Get 1-on-1 guidance from industry experts.",
        match_score: 85,
        created_at: new Date()
    },
    {
        id: 5,
        title: "AI/ML Research Intern",
        company: "OpenAI",
        type: "internship",
        location: "onsite",
        skills: ["PyTorch", "Deep Learning", "NLP"],
        deadline: "2026-05-10",
        salary: "$60/hr",
        description: "Work on cutting-edge AI research.",
        match_score: 78,
        created_at: new Date()
    },
    {
        id: 6,
        title: "Networking Event",
        company: "Tech Connect",
        type: "event",
        location: "hybrid",
        skills: ["Networking", "Communication"],
        deadline: "2026-05-25",
        salary: "$10",
        description: "Connect with top tech recruiters.",
        match_score: 82,
        created_at: new Date()
    }
];

// Initialize with sample data
sampleOpportunities.forEach(opp => opportunities.push(opp));

// Database interface
const db = {
    // User methods
    async createUser(userData) {
        const user = {
            id: users.length + 1,
            ...userData,
            created_at: new Date()
        };
        users.push(user);
        return user;
    },
    
    async findUserByEmail(email) {
        return users.find(u => u.email === email);
    },
    
    async findUserById(id) {
        return users.find(u => u.id === parseInt(id));
    },
    
    async updateUserSkills(userId, skills) {
        const user = await this.findUserById(userId);
        if (user) {
            user.skills = skills;
            return user;
        }
        return null;
    },
    
    // Opportunity methods
    async findAllOpportunities(filters = {}) {
        let filtered = [...opportunities];
        
        if (filters.type && filters.type !== 'all') {
            filtered = filtered.filter(opp => opp.type === filters.type);
        }
        
        if (filters.location && filters.location !== 'all') {
            filtered = filtered.filter(opp => opp.location === filters.location);
        }
        
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(opp => 
                opp.title.toLowerCase().includes(searchLower) || 
                opp.company.toLowerCase().includes(searchLower) ||
                opp.skills.some(s => s.toLowerCase().includes(searchLower))
            );
        }
        
        return filtered.sort((a, b) => b.match_score - a.match_score);
    },
    
    async findOpportunityById(id) {
        return opportunities.find(opp => opp.id === parseInt(id));
    },
    
    async updateOpportunityMatchScore(id, userSkills) {
        const opp = await this.findOpportunityById(id);
        if (!opp) return 0;
        
        const matchingSkills = opp.skills.filter(skill => 
            userSkills.some(us => us.toLowerCase() === skill.toLowerCase())
        );
        
        const matchScore = Math.round((matchingSkills.length / opp.skills.length) * 100);
        opp.match_score = matchScore;
        return matchScore;
    },
    
    // Application methods
    async createApplication(userId, opportunityId) {
        const existing = applications.find(a => a.user_id === userId && a.opportunity_id === opportunityId);
        if (existing) return existing;
        
        const application = {
            id: applications.length + 1,
            user_id: userId,
            opportunity_id: opportunityId,
            status: 'pending',
            applied_at: new Date()
        };
        applications.push(application);
        return application;
    },
    
    async getUserApplications(userId) {
        const userApps = applications.filter(a => a.user_id === userId);
        return userApps.map(app => {
            const opp = opportunities.find(o => o.id === app.opportunity_id);
            return { ...app, opportunity: opp };
        });
    },
    
    // Saved opportunities
    async saveOpportunity(userId, opportunityId) {
        const existing = savedOpportunities.find(s => s.user_id === userId && s.opportunity_id === opportunityId);
        if (existing) return existing;
        
        const saved = {
            user_id: userId,
            opportunity_id: opportunityId,
            saved_at: new Date()
        };
        savedOpportunities.push(saved);
        return saved;
    },
    
    async getUserSavedOpportunities(userId) {
        const userSaved = savedOpportunities.filter(s => s.user_id === userId);
        return userSaved.map(save => {
            const opp = opportunities.find(o => o.id === save.opportunity_id);
            return opp;
        }).filter(opp => opp);
    },
    
    // Query method for compatibility with PostgreSQL version
    async query(text, params) {
        // This is a simplified version for the in-memory DB
        console.log('Query executed:', text, params);
        return { rows: [] };
    }
};

export default db;
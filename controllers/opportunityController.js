// controllers/opportunityController.js
import db from '../config/memoryDb.js';

export async function getAllOpportunities(req, res) {
  try {
    const filters = {
      type: req.query.type,
      location: req.query.location,
      search: req.query.search
    };
    
    let opportunities = await db.findAllOpportunities(filters);
    
    // Update match scores if user is logged in
    if (req.session?.userId) {
      const user = await db.findUserById(req.session.userId);
      if (user && user.skills) {
        for (let opp of opportunities) {
          opp.match_score = await db.updateOpportunityMatchScore(opp.id, user.skills);
        }
        opportunities.sort((a, b) => b.match_score - a.match_score);
      }
    }
    
    res.json({ success: true, data: opportunities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function getOpportunityById(req, res) {
  try {
    const opportunity = await db.findOpportunityById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ success: false, error: 'Opportunity not found' });
    }
    res.json({ success: true, data: opportunity });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function applyToOpportunity(req, res) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ success: false, error: 'Please login to apply' });
    }
    
    await db.createApplication(req.session.userId, req.params.id);
    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

export async function saveOpportunity(req, res) {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ success: false, error: 'Please login to save' });
    }
    
    await db.saveOpportunity(req.session.userId, req.params.id);
    res.json({ success: true, message: 'Opportunity saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
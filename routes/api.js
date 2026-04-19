// routes/api.js
import express from 'express';
import * as opportunityController from '../controllers/opportunityController.js';
import * as userController from '../controllers/userController.js';

export const apiRouter = express.Router();

// Test route
apiRouter.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Opportunity routes
apiRouter.get('/opportunities', opportunityController.getAllOpportunities);
apiRouter.get('/opportunities/:id', opportunityController.getOpportunityById);
apiRouter.post('/opportunities/:id/apply', opportunityController.applyToOpportunity);
apiRouter.post('/opportunities/:id/save', opportunityController.saveOpportunity);

// Auth routes
apiRouter.post('/auth/register', userController.register);
apiRouter.post('/auth/login', userController.login);
apiRouter.post('/auth/logout', userController.logout);
apiRouter.get('/profile', userController.getProfile);
apiRouter.put('/profile/skills', userController.updateSkills);
// routes/home.js
import express from 'express';

export const homeRouter = express.Router();

// Home page
homeRouter.get('/', (req, res) => {
  res.render('home', { 
    title: 'CareerLaunch - Your Professional Development Journey',
    user: req.session?.user || null
  });
});

// Dashboard page
homeRouter.get('/dashboard', (req, res) => {
  if (!req.session?.userId) {
    return res.redirect('/');
  }
  res.render('dashboard', { 
    title: 'Dashboard - CareerLaunch',
    user: req.session.user
  });
});
import express from 'express';

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
    res.render('index', { 
        title: 'CareerLaunch',
        user: req.session.userId ? { 
            id: req.session.userId, 
            email: req.session.userEmail 
        } : null 
    });
});

router.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/');
    }
    res.render('dashboard', { 
        title: 'Dashboard',
        user: { 
            id: req.session.userId, 
            email: req.session.userEmail 
        } 
    });
});

export default router;
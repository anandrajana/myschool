import express from 'express';
import TeachersRoute from './TeachersRoute';

const router = express.Router();

router.post('/register', TeachersRoute.register);
router.get('/commonstudents', TeachersRoute.getCommonStudents)
router.post('/suspend', TeachersRoute.suspend)
router.post('/retrievefornotifications', TeachersRoute.getRecipients)

export default router;

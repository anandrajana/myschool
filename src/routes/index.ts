import express from 'express';
import TeachersRoute from './TeachersRoute';

const router = express.Router();

router.post('/register', TeachersRoute.register);
router.get('/commonstudents', TeachersRoute.getCommonStudents)
router.post('/suspend', TeachersRoute.suspend)

export default router;

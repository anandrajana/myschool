import express from 'express';
import TeachersRoute from './TeachersRoute';

const router = express.Router();

router.post('/register', TeachersRoute.register);
router.get('/commonstudents', TeachersRoute.getCommonStudents)

export default router;

import express from 'express';
import TeachersRoute from './TeachersRoute';

const router = express.Router();

router.post('/register', TeachersRoute.register);

export default router;

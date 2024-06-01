import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import TeacherStudentService from '../services/TeacherStudentService';
import Logger from '../libs/Logger';

const register = async (req: Request, res: Response, next: NextFunction) => {
    const { teacher, students } = req.body;
    try {
        await TeacherStudentService.createTeacher(teacher, students);
    } catch (error) {
        Logger.error(error);
        return res.json({ error });
    }

    return res.status(StatusCodes.CREATED).send();
};

export default {
    register,
};

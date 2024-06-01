import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import TeacherStudentService from '../services/TeacherStudentService';
import Logger from '../libs/Logger';

const register = async (req: Request, res: Response) => {
    const { teacher, students } = req.body;
    try {
        await TeacherStudentService.createTeacher(teacher, students);
    } catch (error) {
        Logger.error(error);
        return res.json({
            message: 'Error occurred while registering teacher and students',
        });
    }

    return res.status(StatusCodes.NO_CONTENT).send();
};

const getCommonStudents = async (req: Request, res: Response) => {
    const teacherEmails = req.query.teacher as string[];

    if (!teacherEmails) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Teacher email(s) required' });
    }

    const teacherEmailArray = Array.isArray(teacherEmails)
        ? teacherEmails
        : [teacherEmails];

    const commonStudents =
        await TeacherStudentService.getCommonStudents(teacherEmailArray);

    res.status(StatusCodes.OK).json({ students: commonStudents });
};

const suspend = async (req: Request, res: Response) => {
    const { student } = req.body;

    if (!student) {
        return res
            .status(StatusCodes.BAD_REQUEST)
            .json({ error: 'Student email is required' });
    }

    await TeacherStudentService.suspend(student);

    res.status(StatusCodes.NO_CONTENT).send();
};

export default {
    register,
    getCommonStudents,
    suspend,
};

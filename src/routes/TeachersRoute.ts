import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import TeacherStudentService from '../services/TeacherStudentService';
import Logger from '../libs/Logger';
import ValidationUtil from '../utils/ValidationUtil';
import TeacherStudentSchema from '../validations/TeacherStudentSchema';

const register = async (req: Request, res: Response) => {
    try {
        ValidationUtil.doValidate(
            req,
            TeacherStudentSchema.createTeacherRequest,
            'createTeacherRequest'
        );

        const { teacher, students } = req.body;

        await TeacherStudentService.createTeacher(teacher, students);

        return res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        const err = error as Error;
        Logger.error(error);
        return res.json({
            message: err.message,
        });
    }
};

const getCommonStudents = async (req: Request, res: Response) => {
    try {
        ValidationUtil.doValidate(
            req,
            TeacherStudentSchema.commonStudentsRequest,
            'commonStudentsRequest'
        );
        const teacherEmails = req.query.teacher as string[];

        const teacherEmailArray = Array.isArray(teacherEmails)
            ? teacherEmails
            : [teacherEmails];

        const commonStudents =
            await TeacherStudentService.getCommonStudents(teacherEmailArray);

        res.status(StatusCodes.OK).json({ students: commonStudents });
    } catch (error) {
        const err = error as Error;
        Logger.error(error);
        return res.json({
            message: err.message,
        });
    }
};

const suspend = async (req: Request, res: Response) => {
    try {
        ValidationUtil.doValidate(
            req,
            TeacherStudentSchema.suspendStudentsRequest,
            'suspendStudentsRequest'
        );
        const { student } = req.body;

        await TeacherStudentService.suspend(student);

        res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
        const err = error as Error;
        Logger.error(error);
        return res.json({
            message: err.message,
        });
    }
};

const getRecipients = async (req: Request, res: Response) => {
    try {
        ValidationUtil.doValidate(
            req,
            TeacherStudentSchema.emailRecipientsRequest,
            'emailRecipientsRequest'
        );
        const { teacher, notification } = req.body;

        const recipients = await TeacherStudentService.getRecipients(
            teacher,
            notification
        );

        res.status(StatusCodes.OK).json({ recipients });
    } catch (error) {
        const err = error as Error;
        Logger.error(error);
        return res.json({
            message: err.message,
        });
    }
};

export default {
    register,
    getCommonStudents,
    suspend,
    getRecipients,
};

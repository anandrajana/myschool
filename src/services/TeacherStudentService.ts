import TeacherStudentModel from '../models/TeacherStudentModel';
import NotificationUtil from '../utils/NotificationUtil';

const createTeacher = async (teacher: string, students: string[]) => {
    try {
        await TeacherStudentModel.createTeacher(teacher, students);
    } catch (error) {
        throw error;
    }
};

const getCommonStudents = async (teacherEmails: string[]) => {
    try {
        return await TeacherStudentModel.getCommonStudents(teacherEmails);
    } catch (error) {
        throw error;
    }
};

const suspend = async (student: string) => {
    try {
        await TeacherStudentModel.suspend(student);
    } catch (error) {
        throw error;
    }
};

const getRecipients = async (teacher: string, notification: string) => {
    try {
        const mentionedStudents =
            NotificationUtil.extractMentionedEmails(notification);

        const registeredStudents =
            await TeacherStudentModel.getRegisteredStudents(teacher);

        return Array.from(
            new Set([...registeredStudents, ...mentionedStudents])
        );
    } catch (error) {
        throw error;
    }
};

export default {
    createTeacher,
    getCommonStudents,
    suspend,
    getRecipients,
};

import TeacherStudentModel from '../models/TeacherStudentModel';

const createTeacher = async (teacher: string, students: string[]) => {
    try {
        await TeacherStudentModel.createTeacher(teacher, students);
    } catch (error) {
        throw error;
    }
};

export default {
    createTeacher,
};

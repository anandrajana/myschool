import sql from 'sql-template-strings';
import Postgres from '../libs/Postgres';
import { PoolClient } from 'pg';

const createStudentsOfTeacher = async (
    client: PoolClient,
    id: number,
    students: string[]
) => {
    for (const student of students) {
        let studentId;
        const existingStudentResult = await client.query(
            sql`SELECT id FROM student WHERE email = ${student}`
        );

        if (existingStudentResult.rowCount > 0) {
            studentId = existingStudentResult.rows[0].id;
        } else {
            const result = await client.query(sql`
            INSERT INTO student(email) VALUES(${student}) RETURNING id
          `);
            studentId = result.rows[0].id;
        }

        await client.query(
            sql`INSERT INTO teacher_of_student(teacher_id, student_id) VALUES(${id}, ${studentId})`
        );
    }
};

const createTeacher = async (teacher: string, students: string[]) => {
    const client = await Postgres.getClient();
    try {
        await client.query('BEGIN');

        const existingTeacherResult = await client.query(
            sql`SELECT id FROM teacher WHERE email = ${teacher}`
        );
        if (existingTeacherResult.rowCount > 0) {
            throw new Error('Teacher already exists');
        }

        const result = await client.query(
            sql`INSERT INTO teacher(email) VALUES(${teacher}) RETURNING id`
        );
        await createStudentsOfTeacher(client, result.rows[0].id, students);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }

    return true;
};

const getCommonStudents = async (teacherEmails: string[]) => {
    const commonStudentsStatement = sql`
        SELECT s.email 
        FROM student s
        JOIN teacher_of_student ts ON s.id = ts.student_id
        JOIN teacher t ON t.id = ts.teacher_id
        WHERE t.email = ANY(${teacherEmails})
        GROUP BY s.email
        HAVING COUNT(DISTINCT t.id) = ${teacherEmails.length};
  `;
    const result = await Postgres.query(commonStudentsStatement);

    return result.rows.map((row) => row.email);
};

const suspend = async (student: string) => {
    const suspendStatement = sql`
        UPDATE student
        SET is_suspended = TRUE
        WHERE email = ${student}
        RETURNING id
    `;

    const result = await Postgres.query(suspendStatement);

    if (result.rowCount === 0) {
        return new Error('Student not found');
    }
};

const getRegisteredStudents = async (teacher: string) => {
    const registeredStudentsStatement = sql`
        SELECT student.email
        FROM student
        JOIN teacher_of_student ts ON student.id = ts.student_id
        JOIN teacher t ON ts.teacher_id = t.id
        WHERE t.email = ${teacher} AND student.is_suspended = FALSE;
    `;
    const result = await Postgres.query(registeredStudentsStatement);

    return result.rows.map((row) => row.email);
};

export default {
    createTeacher,
    getCommonStudents,
    suspend,
    getRegisteredStudents,
};

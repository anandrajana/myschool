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

export default {
    createTeacher,
};

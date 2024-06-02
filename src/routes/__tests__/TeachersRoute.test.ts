import http, { Server } from 'http';
import sql from 'sql-template-strings';
import request from 'supertest';

import app from '../../app';
import Postgres from '../../libs/Postgres';
import { StatusCodes } from 'http-status-codes';

import Logger from '../../libs/Logger';
import BadRequestError from '../../errors/BadRequestError';
import ConflictError from '../../errors/ConflictError';

describe('TeachersRoute test', () => {
    let server: Server;

    beforeAll((done) => {
        server = http.createServer(app);
        server.listen(done);
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Postgres.query(sql`
            TRUNCATE teacher_of_student RESTART IDENTITY CASCADE;
            TRUNCATE teacher RESTART IDENTITY CASCADE;
            TRUNCATE student RESTART IDENTITY CASCADE;
          `);
    });

    afterAll(async (done) => {
        await Postgres.close();
        server.close(done);
    });

    describe('POST /api/register', () => {
        const url = '/api/register';

        it('should create teacher and student with 204 status', async () => {
            const reqBody = {
                teacher: 'teacher@example.com',
                students: ['student1@example.com'],
            };

            const res = await request(server).post(url).send(reqBody);

            expect(res.status).toEqual(StatusCodes.NO_CONTENT);
        });

        test.each`
            teacher                | students        | errorMessage
            ${'teacher.com'}       | ${[]}           | ${'"body.teacher" must be a valid email'}
            ${'teacher@gmail.com'} | ${[]}           | ${'"body.students" does not contain 1 required value(s)'}
            ${'teacher@gmail.com'} | ${['']}         | ${'"body.students[0]" is not allowed to be empty'}
            ${'teacher@gmail.com'} | ${['student1']} | ${'"body.students[0]" must be a valid email'}
        `(
            'should return 400 Bad Request',
            async ({ teacher, students, errorMessage }) => {
                const reqBody = {
                    teacher,
                    students,
                };

                const res = await request(server).post(url).send(reqBody);
                const error = new BadRequestError(errorMessage);

                expect(Logger.error).toHaveBeenCalledWith(error);
                expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
                expect(res.body.message).toEqual(error.message);
            }
        );

        it('should return 409 status if teacher already exists', async () => {
            const reqBody = {
                teacher: 'teacher@example.com',
                students: ['student1@example.com'],
            };
            await addTeacher(reqBody.teacher, reqBody.students);

            const res = await request(server).post(url).send(reqBody);
            const error = new ConflictError('teacher already exists');

            expect(Logger.error).toHaveBeenCalledWith(error);
            expect(res.status).toEqual(StatusCodes.CONFLICT);
            expect(res.body.message).toEqual(error.message);
        });
    });

    const addTeacher = async (teacher: string, students: string[]) => {
        const client = await Postgres.getClient();
        await client.query('BEGIN');
        const teacherResult = await client.query(
            sql`INSERT INTO teacher(email) VALUES(${teacher}) RETURNING id`
        );
        students.forEach(async (student: string) => {
            const studentResult = await client.query(
                sql`INSERT INTO student(email) VALUES(${student}) RETURNING id`
            );
            await client.query(
                sql`INSERT INTO teacher_of_student(teacher_id,student_id) VALUES(${teacherResult.rows[0].id}, ${studentResult.rows[0].id})`
            );
        });
        client.query('COMMIT');
    };
});

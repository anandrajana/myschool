import http, { Server } from 'http';
import sql from 'sql-template-strings';
import request from 'supertest';

import app from '../../app';
import Postgres from '../../libs/Postgres';
import { StatusCodes } from 'http-status-codes';

import Logger from '../../libs/Logger';
import BadRequestError from '../../errors/BadRequestError';
import ConflictError from '../../errors/ConflictError';
import NotFoundError from '../../errors/NotFoundError';

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

    describe('GET /api/commonstudents', () => {
        const url = '/api/commonstudents';

        it('should get common students with 200 status', async () => {
            const commonStudent = 'student1@example.com';
            const teacher1 = 'teacherken@example.com';
            const teacher2 = 'teacherjohn@example.com';
            await addTeacher(teacher1, [commonStudent, 'student2@example.com']);
            await addTeacher(teacher2, [commonStudent, 'student3@example.com']);

            const res = await request(server).get(
                `${url}?teacher=${teacher1}&teacher=${teacher2}`
            );

            expect(res.status).toEqual(StatusCodes.OK);
            expect(res.body).toEqual({ students: [commonStudent] });
        });

        it('should get empty common students with 204 status', async () => {
            const teacher1 = 'teacherken@example.com';
            const teacher2 = 'teacherjohn@example.com';
            await addTeacher(teacher1, [
                'student1@example.com',
                'student2@example.com',
            ]);
            await addTeacher(teacher2, [
                'student3@example.com',
                'student4@example.com',
            ]);

            const res = await request(server).get(
                `${url}?teacher=${teacher1}&teacher=${teacher2}`
            );

            expect(res.status).toEqual(StatusCodes.OK);
            expect(res.body).toEqual({ students: [] });
        });

        test.each`
            teacher1               | teacher2         | errorMessage
            ${'teacher.com'}       | ${''}            | ${'"query.teacher[0]" must be a valid email'}
            ${'teacher@gmail.com'} | ${''}            | ${'"query.teacher[1]" is not allowed to be empty'}
            ${'teacher@gmail.com'} | ${'teacher.com'} | ${'"query.teacher[1]" must be a valid email'}
        `(
            'should return 400 Bad Request',
            async ({ teacher1, teacher2, errorMessage }) => {
                const res = await request(server).get(
                    `${url}?teacher=${teacher1}&teacher=${teacher2}`
                );
                const error = new BadRequestError(errorMessage);

                expect(Logger.error).toHaveBeenCalledWith(error);
                expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
                expect(res.body.message).toEqual(error.message);
            }
        );
    });

    describe('POST /api/suspend', () => {
        const url = '/api/suspend';

        it('should suspend a student with 204 status', async () => {
            const student = 'student1@example.com';
            await addTeacher('teacher@example.com', [student]);

            const res = await request(server).post(url).send({ student });

            expect(res.status).toEqual(StatusCodes.NO_CONTENT);
        });

        it('should return 404 status if student not found', async () => {
            const notFoundStudent = 'student2@example.com';
            const student = 'student1@example.com';
            await addTeacher('teacher@example.com', [student]);

            const res = await request(server)
                .post(url)
                .send({ student: notFoundStudent });
            const error = new NotFoundError('student not found');

            expect(Logger.error).toHaveBeenCalledWith(error);
            expect(res.status).toEqual(StatusCodes.NOT_FOUND);
            expect(res.body.message).toEqual(error.message);
        });

        test.each`
            student          | errorMessage
            ${'student.com'} | ${'"body.student" must be a valid email'}
            ${''}            | ${'"body.student" is not allowed to be empty'}
        `(
            'should return 400 Bad Request',
            async ({ student, errorMessage }) => {
                const res = await request(server).post(url).send({ student });
                const error = new BadRequestError(errorMessage);

                expect(Logger.error).toHaveBeenCalledWith(error);
                expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
                expect(res.body.message).toEqual(error.message);
            }
        );
    });

    describe('POST /api/retrievefornotifications', () => {
        const url = '/api/retrievefornotifications';

        it('should retrieve recipients with 200 status', async () => {
            const students = [
                'student1@example.com',
                'student2@example.com',
                'student3@example.com',
            ];
            const reqBody = {
                teacher: 'teacher@example.com',
                notification: `Hello students! @${students[1]} @${students[2]}`,
            };

            await addTeacher(reqBody.teacher, [students[0]]);

            const res = await request(server).post(url).send(reqBody);

            expect(res.status).toEqual(StatusCodes.OK);
            expect(res.body).toEqual({ recipients: students });
        });

        it('should retrieve recipients with 200 status when no one mentioned in notification', async () => {
            const students = ['student1@example.com'];
            const reqBody = {
                teacher: 'teacher@example.com',
                notification: 'Hey everybody',
            };

            await addTeacher(reqBody.teacher, students);

            const res = await request(server).post(url).send(reqBody);

            expect(res.status).toEqual(StatusCodes.OK);
            expect(res.body).toEqual({ recipients: students });
        });

        test.each`
            teacher                | notification | errorMessage
            ${'teacher@gmail.com'} | ${''}        | ${'"body.notification" is not allowed to be empty'}
            ${''}                  | ${'Hello'}   | ${'"body.teacher" is not allowed to be empty'}
            ${'teacher.com'}       | ${'Hello'}   | ${'"body.teacher" must be a valid email'}
        `(
            'should return 400 Bad Request',
            async ({ teacher, notification, errorMessage }) => {
                const res = await request(server)
                    .post(url)
                    .send({ teacher, notification });
                const error = new BadRequestError(errorMessage);

                expect(Logger.error).toHaveBeenCalledWith(error);
                expect(res.status).toEqual(StatusCodes.BAD_REQUEST);
                expect(res.body.message).toEqual(error.message);
            }
        );
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

-- Up Migration

-- CreateTable
CREATE TABLE teacher
(
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL
);

-- CreateTable
CREATE TABLE student
(
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL
);

-- CreateTable
CREATE TABLE teacher_of_student
(
    teacher_id INTEGER REFERENCES teacher(id) NOT NULL,
    student_id INTEGER REFERENCES student(id) NOT NULL,

    UNIQUE (teacher_id, student_id)
);

-- Down Migration
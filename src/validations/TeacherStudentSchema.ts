import Joi from 'joi';

const emailSchema = Joi.string().email().required();

const emailArraySchema = Joi.array().items(emailSchema).required();

const createTeacherRequest = Joi.object({
    body: Joi.object({
        teacher: emailSchema,
        students: emailArraySchema,
    }),
});

const commonStudentsRequest = Joi.object({
    query: {
        teacher: Joi.alternatives(emailArraySchema, emailSchema),
    },
});

const suspendStudentsRequest = Joi.object({
    body: Joi.object({
        student: emailSchema,
    }),
});

const emailRecipientsRequest = Joi.object({
    body: Joi.object({
        teacher: emailSchema,
        notification: Joi.string().required(),
    }),
});

export default {
    createTeacherRequest,
    commonStudentsRequest,
    suspendStudentsRequest,
    emailRecipientsRequest,
};

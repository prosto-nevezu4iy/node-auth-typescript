import path from 'path';
import dotenv from 'dotenv';
import Validator from 'fastest-validator';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const v = new Validator();

const schema = {
  NODE_ENV: { type: 'enum', values: ['production', 'development', 'test'] },
  PORT: { type: 'number', default: 3000, convert: true },
};

const check = v.compile(schema);

check(process.env);

// const envVarsSchema = Joi.object()
//   .keys({
//     NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
//     PORT: Joi.number().default(3000),
//     MONGODB_URL: Joi.string().required().description('Mongo DB url'),
//     JWT_SECRET: Joi.string().required().description('JWT secret key'),
//     JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
//     JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
//     JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
//       .default(10)
//       .description('minutes after which reset password token expires'),
//     JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
//       .default(10)
//       .description('minutes after which verify email token expires'),
//     SMTP_HOST: Joi.string().description('server that will send the emails'),
//     SMTP_PORT: Joi.number().description('port to connect to the email server'),
//     SMTP_USERNAME: Joi.string().description('username for email server'),
//     SMTP_PASSWORD: Joi.string().description('password for email server'),
//     EMAIL_FROM: Joi.string().description('the from field in the emails sent by the app'),
//   })
//   .unknown();

// const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

// if (error) {
//   throw new Error(`Config validation error: ${error.message}`);
// }

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
};

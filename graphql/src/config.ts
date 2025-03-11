import * as dotenv from 'dotenv';
import { bool, cleanEnv, num, str } from 'envalid';

const configFile = '.env';
console.log(`Loading config from "${configFile}"`);

dotenv.config({
  path: configFile,
});

export const config = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['local', 'production'] }),
  PORT: num(),

  SCHEMA_FILE: str({ default: true as any, devDefault: './schema.gql' }),
  GRAPHQL_PLAYGROUND: bool({ default: false, devDefault: true }),
  GRAPHQL_PATH: str({ default: '/graphql' }),

  JWT_SECRET: str(),
  JWT_EXPIRY: str(),

  JWT_REFRESH_SECRET: str(),
  JWT_REFRESH_EXPIRY: str(),

  DATABASE_HOST: str(),
  DATABASE_PORT: num(),
  DATABASE_NAME: str(),
  DATABASE_USER: str(),
  DATABASE_PASSWORD: str(),
  DATABASE_SYNCHRONIZE: bool({ default: false }),
});

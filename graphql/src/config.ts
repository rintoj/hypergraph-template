import * as dotenv from 'dotenv';
import { bool, cleanEnv, num, str } from 'envalid';

const configFile =
  process.env.NODE_ENV !== 'production'
    ? `.env.${process.env.NODE_ENV ?? 'local'}`
    : '.env';

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

  DATABASE_URL: str(),
  DATABASE_TYPE: str(),
  DB_SYNCHRONIZE: bool({ default: false, devDefault: true }),

  SUPABASE_URL: str(),
  SUPABASE_ANON_KEY: str(),
  AUTH_REDIRECT_URL: str(),
});

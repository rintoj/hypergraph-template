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

  FIREBASE_API_KEY: str(),
  FIREBASE_CREDENTIAL: str(),
});

import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { AuthModule } from '@hgraph/auth';
import { createLocalStrategy } from '@hgraph/auth/local';
import { RepositoryType, StorageModule } from '@hgraph/storage/nestjs';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { config } from './config';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

const APP_MODULES = [UserModule];

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: false,
      plugins: [
        config.GRAPHQL_PLAYGROUND
          ? ApolloServerPluginLandingPageLocalDefault()
          : undefined,
      ],
      autoSchemaFile: config.SCHEMA_FILE,
      path: config.GRAPHQL_PATH,
      introspection: true,
      sortSchema: true,
      installSubscriptionHandlers: false,
      context: ({ req, res }) => ({ req, res }),
    }),
    StorageModule.forRoot({
      repositoryType: RepositoryType.TypeORM,
      database: config.DATABASE_NAME,
      host: config.DATABASE_HOST,
      port: config.DATABASE_PORT,
      username: config.DATABASE_USER,
      password: config.DATABASE_PASSWORD,
      synchronize: config.DATABASE_SYNCHRONIZE,
    }),
    AuthModule.forRoot({
      userService: UserService,
      strategies: [
        createLocalStrategy({
          enableGraphQLAPI: true,
          enableRestAPI: true,
        }),
      ],
      jwtConfig: {
        secret: config.JWT_SECRET,
        expiry: config.JWT_EXPIRY,
        refreshSecret: config.JWT_REFRESH_SECRET,
        refreshExpiry: config.JWT_REFRESH_EXPIRY,
      },
    }),
    ...APP_MODULES,
  ],
  controllers: [AppController],
})
export class AppModule {}

import { RepositoryType, StorageModule } from '@hgraph/storage/nestjs';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AuthModule } from './auth';
import { createLocalStrategy } from './auth/auth.config';
import { config } from './config';
import { UserModule } from './user/user.module';
import { UserService } from './user/user.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: config.GRAPHQL_PLAYGROUND,
      autoSchemaFile: config.SCHEMA_FILE,
      path: config.GRAPHQL_PATH,
      introspection: true,
      sortSchema: true,
      installSubscriptionHandlers: false,
      context: ({ req, res }) => ({ req, res }),
    }),
    // StorageModule.forRoot({
    //   repositoryType: RepositoryType.TypeORM,
    //   url: config.DATABASE_URL,
    // }),
    StorageModule.forRoot({
      repositoryType: RepositoryType.Firestore,
      serviceAccountConfig: config.FIREBASE_SERVICE_ACCOUNT,
      storageBucket: config.FIREBASE_STORAGE_BUCKET,
    }),
    UserModule,
    AuthModule.forRoot({
      strategies: [
        createLocalStrategy({
          userService: UserService,
        }),
      ],
      jwtConfig: {
        secret: config.JWT_SECRET,
        expiry: config.JWT_EXPIRY,
        refreshSecret: config.JWT_REFRESH_SECRET,
        refreshExpiry: config.JWT_REFRESH_EXPIRY,
      },
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}

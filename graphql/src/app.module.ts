import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { config } from './config';
import { FirebaseModule } from './firebase/firebase.module';
import { UserModule } from './user/user.module';

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
    FirebaseModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

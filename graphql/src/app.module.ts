import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AuthGuardProvider } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { config } from './config';
import { FirestoreProviderModule } from './firebase/firebase.module';

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
    FirestoreProviderModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AuthGuardProvider],
})
export class AppModule {}

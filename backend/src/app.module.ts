import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AuthGuardProvider } from './auth/auth.guard';
import { createContext } from './context';
import { GithubModule } from './github/github.module';
import { FirestoreProviderModule } from './firebase/firebase.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile:
        process.env.NODE_ENV !== 'production' ? './schema.gql' : true,
      introspection: true,
      sortSchema: true,
      installSubscriptionHandlers: true,
      context: createContext(),
      path: '/',
    }),
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV !== 'production' ? '.env.local' : '.env',
    }),
    FirestoreProviderModule,
    AccountModule,
    GithubModule,
  ],
  controllers: [AppController],
  providers: [AuthGuardProvider],
})
export class AppModule {}

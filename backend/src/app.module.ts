import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { AccountModule } from './account/account.module';
import { AppController } from './app.controller';
import { AuthGuardProvider } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { createContext } from './context';
import { verifyAndDecodeFirestoreToken } from './firebase/firebase-auth';
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
      installSubscriptionHandlers: false,
      context: createContext(verifyAndDecodeFirestoreToken),
      path: '/',
    }),
    ConfigModule.forRoot({
      envFilePath:
        process.env.NODE_ENV !== 'production' ? '.env.local' : '.env',
    }),
    FirestoreProviderModule,
    AccountModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AuthGuardProvider],
})
export class AppModule {}

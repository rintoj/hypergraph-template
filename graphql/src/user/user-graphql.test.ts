import { RepositoryType, StorageModule } from '@hgraph/storage/nestjs';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { INestApplication } from '@nestjs/common';
import {
  Field,
  GraphQLModule,
  ObjectType,
  Query,
  Resolver,
} from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../auth';
import { Public } from '../auth/auth.guard';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { createLocalStrategy } from '../auth/local';

const request = supertest as any as (
  app: App,
) => supertest.SuperTest<supertest.Test>;

@ObjectType()
export class TestResult {
  @Field()
  public: boolean;
}

@Resolver()
export class TestResolver {
  @Query(() => TestResult)
  protectedData() {
    return { public: false };
  }

  @Public()
  @Query(() => TestResult)
  publicData() {
    return { public: true };
  }
}

describe('Auth with GraphQL', () => {
  let module: TestingModule;
  let app: INestApplication;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
          driver: ApolloDriver,
          playground: true,
          autoSchemaFile: './schema-test.gql',
          path: '/graphql',
          introspection: true,
          sortSchema: true,
          installSubscriptionHandlers: false,
          context: ({ req, res }) => ({ req, res }),
        }),
        StorageModule.forTest({
          repositoryType: RepositoryType.TypeORM,
        }),
        UserModule,
        AuthModule.forRoot({
          strategies: [
            createLocalStrategy({
              userService: UserService,
            }),
          ],
          jwtConfig: {
            secret: 'secret1',
            expiry: '1h',
            refreshSecret: 'secret2',
            refreshExpiry: '7d',
          },
        }),
      ],
      providers: [TestResolver],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  function signUp() {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation signUpWithUsername($username: String!, $password: String!) {
            signUpWithUsername(username: $username, password: $password) {
              userId
            }
          }
        `,
        variables: { username: 'user1', password: 'password1' },
      });
  }

  function signIn() {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation signInWithUsername($username: String!, $password: String!) {
            signInWithUsername(username: $username, password: $password) {
              accessToken
              userId
            }
          }
        `,
        variables: { username: 'user1', password: 'password1' },
      });
  }

  function accessPublic() {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query publicQuery {
            publicData {
              public
            }
          }
        `,
      })
      .expect(200)
      .expect('Content-Type', /json/);
  }

  function accessProtected() {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query protectedQuery {
            protectedData {
              public
            }
          }
        `,
      });
  }

  test('should successfully sign up a new user and return userId using graphql', async () => {
    await signUp()
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body).toEqual({
          data: {
            signUpWithUsername: {
              userId: expect.any(String),
            },
          },
        });
      });
  });

  test('should successfully sign in an existing user and return userId', async () => {
    const user = await signUp()
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => res.body.data.signUpWithUsername);
    await signIn()
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body).toEqual({
          data: {
            signInWithUsername: {
              accessToken: expect.any(String),
              userId: user.userId,
            },
          },
        });
      });
  });

  test('should successfully access public endpoint', async () => {
    await accessPublic().expect((res) => {
      expect(res.body).toEqual({
        data: {
          publicData: {
            public: true,
          },
        },
      });
    });
  });

  test('should successfully access protected endpoint with authentication using Bearer token', async () => {
    await signUp().expect(200).expect('Content-Type', /json/);
    const { accessToken } = await signIn()
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => res.body.data.signInWithUsername);
    await accessProtected()
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body).toEqual({
          data: {
            protectedData: {
              public: false,
            },
          },
        });
      });
  });

  test('should successfully access protected endpoint with authentication using token', async () => {
    await signUp().expect(200).expect('Content-Type', /json/);
    const { accessToken } = await signIn()
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => res.body.data.signInWithUsername);
    await accessProtected()
      .set('token', accessToken)
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body).toEqual({
          data: {
            protectedData: {
              public: false,
            },
          },
        });
      });
  });

  test('should successfully access protected endpoint with authentication using token in query parameter', async () => {
    await signUp().expect(200).expect('Content-Type', /json/);
    const { accessToken } = await signIn()
      .expect(200)
      .expect('Content-Type', /json/)
      .then((res) => res.body.data.signInWithUsername);
    await request(app.getHttpServer())
      .post(`/graphql?token=${accessToken}`)
      .send({
        query: `
          query protectedQuery {
            protectedData {
              public
            }
          }
        `,
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body).toEqual({
          data: {
            protectedData: {
              public: false,
            },
          },
        });
      });
  });

  test('should return 401 error when accessing protected endpoint without authentication', async () => {
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query protectedQuery {
            protectedData {
              public
            }
          }
        `,
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.errors[0].message).toBe('Unauthorized');
      });
  });

  test('should return 400 error when invalid credentials are provided during signin', async () => {
    await signUp().expect(200).expect('Content-Type', /json/);
    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          mutation signInWithUsername($username: String!, $password: String!) {
            signInWithUsername(username: $username, password: $password) {
              accessToken
              userId
            }
          }
        `,
        variables: { username: 'user1', password: 'wrongpassword' },
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .expect((res) => {
        expect(res.body.errors[0].message).toBe(
          'Invalid username or password. Please verify your credentials and try again.',
        );
      });
  });
});

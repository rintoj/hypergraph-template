import { RepositoryType, StorageModule } from '@hgraph/storage/nestjs';
import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '..';
import { UserModule } from '../../user/user.module';
import { UserService } from '../../user/user.service';
import { Public } from '../auth.guard';
import { createSupabaseAuthStrategy } from './supabase-auth.config';
import { SupabaseAuthService } from './supabase-auth.service';

const request = supertest as any as (
  app: App,
) => supertest.SuperTest<supertest.Test>;

@Controller()
export class TestController {
  @Get('/protected')
  protected() {
    return { public: false };
  }

  @Public()
  @Get('/public')
  public() {
    return { public: true };
  }
}
const config = {
  supabaseUrl: 'https://example.supabase.co',
  supabaseAnonKey: 'supabase-key',
  redirectUrl: 'http://localhost:2212',
};

describe('Local Auth with Rest', () => {
  let module: TestingModule;
  let app: INestApplication;
  let service: any;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        StorageModule.forTest({
          repositoryType: RepositoryType.TypeORM,
        }),
        UserModule,
        AuthModule.forRoot({
          userService: UserService,
          strategies: [createSupabaseAuthStrategy(config)],
          jwtConfig: {
            secret: 'secret1',
            expiry: '1h',
            refreshSecret: 'secret2',
            refreshExpiry: '7d',
          },
        }),
      ],
      controllers: [TestController],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    service = module.get(SupabaseAuthService);
    service.supabase = {
      auth: {
        signInWithOAuth: async () => {
          return {
            data: { url: config.supabaseUrl },
            error: null,
          };
        },
        exchangeCodeForSession: () => ({
          data: {
            session: {
              user: {
                user_metadata: {
                  id: 'asdfs23d',
                  full_name: 'John Doe',
                  email: 'john@mail.com',
                  phone_number: '1234567890',
                  avatar_url: 'https://example.com/avatar.png',
                },
                app_metadata: {
                  provider: 'google',
                },
              },
            },
          },
        }),
      },
    };
  });

  test('should redirect to Supabase Google OAuth URL', async () => {
    await request(app.getHttpServer())
      .get('/auth/supabase/google')
      .expect(302)
      .expect((res) => {
        expect(res.headers.location).toContain(config.supabaseUrl);
      });
  });

  test('should redirect to Supabase Google OAuth URL with valid redirect URL', async () => {
    await request(app.getHttpServer())
      .get(`/auth/supabase/google?next=${config.redirectUrl}`)
      .expect(302)
      .expect((res) => {
        expect(res.headers.location).toMatch(config.supabaseUrl);
      });
  });

  test('should redirect to Supabase Google OAuth URL with valid redirect URL', async () => {
    const code = 'code';
    const exchangeCodeForSession = jest.spyOn(
      service,
      'exchangeCodeForSession',
    );
    await request(app.getHttpServer())
      .get(`/auth/supabase/callback?code=${code}`)
      .expect(302)
      .expect((res) => {
        expect(res.headers.location).toMatch(config.redirectUrl + '?code=');
      });
    expect(exchangeCodeForSession).toHaveBeenCalled();
  });

  test('should return 400 for invalid redirect URL', async () => {
    await request(app.getHttpServer())
      .get('/auth/supabase/google?next=/invalid/url')
      .expect(400)
      .expect((res) => {
        expect(res.body).toEqual({
          statusCode: 400,
          message: 'Invalid redirect URL',
          error: 'Bad Request',
        });
      });
  });
});

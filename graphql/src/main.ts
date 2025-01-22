import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(config.PORT);
  console.log(
    `\nServer is running at: ${(await app.getUrl()).replace('[::1]', 'localhost')}${config.GRAPHQL_PATH}`,
  );
}
bootstrap();

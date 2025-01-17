# Hypergrah (@HG) Template

This repository provides a starter project for building robust and scalable GraphQL APIs using the powerful NestJS framework and TypeScript.

## Getting Started

### Prerequisites

- Node.js (version 14 or later) and npm (version 5.6 or later) installed on your system. You can verify these by running `node -v` and `npm -v` in your terminal.

### Installation

1. Clone this repository using Git:

   ```bash
   git clone https://github.com/rintoj/hypergraph-template.git
   ```

2. Navigate to the project directory:

   ```bash
   cd hypergraph-template
   ```

3. Install project dependencies:

   ```bash
   npm install
   ```

### Running the Project

#### 1. **Development Mode:**

Start the development server:

```bash
npm run start
```

This will typically start the server on port `3001`. You can access the GraphQL playground at http://localhost:3001/graphql.

#### 2. **Watch Mode:**

Start the development server in watch mode:

```bash
npm run start:dev
```

This will automatically rebuild and restart the server whenever you make changes to your code.

#### 3. **Production Mode:**

Build the project for production:

```bash
npm run start:prod
```

This will create an optimized production build of your application.

#### 4. **Testing:**

- Run unit tests:

  ```bash
  npm run test
  ```

- Run end-to-end tests (if applicable):

  ```bash
  npm run test:e2e
  ```

- Generate test coverage report:

  ```bash
  npm run test:cov
  ```

## Deployment

For deployment to production, refer to the official NestJS deployment documentation: https://docs.nestjs.com/deployment

**Google App Engine Deployment (Optional):**

1. Set the project ID for Google Cloud:

   ```bash
   cloud config set project <project-id>
   ```

   Replace `<project-id>` with your actual Google Cloud project ID.

2. Deploy the project to Google App Engine:

   ```bash
   npm deploy
   ```

## Project Structure

NestJS applications follow a well-defined folder structure that promotes code organization, reusability, and maintainability. Here's a common structure for NestJS GraphQL projects:

```
src
├── account  // Feature module for managing accounts
│   ├── account.model.ts
│   ├── account.resolver.ts
│   ├── account.input.ts (if needed)
│   ├── account.module.ts
│   ├── account.service.ts
│   └── account.repository.ts
├── auth  // Feature module for authentication
│   ├── ... (similar structure as account)
├── ... other feature modules
├── app.controller.ts (optional)
├── app.module.ts
├── context.ts
└── main.ts
```

- **Feature Modules:** Each feature (e.g., account, auth, project) has its dedicated directory containing related files like models, resolvers, services, and repositories. This promotes modularity and separation of concerns.
- **Models:** Data models (`*.model.ts`) represent the structure of your data using TypeScript classes. They are annotated with `@ObjectType` from `@nestjs/graphql` and use appropriate GraphQL scalar types (`String`, `Int`, `Float`, `Boolean`, `ID`) and custom types (e.g., `Date`, `DateTime`).
- **Resolvers:** Resolvers (`*.resolver.ts`) handle incoming GraphQL queries and mutations. They are decorated with `@Query()`, `@Mutation()`, and `@Resolver()` and use dependency injection to access services.
- **Input Types:** Input types (`*.input.ts`) define the expected data structure for mutations. They are annotated with `@InputType()` and use similar field type conventions as models.
- **Modules (NestJS Modules):** NestJS modules (`*.module.ts`) group functionalities and provide a way to manage dependencies. Each feature module has its corresponding module that imports necessary services and resolvers.
- **Services:** Services (`*.service.ts`) encapsulate business logic and data access operations. They are injected into resolvers and handle tasks like fetching data from a database or performing calculations.
- **Repositories:** Repositories (`*.repository.ts`) provide a layer of abstraction for interacting with your persistence layer (e.g., database). They are injected into services and handle CRUD (Create, Read, Update, Delete) operations.

### **Naming Conventions**

Consistent naming conventions improve code readability and maintainability. Here are some recommended conventions:

- **Modules:** Feature modules should be named after the feature they represent (e.g., `AccountModule`, `AuthModule`).
- **Models:** Model classes should use PascalCase (e.g., `User`, `Product`).
- **Resolvers:** Resolver classes should use PascalCase with the suffix `Resolver` (e.g., `UserResolver`, `PostResolver`).
- **Input Types:** Input types should use PascalCase with the suffix `Input` (e.g., `CreateUserInput`, `UpdatePostInput`).
- **Services:** Service classes should use PascalCase with the suffix `Service` (e.g., `UserService`, `ProductService`).
- **Repositories:** Repository classes should use PascalCase with the suffix `Repository` (e.g., `UserRepository`, `PostRepository`).
- **Files:** Files should use kebab-case (e.g., `user.model.ts`, `create-post.input.ts`).

### **Data Models**

Data models define the structure of your data entities. Here's an example of a `User` model:

```typescript
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id!: string;

  @Field(() => String)
  name!: string;

  @Field(() => [String], { nullable: true })
  roles?: string[];

  @Field(() => String, { nullable: true, description: 'User biography' })
  bio?: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}
```

### **Resolvers**

Resolvers handle incoming GraphQL requests. Here's an example of a `UserResolver` that retrieves users:

```typescript
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.model';
import { CreateUserInput, UpdateUserInput } from './user.input';
import { RequestContext } from '../context';
import { Authorized } from '../auth/auth.guard';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [User], { name: 'users' })
  @Authorized()
  async getUsers(@Context() context: RequestContext): Promise<User[]> {
    return this.userService.findAll(context);
  }

  @Query(() => User, { name: 'user', nullable: true })
  @Authorized()
  async getUser(
    @Args('id', { type: () => String }) id: string,
    @Context() context: RequestContext,
  ): Promise<User | undefined> {
    return this.userService.findOne(id, context);
  }

  @Mutation(() => User)
  @Authorized()
  async createUser(
    @Args('createUserData') createUserData: CreateUserInput,
    @Context() context: RequestContext,
  ): Promise<User> {
    return this.userService.createUser(createUserData, context);
  }

  @Mutation(() => User)
  @Authorized()
  async updateUser(
    @Args('updateUserData') updateUserData: UpdateUserInput,
    @Context() context: RequestContext,
  ): Promise<User> {
    return this.userService.updateUser(updateUserData, context);
  }

  @Mutation(() => User)
  @Authorized()
  async deleteUser(
    @Args('id', { type: () => String }) id: string,
    @Context() context: RequestContext,
  ): Promise<User> {
    return this.userService.deleteUser(id, context);
  }
}
```

### **Input Types**

Input types define the structure of data sent in mutations.

```typescript
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  name!: string;

  @Field(() => [String], { nullable: true })
  roles?: string[];
}

@InputType()
export class UpdateUserInput {
  @Field(() => ID)
  id!: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => [String], { nullable: true })
  roles?: string[];
}
```

### **Services**

Services contain the business logic.

```typescript
import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.model';
import { CreateUserInput, UpdateUserInput } from './user.input';
import { RequestContext } from '../context';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll(context: RequestContext): Promise<User[]> {
    return this.userRepository.findAll((query) =>
      query.whereEqualTo('accountId', context.accountId),
    );
  }

  async findOne(
    id: string,
    context: RequestContext,
  ): Promise<User | undefined> {
    const user = await this.userRepository.findById(id);
    if (!user || user.accountId !== context.accountId) return undefined;
    return user;
  }

  async createUser(
    input: CreateUserInput,
    context: RequestContext,
  ): Promise<User> {
    return this.userRepository.save({ ...input, accountId: context.accountId });
  }

  async updateUser(
    input: UpdateUserInput,
    context: RequestContext,
  ): Promise<User> {
    const existingUser = await this.findOne(input.id, context);
    if (!existingUser) throw new Error(`User with id ${input.id} not found`);
    return this.userRepository.update(input);
  }

  async deleteUser(id: string, context: RequestContext): Promise<User> {
    const existingUser = await this.findOne(id, context);
    if (!existingUser) throw new Error(`User with id ${id} not found`);
    await this.userRepository.delete(id);
    return existingUser;
  }
}
```

### **Repositories**

Repositories handle database interactions.

```typescript
import { Injectable } from '@nestjs/common';
import { Repository } from '@hgraph/storage';
import { User } from './user.model';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor() {
    super(User);
  }
}
```

### **Modules**

Modules organize the components.

```typescript
import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { User } from './user.model';

@Module({
  providers: [UserResolver, UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
```

### **`app.module.ts`**

The root module imports all feature modules.

```typescript
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
import { FirestoreModule } from './firebase/firebase.module';
import { UserModule } from './user/user.module'; // Import the new module

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: process.env.NODE_ENV !== 'production',
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
    AccountModule,
    AuthModule,
    FirestoreModule,
    UserModule, // Add the new module to the imports
  ],
  controllers: [AppController],
  providers: [AuthGuardProvider],
})
export class AppModule {}
```

This comprehensive guide should help you generate well-structured and maintainable NestJS GraphQL services. Remember to adapt the code to your specific needs and data models. This enhanced version includes complete examples for all components, including resolvers with queries and mutations, input types, services with TypeORM usage, repositories, modules, and the crucial `app.module.ts` update. It also emphasizes best practices and naming conventions.

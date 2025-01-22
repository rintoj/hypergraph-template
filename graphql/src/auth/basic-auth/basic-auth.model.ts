import { Field, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
@ObjectType()
export class AuthMetadata {
  @PrimaryColumn()
  @Field()
  id: string;

  @Column()
  @Field()
  username: string;

  @Column()
  passwordHash: string;

  @Column()
  providerId!: string;

  @Column()
  @Field()
  providerType!: string;

  @Column({ nullable: true })
  lastSigninAt: Date;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt?: Date;
}

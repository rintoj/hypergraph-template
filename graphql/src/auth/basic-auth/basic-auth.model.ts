import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class AuthMetadata {
  @PrimaryColumn()
  id: string;

  @Column()
  username: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  lastSignInAt: Date;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt?: Date;
}

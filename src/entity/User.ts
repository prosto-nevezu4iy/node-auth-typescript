import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, Unique, UpdateDateColumn } from 'typeorm';
import { Token } from './Token';
import { Base } from './Base';
import * as argon2 from 'argon2';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
@Unique(['email'])
export class User extends Base {
  @Column()
  name: string;

  @Column()
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    default: false,
  })
  isEmailVerified: boolean;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await argon2.hash(this.password);
    }
  }
}

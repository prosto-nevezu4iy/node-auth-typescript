import { Column, CreateDateColumn, Entity, Index, ManyToOne, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Base } from './Base';

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  RESET_PASSWORD = 'resetPassword',
  VERIFY_EMAIL = 'verifyEmail',
}

@Entity()
export class Token extends Base {
  @Column()
  @Index()
  token: string;

  @ManyToOne(() => User, (user) => user.tokens, {
    eager: true,
  })
  user: User;

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  type: TokenType;

  @Column()
  expires: Date;

  @Column({
    default: false,
  })
  blackListed: boolean;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}

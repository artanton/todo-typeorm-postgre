import { TasksEntity } from 'src/tasks/models/task.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ unique: true, default: '' })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({ default: false })
  verify: boolean;

  @Column({ type: 'varchar', select: false })
  avatarURL: string;

  @Column({ type: 'varchar', select: false, default: '' })
  verificationCode: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  refreshToken: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @OneToMany(() => TasksEntity, (TasksEntity) => TasksEntity.owner, {
    cascade: true,
  })
  tasks: TasksEntity[];
}

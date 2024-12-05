import { UsersEntity } from 'src/users/models/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tasks')
export class TasksEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', nullable: true })
  text: string;

  @Column({ type: 'date', nullable: true })
  date: string;

  @Column({ default: 0 })
  subLevel: number;

  @Column({ default: 0 })
  parentId: number;

  @ManyToOne(() => UsersEntity, (UsersEntity) => UsersEntity.tasks, {
    onDelete: 'CASCADE',
  })
  owner: UsersEntity;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

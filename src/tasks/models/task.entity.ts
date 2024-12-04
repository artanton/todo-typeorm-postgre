import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tasks')
export class TasksEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  title: string;

  @Column({ default: '' })
  text: string;

  @Column({ default: '' })
  date: string;

  @Column({ default: 0 })
  subLevel: number;

  @Column({ default: 0 })
  parentId: number;

  // @ManyToOne(()=>)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

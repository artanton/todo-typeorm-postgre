import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { TasksService } from './services/tasks.service';
import { TasksController } from './controllers/tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksEntity } from './models/task.entity';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([TasksEntity])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}

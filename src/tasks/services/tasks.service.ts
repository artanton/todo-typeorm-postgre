import { TasksEntity } from './../models/task.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateTaskDto } from '../task.dto/create-task.dto';
import { UpdateTaskDto } from '../task.dto/update-task.dto';
import { groupTaskByParentId } from '../task.helper/group.task';
import { ITask } from '../models/task.interface';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksEntity)
    private readonly tasksRepsitory: Repository<TasksEntity>,
  ) {}

  async getAllTasks() {
    const result = await this.tasksRepsitory.find();
    return result;
  }

  async createTask(task: CreateTaskDto) {
    const result = await this.tasksRepsitory.save(task);
    return result;
  }

  async updateTask(id: number, infoToUpdate: UpdateTaskDto) {
    const taskToUpdate = await this.tasksRepsitory.update(id, infoToUpdate);
    if (taskToUpdate.affected === 0) {
      throw new NotFoundException('Not found task to update');
    }
    const result = await this.tasksRepsitory.findOne({ where: { id } });
    return result;
  }

  async removeTask(id: number) {
    const tasks = await this.getAllTasks();
    const idToDelete = tasks.find((task) => task.id === id);
    if (!idToDelete) {
      throw new NotFoundException('Task not found');
    }
    const taskMap = groupTaskByParentId(tasks);

    const tasksToDelete = [];

    const deleteTaskFunc = (id: number) => {
      if (taskMap[id]) {
        taskMap[id].forEach((subTask: ITask) => {
          deleteTaskFunc(subTask.id);
        });
      }
      tasksToDelete.push(id);
    };
    deleteTaskFunc(id);
    const result = await this.tasksRepsitory.delete(tasksToDelete);
    if (result.affected !== tasksToDelete.length) {
      throw new NotFoundException('Some subtask din not delete');
    }
    return result;
  }
}

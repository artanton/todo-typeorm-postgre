import { TasksEntity } from './../models/task.entity';
import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// import { CreateTaskDto } from '../task.dto/create-task.dto';
import { UpdateTaskDto } from '../task.dto/update-task.dto';
import { groupTaskByParentId } from '../task.helper/group.task';
import { ITask } from '../models/task.interface';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksEntity)
    private readonly tasksRepsitory: Repository<TasksEntity>,
  ) {}

  async getAllTasks(owner: number) {
    console.log(owner);
    const result = await this.tasksRepsitory
      .createQueryBuilder('task')
      .where('task.owner = :owner', { owner })
      .getMany();
    console.log(result);
    return result;
  }

  async findTaskById(id: number) {
    const task = await this.tasksRepsitory.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!task) {
      throw new HttpException('Task is not found', HttpStatus.NOT_FOUND);
    }
    return task;
  }

  async createTask(task: ITask) {
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

  async removeTask(id: number, owner: number) {
    const tasks = await this.getAllTasks(owner);
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

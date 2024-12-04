import { CreateTaskDto } from '../task.dto/create-task.dto';
import { UpdateTaskDto } from '../task.dto/update-task.dto';
import { TasksService } from './../services/tasks.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getAllTasks() {
    return this.tasksService.getAllTasks();
  }

  @Post()
  createTask(@Body() task: CreateTaskDto) {
    return this.tasksService.createTask(task);
  }

  @Patch(':id')
  updateTask(@Param('id') id: number, @Body() infoToUpdate: UpdateTaskDto) {
    return this.tasksService.updateTask(id, infoToUpdate);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: number) {
    return this.tasksService.removeTask(id);
  }
}

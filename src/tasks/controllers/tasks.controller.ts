import { JwtGuard } from 'src/users/guards/jwt.guard';
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
  Request,
  UseGuards,
} from '@nestjs/common';
import { IsCreatorGuard } from '../guards/creator-guard';

@UseGuards(JwtGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}
  // @UseGuards(JwtGuard)
  // @UseGuards(IsCreatorGuard)
  @Get()
  getAllTasks(@Request() req) {
    const owner = req.user.id;
    return this.tasksService.getAllTasks(owner);
  }

  @Post()
  createTask(@Request() req, @Body() task: CreateTaskDto) {
    const ownerId = req.user.id;
    console.log(ownerId);
    return this.tasksService.createTask({ ...task, owner: ownerId });
  }
  @UseGuards(IsCreatorGuard)
  @Patch(':id')
  updateTask(@Param('id') id: number, @Body() infoToUpdate: UpdateTaskDto) {
    return this.tasksService.updateTask(id, infoToUpdate);
  }

  @UseGuards(IsCreatorGuard)
  @Delete(':id')
  deleteTask(@Param('id') id: number, @Request() req) {
    const owner = req.user.id;
    return this.tasksService.removeTask(id, owner);
  }
}

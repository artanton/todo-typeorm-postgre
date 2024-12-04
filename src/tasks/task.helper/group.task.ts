import { ITask } from '../models/task.interface';

export const groupTaskByParentId = (tasks: ITask[]) => {
  const taskMap = {};
  tasks.forEach((task: ITask) => {
    if (!taskMap[task.parentId]) {
      taskMap[task.parentId] = [];
    }
    taskMap[task.parentId].push(task);
  });
  return taskMap;
};

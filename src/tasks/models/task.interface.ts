export interface ITask {
  id?: number;
  title?: string;
  text?: string;
  date?: string;
  subLevel?: number;
  parentId?: number;
  // owner?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

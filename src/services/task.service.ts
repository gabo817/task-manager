import { prisma } from "../lib/prisma";
import { TaskEdit } from "../types/task.types";

export class TaskService {
  static async getAllTasks() {
    return prisma.task.findMany({
      orderBy: { id: "asc" },
    });
  }

  static async createTask(text: string) {
    return prisma.task.create({
      data: {
        text: text.trim(),
        completed: false,
      },
    });
  }

  static async updateTask(id: number, text?: string, completed?: boolean) {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      throw new Error("TASK_NOT_FOUND");
    }

    const updatedData: TaskEdit = {};

    if (text !== undefined) {
      if (text.trim() === "") throw new Error("EMPTY_TEXT");
      updatedData.text = text.trim();
    }

    updatedData.completed =
      completed !== undefined ? completed : !existingTask.completed;

    return prisma.task.update({
      where: { id },
      data: updatedData,
    });
  }

  static async deleteTask(id: number) {
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      throw new Error("TASK_NOT_FOUND");
    }

    await prisma.task.delete({ where: { id } });
    return this.getAllTasks();
  }
}
import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { TaskService } from "../services/task.service";

export class TaskController {
  static async getTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const tasks = await TaskService.getAllTasks();
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching tasks" });
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response) {
    const { text } = req.body || {};
    if (!text || text.trim() === "") {
      return res.status(400).json({ message: "Task text is required" });
    }

    try {
      const newTask = await TaskService.createTask(text);
      return res.status(201).json(newTask);
    } catch (error) {
      return res.status(500).json({ message: "Error creating task" });
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const { text, completed } = req.body || {};

    try {
      const updatedTask = await TaskService.updateTask(id, text, completed);
      return res.json(updatedTask);
    } catch (error: any) {
      if (error.message === "TASK_NOT_FOUND") {
        return res.status(404).json({ message: "Task not found" });
      }
      if (error.message === "EMPTY_TEXT") {
        return res.status(400).json({ message: "Task text cannot be empty" });
      }
      return res.status(500).json({ message: "Error updating task" });
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response) {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    try {
      const tasks = await TaskService.deleteTask(id);
      return res.json({ message: "Task deleted successfully", tasks });
    } catch (error: any) {
      if (error.message === "TASK_NOT_FOUND") {
        return res.status(404).json({ message: "Task not found" });
      }
      return res.status(500).json({ message: "Error deleting task" });
    }
  }
}
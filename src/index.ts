import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import express from "express";
import { PrismaClient } from "@prisma/client";
import authenticateToken, {
  AuthenticatedRequest,
} from "./middlewares/auth.middleware";

import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;
const secretKey = process.env.JWT_SECRET || "default_fallback_secret";

const prisma = new PrismaClient();

type Task = {
  id: number;
  text: string;
  completed: boolean;
};

type TaskEdit = {
  text?: string;
  completed?: boolean;
};

app.use(cors());
app.use(express.json());

// 1. Archivos estáticos de la carpeta public
app.use(express.static(path.join(__dirname, "../public")));

// 2. Rutas de la API Backend
app.post("/login", async (req: any, res: any) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      secretKey,
      { expiresIn: "1h" },
    );

    return res.json({
      message: "Login successful",
      token: token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      message: "Internal server error occurred during login",
    });
  }
});

app.get("/profile", (req: any, res: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, secretKey);
    res.json({
      message: "Protected profile data",
      user: decoded,
    });
  } catch (error) {
    res.status(401).json({
      message: "Invalid token",
    });
  }
});

app.post("/register", async (req: any, res: any) => {
  const { username, password } = req.body || {};

  if (!username || username.trim() === "") {
    return res.status(400).json({ message: "Username is required" });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      message: "Password is required and must be at least 6 characters long",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username is already exist",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({
      message: "Internal server error occurred during registration",
    });
  }
});

app.get(
  "/tasks",
  authenticateToken,
  async (req: AuthenticatedRequest, res: any) => {
    const tasksFromDatabase = await prisma.task.findMany({
      orderBy: {
        id: "asc",
      },
    });
    res.json(tasksFromDatabase);
  },
);

app.post("/tasks", authenticateToken, async (req: any, res: any) => {
  const { text } = req.body || {};
  if (!text || text.trim() === "") {
    return res.status(400).json({
      message: "Task text is required",
    });
  }
  const newTask = await prisma.task.create({
    data: {
      text: text,
      completed: false,
    },
  });
  res.status(201).json(newTask);
});

app.put("/tasks/:id", authenticateToken, async (req: any, res: any) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({
      message: "Invalid task ID format",
    });
  }
  const { text, completed } = req.body || {};
  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: id },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const updatedData: TaskEdit = {};

    if (text !== undefined) {
      if (text.trim() === "") {
        return res.status(400).json({ message: "Task text cannot be empty" });
      }
      updatedData.text = text;
    }

    updatedData.completed =
      completed !== undefined ? completed : !existingTask.completed;

    const updatedTask = await prisma.task.update({
      where: { id: id },
      data: updatedData,
    });

    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      message: "Internal server error occurred while updating the task",
    });
  }
});

app.delete("/tasks/:id", authenticateToken, async (req: any, res: any) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      message: "Invalid task ID format",
    });
  }

  try {
    const existingTask = await prisma.task.findUnique({
      where: { id: id },
    });

    if (!existingTask) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await prisma.task.delete({
      where: { id: id },
    });

    const currentTasks = await prisma.task.findMany({
      orderBy: { id: "asc" },
    });

    res.json({
      message: "Task deleted successfully",
      tasks: currentTasks,
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      message: "Internal server error occurred while deleting the task",
    });
  }
});

// 3. Catch-all para que React Router maneje las rutas del Frontend
app.use((req: any, res: any) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
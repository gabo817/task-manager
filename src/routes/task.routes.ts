import { Router } from "express";
import { TaskController } from "../controllers/task.controller";
import authenticateToken from "../middlewares/auth.middleware";

const router = Router();

// Aplica autenticación a todas las rutas de tareas
router.use(authenticateToken);

router.get("/", TaskController.getTasks);
router.post("/", TaskController.createTask);
router.put("/:id", TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);

export default router;
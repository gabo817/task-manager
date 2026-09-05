import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
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
      const newUser = await AuthService.registerUser(username, password);
      return res.status(201).json({
        message: "User registered successfully",
        user: newUser,
      });
    } catch (error: any) {
      if (error.message === "USER_EXISTS") {
        return res.status(400).json({ message: "Username already exists" });
      }
      console.error("Registration error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response) {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    try {
      const result = await AuthService.loginUser(username, password);
      return res.json({ message: "Login successful", ...result });
    } catch (error: any) {
      if (error.message === "INVALID_CREDENTIALS") {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
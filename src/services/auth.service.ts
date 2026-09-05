import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const secretKey = process.env.JWT_SECRET || "default_fallback_secret";

export class AuthService {
  static async registerUser(username: string, password: string) {
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existingUser) {
      throw new Error("USER_EXISTS");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return prisma.user.create({
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
  }

  static async loginUser(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (!user) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("INVALID_CREDENTIALS");
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      secretKey,
      { expiresIn: "1h" }
    );

    return { token };
  }
}
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const secretKey = "qwerty123";

interface JwtPayload {
  id: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Malformed token" });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default authenticateToken;

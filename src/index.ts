import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import apiRoutes from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Archivos estáticos de la carpeta public (Frontend)
app.use(express.static(path.join(__dirname, "../public")));

// Rutas de la API
app.use("/api", apiRoutes); // O simplemente app.use(apiRoutes); si no usas prefijo /api

// SPA Catch-all (Redirige al index.html del frontend si no coincide con ninguna ruta API)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
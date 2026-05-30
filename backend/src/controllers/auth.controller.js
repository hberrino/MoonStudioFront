import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findUsuarioByNombre } from "../models/usuario.model.js";

export async function login(req, res, next) {
  try {
    const { nombre, password } = req.body;
    const normalizedNombre = String(nombre ?? "").trim();
    const normalizedPassword = String(password ?? "");

    if (!normalizedNombre || !normalizedPassword || normalizedNombre.length > 80) {
      return res.status(400).json({ message: "Usuario y password son requeridos." });
    }

    const usuario = await findUsuarioByNombre(normalizedNombre);

    if (!usuario) {
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    const isValidPassword = await bcrypt.compare(normalizedPassword, usuario.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ message: "Credenciales invalidas." });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
      env.jwtSecret,
      { expiresIn: "8h" },
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    return next(error);
  }
}

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { generateToken } from '../utils/generateToken';
import {
  validateEmail,
  validateName,
  validatePassword,
  validateRole,
  LIMITS,
} from '../utils/validators';
import { cleanSingleLine, stripAllWhitespace } from '../utils/sanitize';
import { serializeUser } from '../utils/serialize';
import { unlockAchievements } from '../services/achievements';
import { ACHIEVEMENTS } from '../utils/achievements';

const MAX_AVATAR_SIZE = 1_500_000;

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const name = stripAllWhitespace(req.body.name);
    const email = cleanSingleLine(req.body.email, LIMITS.email).toLowerCase();
    const password = stripAllWhitespace(req.body.password);
    const role = validateRole(req.body.role);

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
      return;
    }

    const nameError = validateName(name);
    if (nameError) {
      res.status(400).json({ message: nameError });
      return;
    }
    const emailError = validateEmail(email);
    if (emailError) {
      res.status(400).json({ message: emailError });
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      res.status(400).json({ message: passwordError });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'Ya existe un usuario con este email' });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
    });

    let unlockedAchievements: Awaited<ReturnType<typeof unlockAchievements>> = [];
    if (role === 'CRITIC') {
      unlockedAchievements = await unlockAchievements(user.id, ['critic_pass']);
    }

    const fresh = await prisma.user.findUnique({ where: { id: user.id } });
    const token = generateToken(user.id, user.role);
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: serializeUser(fresh!),
      unlockedAchievements,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: String(error) });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = cleanSingleLine(req.body.email, LIMITS.email).toLowerCase();
    const password = stripAllWhitespace(req.body.password);

    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son obligatorios' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const token = generateToken(user.id, user.role);
    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error: String(error) });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.json(serializeUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error: String(error) });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      avatar?: string;
      role?: 'USER' | 'CRITIC';
    } = {};

    if (req.body.name !== undefined) {
      const name = stripAllWhitespace(req.body.name);
      const nameError = validateName(name);
      if (nameError) {
        res.status(400).json({ message: nameError });
        return;
      }
      data.name = name;
    }

    if (req.body.email !== undefined) {
      const email = cleanSingleLine(req.body.email, LIMITS.email).toLowerCase();
      if (email !== user.email) {
        const emailError = validateEmail(email);
        if (emailError) {
          res.status(400).json({ message: emailError });
          return;
        }
        const emailExists = await prisma.user.findUnique({ where: { email } });
        if (emailExists) {
          res.status(409).json({ message: 'Ya existe un usuario con este email' });
          return;
        }
        data.email = email;
      }
    }

    if (req.body.password) {
      const password = stripAllWhitespace(req.body.password);
      const passwordError = validatePassword(password);
      if (passwordError) {
        res.status(400).json({ message: passwordError });
        return;
      }
      data.password = await bcrypt.hash(password, 12);
    }

    if (req.body.avatar !== undefined) {
      const avatar = typeof req.body.avatar === 'string' ? req.body.avatar : '';
      if (avatar.length > MAX_AVATAR_SIZE) {
        res.status(400).json({ message: 'La foto de perfil es demasiado grande' });
        return;
      }
      data.avatar = avatar;
    }

    if (req.body.role !== undefined) {
      data.role = validateRole(req.body.role);
    }

    const updated = await prisma.user.update({ where: { id: user.id }, data });

    let unlockedAchievements: Awaited<ReturnType<typeof unlockAchievements>> = [];
    if (data.role === 'CRITIC') {
      unlockedAchievements = await unlockAchievements(updated.id, ['critic_pass']);
    }

    const fresh = await prisma.user.findUnique({ where: { id: updated.id } });
    const token = generateToken(fresh!.id, fresh!.role);
    res.json({
      message: 'Perfil actualizado',
      user: serializeUser(fresh!),
      token,
      unlockedAchievements,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil', error: String(error) });
  }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const rageQuit = ACHIEVEMENTS.find((a) => a.code === 'rage_quit');
    await prisma.user.delete({ where: { id: req.userId } });
    res.json({
      message: 'Cuenta y reseñas asociadas eliminadas correctamente',
      unlockedAchievements: rageQuit ? [rageQuit] : [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cuenta', error: String(error) });
  }
};

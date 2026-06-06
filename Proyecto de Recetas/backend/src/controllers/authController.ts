import { Request, Response } from 'express';
import { User } from '../models/User';
import { Recipe } from '../models/Recipe';
import { Group } from '../models/Group';
import { Rating } from '../models/Rating';
import { SavedRecipe } from '../models/SavedRecipe';
import { generateToken } from '../utils/generateToken';
import { validateEmail, validatePassword } from '../utils/validators';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios' });
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

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ message: 'Ya existe un usuario con este email' });
      return;
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son obligatorios' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error });
  }
};

const MAX_AVATAR_SIZE = 1_500_000;

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, avatar } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    if (email && email.toLowerCase() !== user.email) {
      const emailError = validateEmail(email);
      if (emailError) {
        res.status(400).json({ message: emailError });
        return;
      }
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        res.status(409).json({ message: 'Ya existe un usuario con este email' });
        return;
      }
      user.email = email.toLowerCase();
    }

    if (name) user.name = name;
    if (avatar !== undefined) {
      if (avatar && avatar.length > MAX_AVATAR_SIZE) {
        res.status(400).json({ message: 'La foto de perfil es demasiado grande' });
        return;
      }
      user.avatar = avatar || '';
    }
    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        res.status(400).json({ message: passwordError });
        return;
      }
      user.password = password;
    }

    await user.save();
    res.json({ message: 'Perfil actualizado', user });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar perfil', error });
  }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;

    await Recipe.deleteMany({ user: userId });
    await Group.deleteMany({ user: userId });
    await SavedRecipe.deleteMany({ user: userId });
    await Rating.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Cuenta y datos asociados eliminados correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar cuenta', error });
  }
};

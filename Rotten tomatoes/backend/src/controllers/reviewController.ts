import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { validateScore, LIMITS } from '../utils/validators';
import { cleanMultiLine } from '../utils/sanitize';
import { getScoresForGame } from '../utils/scores';
import { evaluateReviewAchievements } from '../services/achievements';

export const upsertReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = String(req.params.gameId);
    const score = validateScore(req.body.score);
    const content = cleanMultiLine(req.body.content, LIMITS.reviewContent);

    if (score === null) {
      res.status(400).json({ message: 'La puntuación debe ser un número entero de 1 a 10' });
      return;
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game) {
      res.status(404).json({ message: 'Juego no encontrado' });
      return;
    }

    const review = await prisma.review.upsert({
      where: { userId_gameId: { userId: req.userId!, gameId } },
      update: { score, content },
      create: { userId: req.userId!, gameId, score, content },
      include: { user: { select: { id: true, name: true, role: true, avatar: true } } },
    });

    const [scores, unlockedAchievements] = await Promise.all([
      getScoresForGame(gameId),
      evaluateReviewAchievements(req.userId!, score, content),
    ]);

    res.status(201).json({
      message: 'Reseña guardada',
      review,
      ...scores,
      unlockedAchievements,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar la reseña', error: String(error) });
  }
};

export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = String(req.params.gameId);
    const existing = await prisma.review.findUnique({
      where: { userId_gameId: { userId: req.userId!, gameId } },
    });
    if (!existing) {
      res.status(404).json({ message: 'No tienes una reseña para este juego' });
      return;
    }

    await prisma.review.delete({
      where: { userId_gameId: { userId: req.userId!, gameId } },
    });

    const scores = await getScoresForGame(gameId);
    res.json({ message: 'Reseña eliminada', ...scores });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la reseña', error: String(error) });
  }
};

export const getMyReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.userId },
      include: {
        game: {
          select: {
            id: true,
            title: true,
            coverUrl: true,
            releaseDate: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tus reseñas', error: String(error) });
  }
};

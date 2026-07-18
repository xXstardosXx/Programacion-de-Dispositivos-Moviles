-- QuestScore / Neon — crear todo de una vez
-- Pégalo en Neon → SQL Editor → Run
-- (Si ya existen tablas, bóralas primero o usa un proyecto limpio)

-- ========== ENUM ==========
CREATE TYPE "Role" AS ENUM ('USER', 'CRITIC');

-- ========== TABLAS ==========

CREATE TABLE "User" (
  "id"        TEXT PRIMARY KEY,
  "name"      VARCHAR(50)  NOT NULL,
  "email"     VARCHAR(120) NOT NULL UNIQUE,
  "password"  TEXT         NOT NULL,
  "role"      "Role"       NOT NULL DEFAULT 'USER',
  "avatar"       TEXT         NOT NULL DEFAULT '',
  "achievements" JSONB        NOT NULL DEFAULT '[]',
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Si la tabla User ya existía sin achievements:
-- ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "achievements" JSONB NOT NULL DEFAULT '[]';

CREATE TABLE "Genre" (
  "id"   INTEGER PRIMARY KEY,
  "name" VARCHAR(60) NOT NULL UNIQUE
);

CREATE TABLE "Game" (
  "id"            TEXT PRIMARY KEY,
  "rawgId"        INTEGER      NOT NULL UNIQUE,
  "title"         VARCHAR(300) NOT NULL,
  "slug"          VARCHAR(300),
  "overview"      TEXT         NOT NULL DEFAULT '',
  "releaseDate"   TIMESTAMP(3),
  "coverUrl"      TEXT,          -- solo URL, no binario
  "backgroundUrl" TEXT,
  "metacritic"    INTEGER,
  "rawgRating"    DOUBLE PRECISION,
  "playtime"      INTEGER,
  "platforms"     JSONB        NOT NULL DEFAULT '[]',
  "developers"    JSONB        NOT NULL DEFAULT '[]',
  "esrbRating"    VARCHAR(40),
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Review" (
  "id"        TEXT PRIMARY KEY,
  "score"     INTEGER      NOT NULL,
  "content"   TEXT         NOT NULL,
  "userId"    TEXT         NOT NULL,
  "gameId"    TEXT         NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Review_gameId_fkey"
    FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Review_userId_gameId_key" UNIQUE ("userId", "gameId")
);

-- Relación M-N Game ↔ Genre (nombre que usa Prisma)
CREATE TABLE "_GameGenres" (
  "A" TEXT    NOT NULL,
  "B" INTEGER NOT NULL,
  CONSTRAINT "_GameGenres_A_fkey"
    FOREIGN KEY ("A") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "_GameGenres_B_fkey"
    FOREIGN KEY ("B") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- ========== ÍNDICES ==========
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "Game_title_idx" ON "Game"("title");
CREATE INDEX "Game_releaseDate_idx" ON "Game"("releaseDate");
CREATE INDEX "Review_gameId_idx" ON "Review"("gameId");
CREATE INDEX "Review_userId_idx" ON "Review"("userId");
CREATE UNIQUE INDEX "_GameGenres_AB_unique" ON "_GameGenres"("A", "B");
CREATE INDEX "_GameGenres_B_index" ON "_GameGenres"("B");

CREATE TABLE IF NOT EXISTS "HiddenGame" (
  "id"        TEXT PRIMARY KEY,
  "userId"    TEXT NOT NULL,
  "gameId"    TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HiddenGame_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HiddenGame_gameId_fkey"
    FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "HiddenGame_userId_gameId_key"
  ON "HiddenGame"("userId", "gameId");
CREATE INDEX IF NOT EXISTS "HiddenGame_userId_idx" ON "HiddenGame"("userId");
CREATE INDEX IF NOT EXISTS "HiddenGame_gameId_idx" ON "HiddenGame"("gameId");

-- ========== SEED GÉNEROS RAWG ==========
INSERT INTO "Genre" ("id", "name") VALUES
  (4,  'Action'),
  (51, 'Indie'),
  (3,  'Adventure'),
  (5,  'RPG'),
  (10, 'Strategy'),
  (2,  'Shooter'),
  (40, 'Casual'),
  (14, 'Simulation'),
  (7,  'Puzzle'),
  (11, 'Arcade'),
  (83, 'Platformer'),
  (1,  'Racing'),
  (59, 'Massively Multiplayer'),
  (15, 'Sports'),
  (6,  'Fighting'),
  (19, 'Family'),
  (28, 'Board Games'),
  (34, 'Educational'),
  (17, 'Card')
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name";

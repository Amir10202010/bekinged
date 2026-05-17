-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "eloChange" INTEGER,
ADD COLUMN     "mode" TEXT NOT NULL DEFAULT 'ai';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

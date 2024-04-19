/*
  Warnings:

  - You are about to drop the column `hasTwoPlayers` on the `Game` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GameStatus" ADD VALUE 'MATCHED';
ALTER TYPE "GameStatus" ADD VALUE 'NO_MATCH';

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "hasTwoPlayers";

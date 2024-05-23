/*
  Warnings:

  - A unique constraint covering the columns `[gameId,moveNumber]` on the table `Move` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Move_gameId_moveNumber_key" ON "Move"("gameId", "moveNumber");

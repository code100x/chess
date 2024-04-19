/*
  Warnings:

  - You are about to drop the column `notation` on the `Move` table. All the data in the column will be lost.
  - Added the required column `from` to the `Move` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `Move` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Move" DROP COLUMN "notation",
ADD COLUMN     "from" TEXT NOT NULL,
ADD COLUMN     "to" TEXT NOT NULL;

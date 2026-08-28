/*
  Warnings:

  - You are about to drop the `VideoPokerRound` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VideoPokerRound" DROP CONSTRAINT "VideoPokerRound_userId_fkey";

-- DropTable
DROP TABLE "VideoPokerRound";

-- CreateTable
CREATE TABLE "HoldemRound" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stake" INTEGER NOT NULL,
    "deck" TEXT NOT NULL,
    "street" TEXT NOT NULL DEFAULT 'preflop',
    "revealedCount" INTEGER NOT NULL DEFAULT 0,
    "pot" INTEGER NOT NULL DEFAULT 0,
    "playerCommitted" INTEGER NOT NULL DEFAULT 0,
    "botCommitted" INTEGER NOT NULL DEFAULT 0,
    "toCall" INTEGER NOT NULL DEFAULT 0,
    "raisesThisStreet" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "serverSeed" TEXT NOT NULL,
    "clientSeed" TEXT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HoldemRound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HoldemRound" ADD CONSTRAINT "HoldemRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

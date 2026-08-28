-- AlterTable
ALTER TABLE "BlackjackRound" ADD COLUMN     "activeHand" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "handABust" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "handADone" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "splitCards" TEXT;

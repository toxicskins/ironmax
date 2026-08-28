-- CreateTable
CREATE TABLE "VideoPokerRound" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stake" INTEGER NOT NULL,
    "deck" TEXT NOT NULL,
    "hand" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "serverSeed" TEXT NOT NULL,
    "clientSeed" TEXT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoPokerRound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VideoPokerRound" ADD CONSTRAINT "VideoPokerRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

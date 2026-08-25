-- CreateTable
CREATE TABLE "BlackjackRound" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stake" INTEGER NOT NULL,
    "deck" TEXT NOT NULL,
    "drawIndex" INTEGER NOT NULL DEFAULT 4,
    "playerCards" TEXT NOT NULL,
    "dealerCards" TEXT NOT NULL,
    "doubled" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "serverSeed" TEXT NOT NULL,
    "clientSeed" TEXT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlackjackRound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BlackjackRound" ADD CONSTRAINT "BlackjackRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

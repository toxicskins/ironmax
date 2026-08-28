-- CreateTable
CREATE TABLE "BaccaratRound" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stake" INTEGER NOT NULL,
    "deck" TEXT NOT NULL,
    "playerCards" TEXT NOT NULL,
    "bankerCards" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "serverSeed" TEXT NOT NULL,
    "clientSeed" TEXT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BaccaratRound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BaccaratRound" ADD CONSTRAINT "BaccaratRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "MinesRound" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stake" INTEGER NOT NULL,
    "mineCount" INTEGER NOT NULL,
    "grid" TEXT NOT NULL,
    "revealed" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "serverSeed" TEXT NOT NULL,
    "clientSeed" TEXT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MinesRound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MinesRound" ADD CONSTRAINT "MinesRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

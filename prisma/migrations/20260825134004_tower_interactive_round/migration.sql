-- CreateTable
CREATE TABLE "TowerRound" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stake" INTEGER NOT NULL,
    "tilesPerRow" INTEGER NOT NULL,
    "safeTiles" INTEGER NOT NULL,
    "rows" INTEGER NOT NULL DEFAULT 8,
    "layout" TEXT NOT NULL,
    "climbed" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "serverSeed" TEXT NOT NULL,
    "clientSeed" TEXT NOT NULL,
    "nonce" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TowerRound_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TowerRound" ADD CONSTRAINT "TowerRound_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

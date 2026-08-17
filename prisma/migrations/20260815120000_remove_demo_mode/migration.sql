-- Fold any remaining demo balance into the real balance before dropping demoCoins, so no
-- player loses points they could see in their account.
UPDATE "Wallet" SET "coins" = "coins" + "demoCoins" WHERE "demoCoins" > 0;

ALTER TABLE "Wallet" DROP COLUMN "demoCoins";
ALTER TABLE "Bet" DROP COLUMN "isDemo";

-- Drop DEMO_GRANT from TxType enum (no rows use it) by recreating the enum.
ALTER TYPE "TxType" RENAME TO "TxType_old";
CREATE TYPE "TxType" AS ENUM ('DEPOSIT', 'BET', 'WIN', 'ADMIN_ADJUST');
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TxType" USING ("type"::text::"TxType");
DROP TYPE "TxType_old";

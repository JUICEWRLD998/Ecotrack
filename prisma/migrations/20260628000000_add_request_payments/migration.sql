CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED');

ALTER TABLE "WasteRequest"
ADD COLUMN "paymentAmount" INTEGER,
ADD COLUMN "paymentReceiptUrl" TEXT,
ADD COLUMN "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
ADD COLUMN "paymentSubmittedAt" TIMESTAMP(3),
ADD COLUMN "paymentVerifiedAt" TIMESTAMP(3),
ADD COLUMN "paymentVerifiedById" TEXT,
ADD COLUMN "paymentRejectionReason" TEXT;

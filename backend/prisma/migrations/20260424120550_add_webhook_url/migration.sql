-- AlterTable
ALTER TABLE "User" ADD COLUMN     "webhookUrl" TEXT DEFAULT 'https://n8n.your-instance.com/webhook/crm-alerts';

-- AlterTable
ALTER TABLE `Project` MODIFY `status` ENUM('active', 'archived', 'paused', 'expired', 'deleted') NOT NULL;

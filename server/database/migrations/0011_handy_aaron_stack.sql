ALTER TABLE `configuracoes_whatsapp` ADD `instance_url` text NOT NULL;--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` DROP COLUMN `phone_number`;--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` DROP COLUMN `webhook_url`;--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` DROP COLUMN `webhook_verify_token`;--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` DROP COLUMN `client_name`;--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` DROP COLUMN `include_media`;--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` DROP COLUMN `sync_full_history`;
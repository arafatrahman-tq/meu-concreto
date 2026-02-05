CREATE TABLE `configuracoes_whatsapp` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phone_number` text NOT NULL,
	`webhook_url` text NOT NULL,
	`webhook_verify_token` text NOT NULL,
	`client_name` text,
	`api_key` text NOT NULL,
	`include_media` integer DEFAULT 1,
	`sync_full_history` integer DEFAULT 0,
	`updated_at` integer
);
--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `data_entrega` integer;
CREATE TABLE `configuracoes_sicoob` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_id` text NOT NULL,
	`client_secret` text,
	`certificate` text,
	`private_key` text,
	`environment` text DEFAULT 'sandbox' NOT NULL,
	`chave_pix` text,
	`conta_corrente` text,
	`cooperativa` text,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configuracoes_sicoob_id_empresa_unique` ON `configuracoes_sicoob` (`id_empresa`);--> statement-breakpoint
ALTER TABLE `pagamentos` ADD `sicoob_id` text;--> statement-breakpoint
ALTER TABLE `pagamentos` ADD `sicoob_qrcode` text;
CREATE TABLE `configuracoes_nuvem_fiscal` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`client_id` text NOT NULL,
	`client_secret` text NOT NULL,
	`environment` text DEFAULT 'sandbox' NOT NULL,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configuracoes_nuvem_fiscal_id_empresa_unique` ON `configuracoes_nuvem_fiscal` (`id_empresa`);--> statement-breakpoint
CREATE TABLE `configuracoes_pix_manual` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chave_pix` text NOT NULL,
	`beneficiario` text NOT NULL,
	`cidade` text NOT NULL,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configuracoes_pix_manual_id_empresa_unique` ON `configuracoes_pix_manual` (`id_empresa`);
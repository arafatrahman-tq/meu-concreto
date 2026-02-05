CREATE TABLE `configuracoes_bling` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`api_key` text NOT NULL,
	`client_id` text,
	`client_secret` text,
	`access_token` text,
	`refresh_token` text,
	`token_expires_at` integer,
	`id_deposito` text,
	`id_categoria` text,
	`natureza_operacao` text,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configuracoes_bling_id_empresa_unique` ON `configuracoes_bling` (`id_empresa`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_configuracoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chave` text NOT NULL,
	`valor` text NOT NULL,
	`descricao` text,
	`categoria` text DEFAULT 'GERAL',
	`id_empresa` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_configuracoes`("id", "chave", "valor", "descricao", "categoria", "id_empresa", "updated_at") SELECT "id", "chave", "valor", "descricao", "categoria", "id_empresa", "updated_at" FROM `configuracoes`;--> statement-breakpoint
DROP TABLE `configuracoes`;--> statement-breakpoint
ALTER TABLE `__new_configuracoes` RENAME TO `configuracoes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_configuracoes_asaas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`api_key` text NOT NULL,
	`environment` text DEFAULT 'sandbox' NOT NULL,
	`webhook_token` text,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_configuracoes_asaas`("id", "api_key", "environment", "webhook_token", "ativo", "id_empresa", "updated_at") SELECT "id", "api_key", "environment", "webhook_token", "ativo", "id_empresa", "updated_at" FROM `configuracoes_asaas`;--> statement-breakpoint
DROP TABLE `configuracoes_asaas`;--> statement-breakpoint
ALTER TABLE `__new_configuracoes_asaas` RENAME TO `configuracoes_asaas`;--> statement-breakpoint
CREATE UNIQUE INDEX `configuracoes_asaas_id_empresa_unique` ON `configuracoes_asaas` (`id_empresa`);--> statement-breakpoint
CREATE TABLE `__new_forma_pgto` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`forma_pagamento` text NOT NULL,
	`dias` text NOT NULL,
	`tipo_asaas` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
INSERT INTO `__new_forma_pgto`("id", "forma_pagamento", "dias", "tipo_asaas", "created_at", "updated_at", "deleted_at") SELECT "id", "forma_pagamento", "dias", "tipo_asaas", "created_at", "updated_at", "deleted_at" FROM `forma_pgto`;--> statement-breakpoint
DROP TABLE `forma_pgto`;--> statement-breakpoint
ALTER TABLE `__new_forma_pgto` RENAME TO `forma_pgto`;--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` ADD `ativo` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` ADD `id_empresa` integer NOT NULL REFERENCES empresas(id);--> statement-breakpoint
CREATE UNIQUE INDEX `configuracoes_whatsapp_id_empresa_unique` ON `configuracoes_whatsapp` (`id_empresa`);
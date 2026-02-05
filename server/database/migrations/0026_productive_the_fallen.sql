CREATE TABLE `bombas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`tipo` text DEFAULT 'LANCA' NOT NULL,
	`placa` text,
	`descricao` text,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `id_bomba` integer REFERENCES bombas(id);--> statement-breakpoint
CREATE UNIQUE INDEX `config_empresa_chave_idx` ON `configuracoes` (`id_empresa`,`chave`);
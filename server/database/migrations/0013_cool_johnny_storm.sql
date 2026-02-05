CREATE TABLE `caminhoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`placa` text NOT NULL,
	`modelo` text,
	`capacidade` real NOT NULL,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `caminhoes_placa_unique` ON `caminhoes` (`placa`);--> statement-breakpoint
CREATE TABLE `motoristas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`telefone` text,
	`cnh` text,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `id_motorista` integer REFERENCES motoristas(id);--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `id_caminhao` integer REFERENCES caminhoes(id);
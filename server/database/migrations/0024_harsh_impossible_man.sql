CREATE TABLE `insumos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`unidade_medida` text NOT NULL,
	`estoque_atual` real DEFAULT 0,
	`estoque_minimo` real DEFAULT 0,
	`custo_unitario` integer,
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `traco_itens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_traco` integer NOT NULL,
	`id_insumo` integer NOT NULL,
	`quantidade` real NOT NULL,
	FOREIGN KEY (`id_traco`) REFERENCES `tracos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_insumo`) REFERENCES `insumos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tracos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_produto` integer NOT NULL,
	`nome` text NOT NULL,
	`descricao` text,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_produto`) REFERENCES `produtos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `orcamentos` DROP COLUMN `distancia_real`;
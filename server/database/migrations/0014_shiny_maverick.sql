CREATE TABLE `configuracoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`chave` text NOT NULL,
	`valor` text NOT NULL,
	`descricao` text,
	`categoria` text DEFAULT 'GERAL',
	`id_empresa` integer,
	`updated_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `configuracoes_chave_unique` ON `configuracoes` (`chave`);--> statement-breakpoint
ALTER TABLE `motoristas` ADD `id_caminhao` integer REFERENCES caminhoes(id);--> statement-breakpoint
ALTER TABLE `vendedores` ADD `pin` text;--> statement-breakpoint
CREATE UNIQUE INDEX `vendedores_pin_unique` ON `vendedores` (`pin`);
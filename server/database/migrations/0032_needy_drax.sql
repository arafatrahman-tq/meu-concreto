CREATE TABLE `ordens_servico` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_orcamento` integer NOT NULL,
	`numero_ticket` text,
	`qtd` real NOT NULL,
	`slump` integer,
	`lacre` text,
	`id_motorista` integer,
	`id_caminhao` integer,
	`id_bomba` integer,
	`status` text DEFAULT 'AGUARDANDO_SAIDA',
	`data_saida` integer,
	`id_empresa` integer NOT NULL,
	`obs` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	FOREIGN KEY (`id_orcamento`) REFERENCES `orcamentos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_motorista`) REFERENCES `motoristas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_caminhao`) REFERENCES `caminhoes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_bomba`) REFERENCES `bombas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `entrega_eventos` ADD `id_ordem_servico` integer REFERENCES ordens_servico(id);
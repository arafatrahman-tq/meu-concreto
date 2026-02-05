CREATE TABLE `orcamento_itens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_orcamento` integer NOT NULL,
	`id_produto` integer NOT NULL,
	`produto_nome` text NOT NULL,
	`qtd` real NOT NULL,
	`valor_unit` integer NOT NULL,
	`total` integer NOT NULL,
	FOREIGN KEY (`id_orcamento`) REFERENCES `orcamentos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_produto`) REFERENCES `produtos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `valor_bomba` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `valor_desconto` integer DEFAULT 0;
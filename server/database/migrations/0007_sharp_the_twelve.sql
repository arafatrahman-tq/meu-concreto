CREATE TABLE `pagamentos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_venda` integer NOT NULL,
	`valor` integer NOT NULL,
	`data_vencimento` integer NOT NULL,
	`data_pagamento` integer,
	`status` text DEFAULT 'PENDENTE',
	`metodo` text,
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_venda`) REFERENCES `vendas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `vendas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_orcamento` integer NOT NULL,
	`data_venda` integer DEFAULT (strftime('%s', 'now')),
	`valor_total` integer NOT NULL,
	`status` text DEFAULT 'ABERTA',
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_orcamento`) REFERENCES `orcamentos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);

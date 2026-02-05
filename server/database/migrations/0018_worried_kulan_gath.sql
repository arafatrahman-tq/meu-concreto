CREATE TABLE `contas_pagar` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`descricao` text NOT NULL,
	`valor` integer NOT NULL,
	`data_vencimento` integer NOT NULL,
	`data_pagamento` integer,
	`status` text DEFAULT 'PENDENTE',
	`id_fornecedor` integer,
	`categoria` text DEFAULT 'GERAL',
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_fornecedor`) REFERENCES `fornecedores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `fornecedores` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`contato` text,
	`cnpj` text,
	`telefone` text,
	`email` text,
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);

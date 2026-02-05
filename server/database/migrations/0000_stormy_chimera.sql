CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`cpf_cnpj` text NOT NULL,
	`endereco` text,
	`endereco_entrega` text,
	`bairro` text,
	`cidade` text,
	`cep` text,
	`estado` text,
	`telefone` text,
	`email` text,
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_cpf_cnpj_unique` ON `clientes` (`cpf_cnpj`);--> statement-breakpoint
CREATE TABLE `empresas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`empresa` text NOT NULL,
	`cnpj` text NOT NULL,
	`ie` text,
	`endereco` text,
	`bairro` text,
	`telefone` text,
	`email` text,
	`filial` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `empresas_cnpj_unique` ON `empresas` (`cnpj`);
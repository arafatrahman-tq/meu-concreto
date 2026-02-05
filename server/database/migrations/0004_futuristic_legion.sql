CREATE TABLE `produtos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`produto` text NOT NULL,
	`valor_custo` integer,
	`valor_venda` integer,
	`fck` text,
	`slump` integer,
	`brita_tipo` text,
	`aditivo` text,
	`unidade_medida` text DEFAULT 'm³',
	`descricao` text,
	`ativo` integer DEFAULT 1,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer
);

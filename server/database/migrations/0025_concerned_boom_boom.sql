CREATE TABLE `insumos_movimentacoes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_insumo` integer NOT NULL,
	`tipo` text NOT NULL,
	`quantidade` real NOT NULL,
	`origem` text,
	`id_referencia` text,
	`id_usuario` text NOT NULL,
	`id_empresa` integer NOT NULL,
	`observacao` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`id_insumo`) REFERENCES `insumos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);

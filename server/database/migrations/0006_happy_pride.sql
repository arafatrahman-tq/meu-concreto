CREATE TABLE `logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT (strftime('%s', 'now')),
	`nivel` text NOT NULL,
	`modulo` text NOT NULL,
	`mensagem` text NOT NULL,
	`dados` text,
	`id_usuario` integer,
	`id_empresa` integer,
	`ip` text,
	`user_agent` text,
	FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);

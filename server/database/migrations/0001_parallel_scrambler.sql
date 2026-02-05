CREATE TABLE `usuarios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nome` text NOT NULL,
	`usuario` text NOT NULL,
	`email` text NOT NULL,
	`whatsapp` text,
	`senha` text NOT NULL,
	`admin` integer DEFAULT 0,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_usuario_unique` ON `usuarios` (`usuario`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);
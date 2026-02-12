CREATE TABLE `permissoes_menu_auditoria` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_usuario` text NOT NULL,
	`id_usuario_alterado_por` text NOT NULL,
	`id_empresa` integer NOT NULL,
	`permissoes_antes` text NOT NULL,
	`permissoes_depois` text NOT NULL,
	`tipo_alteracao` text NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_usuario_alterado_por`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `perm_menu_aud_usuario_idx` ON `permissoes_menu_auditoria` (`id_usuario`);--> statement-breakpoint
CREATE INDEX `perm_menu_aud_empresa_idx` ON `permissoes_menu_auditoria` (`id_empresa`);--> statement-breakpoint
CREATE INDEX `perm_menu_aud_created_idx` ON `permissoes_menu_auditoria` (`created_at`);
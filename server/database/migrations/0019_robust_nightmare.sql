CREATE TABLE `usuarios_empresas` (
	`id_usuario` integer NOT NULL,
	`id_empresa` integer NOT NULL,
	PRIMARY KEY(`id_usuario`, `id_empresa`),
	FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` ADD `notifica_contas_pagar` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` ADD `notifica_cobrancas` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `configuracoes_whatsapp` ADD `notifica_novos_orcamentos` integer DEFAULT 0;
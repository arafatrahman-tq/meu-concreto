CREATE TABLE `entrega_eventos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_orcamento` integer NOT NULL,
	`tipo` text NOT NULL,
	`timestamp` integer DEFAULT (strftime('%s', 'now')),
	`lat` text,
	`lng` text,
	`id_usuario` integer,
	`obs` text,
	FOREIGN KEY (`id_orcamento`) REFERENCES `orcamentos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `distancia_real` real;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `tempo_ciclo_total` integer;
CREATE TABLE `configuracoes_asaas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`api_key` text NOT NULL,
	`environment` text DEFAULT 'sandbox' NOT NULL,
	`webhook_token` text,
	`ativo` integer DEFAULT 1,
	`id_empresa` integer,
	`updated_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_entrega_eventos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_orcamento` integer NOT NULL,
	`tipo` text NOT NULL,
	`timestamp` integer DEFAULT (strftime('%s', 'now')),
	`lat` text,
	`lng` text,
	`id_usuario` text,
	`obs` text,
	FOREIGN KEY (`id_orcamento`) REFERENCES `orcamentos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_entrega_eventos`("id", "id_orcamento", "tipo", "timestamp", "lat", "lng", "id_usuario", "obs") SELECT "id", "id_orcamento", "tipo", "timestamp", "lat", "lng", "id_usuario", "obs" FROM `entrega_eventos`;--> statement-breakpoint
DROP TABLE `entrega_eventos`;--> statement-breakpoint
ALTER TABLE `__new_entrega_eventos` RENAME TO `entrega_eventos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`timestamp` integer DEFAULT (strftime('%s', 'now')),
	`nivel` text NOT NULL,
	`modulo` text NOT NULL,
	`mensagem` text NOT NULL,
	`dados` text,
	`id_usuario` text,
	`id_empresa` integer,
	`ip` text,
	`user_agent` text,
	FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_logs`("id", "timestamp", "nivel", "modulo", "mensagem", "dados", "id_usuario", "id_empresa", "ip", "user_agent") SELECT "id", "timestamp", "nivel", "modulo", "mensagem", "dados", "id_usuario", "id_empresa", "ip", "user_agent" FROM `logs`;--> statement-breakpoint
DROP TABLE `logs`;--> statement-breakpoint
ALTER TABLE `__new_logs` RENAME TO `logs`;--> statement-breakpoint
CREATE TABLE `__new_orcamentos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id_cliente` integer,
	`nome_cliente` text NOT NULL,
	`cpf_cnpj` text,
	`endereco` text,
	`endereco_entrega` text,
	`bairro` text,
	`cidade` text,
	`cep` text,
	`estado` text,
	`telefone` text,
	`email` text,
	`id_produto` integer NOT NULL,
	`produto_nome` text NOT NULL,
	`qtd` real NOT NULL,
	`valor_unit` integer NOT NULL,
	`total` integer NOT NULL,
	`id_vendedor` integer NOT NULL,
	`id_forma_pgto` integer NOT NULL,
	`id_empresa` integer NOT NULL,
	`id_usuario` text NOT NULL,
	`data_orcamento` integer DEFAULT (strftime('%s', 'now')),
	`validade_orcamento` integer,
	`data_entrega` integer,
	`distancia_obra` real,
	`id_motorista` integer,
	`id_caminhao` integer,
	`bomba_necessaria` integer DEFAULT 0,
	`valor_bomba` integer DEFAULT 0,
	`valor_desconto` integer DEFAULT 0,
	`status` text DEFAULT 'PENDENTE',
	`lacre` text,
	`distancia_real` real,
	`tempo_ciclo_total` integer,
	`obs` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_cliente`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_produto`) REFERENCES `produtos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_vendedor`) REFERENCES `vendedores`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_forma_pgto`) REFERENCES `forma_pgto`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_motorista`) REFERENCES `motoristas`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_caminhao`) REFERENCES `caminhoes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orcamentos`("id", "id_cliente", "nome_cliente", "cpf_cnpj", "endereco", "endereco_entrega", "bairro", "cidade", "cep", "estado", "telefone", "email", "id_produto", "produto_nome", "qtd", "valor_unit", "total", "id_vendedor", "id_forma_pgto", "id_empresa", "id_usuario", "data_orcamento", "validade_orcamento", "data_entrega", "distancia_obra", "id_motorista", "id_caminhao", "bomba_necessaria", "valor_bomba", "valor_desconto", "status", "lacre", "distancia_real", "tempo_ciclo_total", "obs", "created_at", "updated_at", "deleted_at") SELECT "id", "id_cliente", "nome_cliente", "cpf_cnpj", "endereco", "endereco_entrega", "bairro", "cidade", "cep", "estado", "telefone", "email", "id_produto", "produto_nome", "qtd", "valor_unit", "total", "id_vendedor", "id_forma_pgto", "id_empresa", "id_usuario", "data_orcamento", "validade_orcamento", "data_entrega", "distancia_obra", "id_motorista", "id_caminhao", "bomba_necessaria", "valor_bomba", "valor_desconto", "status", "lacre", "distancia_real", "tempo_ciclo_total", "obs", "created_at", "updated_at", "deleted_at" FROM `orcamentos`;--> statement-breakpoint
DROP TABLE `orcamentos`;--> statement-breakpoint
ALTER TABLE `__new_orcamentos` RENAME TO `orcamentos`;--> statement-breakpoint
CREATE TABLE `__new_usuarios` (
	`id` text PRIMARY KEY NOT NULL,
	`nome` text NOT NULL,
	`usuario` text NOT NULL,
	`email` text NOT NULL,
	`whatsapp` text,
	`senha` text NOT NULL,
	`admin` integer DEFAULT 0,
	`ativo` integer DEFAULT 1,
	`password_change_required` integer DEFAULT 1,
	`id_empresa` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_usuarios`("id", "nome", "usuario", "email", "whatsapp", "senha", "admin", "ativo", "password_change_required", "id_empresa", "created_at", "updated_at", "deleted_at") SELECT "id", "nome", "usuario", "email", "whatsapp", "senha", "admin", "ativo", "password_change_required", "id_empresa", "created_at", "updated_at", "deleted_at" FROM `usuarios`;--> statement-breakpoint
DROP TABLE `usuarios`;--> statement-breakpoint
ALTER TABLE `__new_usuarios` RENAME TO `usuarios`;--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_usuario_unique` ON `usuarios` (`usuario`);--> statement-breakpoint
CREATE UNIQUE INDEX `usuarios_email_unique` ON `usuarios` (`email`);--> statement-breakpoint
CREATE TABLE `__new_usuarios_empresas` (
	`id_usuario` text NOT NULL,
	`id_empresa` integer NOT NULL,
	PRIMARY KEY(`id_usuario`, `id_empresa`),
	FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`id_empresa`) REFERENCES `empresas`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_usuarios_empresas`("id_usuario", "id_empresa") SELECT "id_usuario", "id_empresa" FROM `usuarios_empresas`;--> statement-breakpoint
DROP TABLE `usuarios_empresas`;--> statement-breakpoint
ALTER TABLE `__new_usuarios_empresas` RENAME TO `usuarios_empresas`;--> statement-breakpoint
ALTER TABLE `forma_pgto` ADD `tipo_asaas` text;--> statement-breakpoint
ALTER TABLE `pagamentos` ADD `asaas_id` text;--> statement-breakpoint
ALTER TABLE `pagamentos` ADD `asaas_url` text;
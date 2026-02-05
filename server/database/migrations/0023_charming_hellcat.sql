DROP INDEX `clientes_cpf_cnpj_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `cliente_empresa_cpf_idx` ON `clientes` (`id_empresa`,`cpf_cnpj`);--> statement-breakpoint
CREATE INDEX `cliente_empresa_idx` ON `clientes` (`id_empresa`);
DROP INDEX `motoristas_pin_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `motorista_empresa_pin_idx` ON `motoristas` (`id_empresa`,`pin`);--> statement-breakpoint
CREATE INDEX `motorista_empresa_idx` ON `motoristas` (`id_empresa`);--> statement-breakpoint
DROP INDEX `vendedores_pin_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `vendedor_empresa_pin_idx` ON `vendedores` (`id_empresa`,`pin`);--> statement-breakpoint
CREATE INDEX `vendedor_empresa_idx` ON `vendedores` (`id_empresa`);--> statement-breakpoint
ALTER TABLE `logs` ADD `origem` text;--> statement-breakpoint
CREATE INDEX `contapag_empresa_idx` ON `contas_pagar` (`id_empresa`);--> statement-breakpoint
CREATE INDEX `contapag_vencimento_idx` ON `contas_pagar` (`data_vencimento`);--> statement-breakpoint
CREATE INDEX `contapag_status_idx` ON `contas_pagar` (`status`);--> statement-breakpoint
CREATE INDEX `orcamento_empresa_idx` ON `orcamentos` (`id_empresa`);--> statement-breakpoint
CREATE INDEX `orcamento_status_idx` ON `orcamentos` (`status`);--> statement-breakpoint
CREATE INDEX `orcamento_cliente_idx` ON `orcamentos` (`id_cliente`);--> statement-breakpoint
CREATE INDEX `pagamento_empresa_idx` ON `pagamentos` (`id_empresa`);--> statement-breakpoint
CREATE INDEX `pagamento_vencimento_idx` ON `pagamentos` (`data_vencimento`);--> statement-breakpoint
CREATE INDEX `pagamento_status_idx` ON `pagamentos` (`status`);
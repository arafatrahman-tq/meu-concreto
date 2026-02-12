CREATE INDEX `empresa_deleted_idx` ON `empresas` (`id`,`deleted_at`);--> statement-breakpoint
CREATE INDEX `orcamento_empresa_deleted_idx` ON `orcamentos` (`id_empresa`,`deleted_at`);--> statement-breakpoint
CREATE INDEX `pagamento_empresa_deleted_idx` ON `pagamentos` (`id_empresa`,`deleted_at`);--> statement-breakpoint
CREATE INDEX `usuario_empresa_deleted_idx` ON `usuarios` (`id_empresa`,`deleted_at`);--> statement-breakpoint
CREATE INDEX `vendas_real_venda_empresa_deleted_idx` ON `vendas` (`id_empresa`,`deleted_at`);
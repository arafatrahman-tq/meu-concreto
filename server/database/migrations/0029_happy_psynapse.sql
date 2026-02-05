ALTER TABLE `clientes` ADD `numero` text;--> statement-breakpoint
ALTER TABLE `clientes` ADD `complemento` text;--> statement-breakpoint
ALTER TABLE `clientes` ADD `cidade_ibge` text;--> statement-breakpoint
ALTER TABLE `empresas` ADD `numero` text;--> statement-breakpoint
ALTER TABLE `empresas` ADD `complemento` text;--> statement-breakpoint
ALTER TABLE `empresas` ADD `cidade` text;--> statement-breakpoint
ALTER TABLE `empresas` ADD `estado` text;--> statement-breakpoint
ALTER TABLE `empresas` ADD `cep` text;--> statement-breakpoint
ALTER TABLE `empresas` ADD `cidade_ibge` text;--> statement-breakpoint
ALTER TABLE `empresas` ADD `crt` integer DEFAULT 1;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `numero` text;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `complemento` text;--> statement-breakpoint
ALTER TABLE `orcamentos` ADD `cidade_ibge` text;--> statement-breakpoint
ALTER TABLE `produtos` ADD `ncm` text DEFAULT '38245000';--> statement-breakpoint
ALTER TABLE `produtos` ADD `cfop` text DEFAULT '5101';--> statement-breakpoint
ALTER TABLE `produtos` ADD `origem` integer DEFAULT 0;
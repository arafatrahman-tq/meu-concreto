CREATE TABLE `forma_pgto` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`forma_pagamento` text NOT NULL,
	`dias` integer NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`updated_at` integer,
	`deleted_at` integer
);

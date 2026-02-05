ALTER TABLE `motoristas` ADD `pin` text;--> statement-breakpoint
CREATE UNIQUE INDEX `motoristas_pin_unique` ON `motoristas` (`pin`);
CREATE TABLE `menu_abonnes` (
	`email` text PRIMARY KEY NOT NULL,
	`source` text,
	`created_at` text NOT NULL,
	`confirmed_at` text,
	`stopped_at` text,
	`last_week` text
);

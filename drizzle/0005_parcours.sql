CREATE TABLE `parcours` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text NOT NULL,
	`visitor` text NOT NULL,
	`kind` text NOT NULL,
	`view` text,
	`path` text NOT NULL,
	`detail` text,
	`seconds` integer DEFAULT 0 NOT NULL,
	`scroll` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_parcours_day_visitor` ON `parcours` (`day`,`visitor`);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_parcours_view` ON `parcours` (`visitor`,`view`);

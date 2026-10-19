CREATE TABLE `avis` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`day` text NOT NULL,
	`visitor` text NOT NULL,
	`question` text NOT NULL,
	`choix` text,
	`texte` text,
	`membre` integer DEFAULT 0 NOT NULL,
	`version` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_avis_visiteur` ON `avis` (`day`,`visitor`,`question`);

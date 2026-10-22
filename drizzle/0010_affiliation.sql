CREATE TABLE `affiliation_sites` (
	`site` text PRIMARY KEY NOT NULL,
	`nom` text,
	`theme` text,
	`source` text NOT NULL,
	`trouve_le` text NOT NULL,
	`verifie_le` text,
	`ok` integer,
	`raison` text,
	`titre` text,
	`email` text,
	`contact` text
);
--> statement-breakpoint
CREATE INDEX `affiliation_a_visiter` ON `affiliation_sites` (`verifie_le`,`trouve_le`);

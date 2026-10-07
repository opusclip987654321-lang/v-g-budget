ALTER TABLE `members` ADD `reminders` integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE `members` ADD `reminder_week` text;

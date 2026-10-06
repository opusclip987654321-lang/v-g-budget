CREATE TABLE `billing_events` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`post` text NOT NULL,
	`owner` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_comments_post_created` ON `comments` (`post`,`created_at`);--> statement-breakpoint
CREATE TABLE `likes` (
	`post` text NOT NULL,
	`owner` text NOT NULL,
	PRIMARY KEY(`post`, `owner`),
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `members` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`nickname` text NOT NULL,
	`state` text NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`customer` text,
	`subscription` text,
	`subscription_status` text DEFAULT 'none' NOT NULL,
	`billing_event_time` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`storage_key` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`owner` text NOT NULL,
	`content` text NOT NULL,
	`category` text NOT NULL,
	`photo` text,
	`status` text DEFAULT 'visible' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`photo`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_posts_status_created` ON `posts` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_posts_owner_created` ON `posts` (`owner`,`created_at`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`post` text NOT NULL,
	`owner` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`post`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_reports_post` ON `reports` (`post`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `waitlist` (
	`owner` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`owner`) REFERENCES `members`(`id`) ON UPDATE no action ON DELETE cascade
);

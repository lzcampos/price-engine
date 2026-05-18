CREATE TABLE `creators` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`niche` text NOT NULL,
	`years_active_ugc` real NOT NULL,
	`created_at` integer NOT NULL
);

CREATE TABLE `creator_platform_metrics` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_id` text NOT NULL,
	`platform` text NOT NULL,
	`audience_size` integer NOT NULL,
	`engagement_rate_approx` real NOT NULL,
	FOREIGN KEY (`creator_id`) REFERENCES `creators`(`id`) ON UPDATE no action ON DELETE cascade
);

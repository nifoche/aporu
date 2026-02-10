CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'booking' NOT NULL,
	`booking_page_id` text,
	`proposal_group_id` text,
	`host_user_id` text NOT NULL,
	`guest_name` text NOT NULL,
	`guest_email` text NOT NULL,
	`guest_company` text,
	`guest_phone` text,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`meeting_url` text,
	`calendar_event_id` text,
	`location` text,
	`notes` text,
	`custom_values` text DEFAULT '{}' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`booking_page_id`) REFERENCES `booking_pages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`proposal_group_id`) REFERENCES `proposal_groups`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`host_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `booking_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`user_id` text,
	`team_id` text,
	`duration` integer DEFAULT 30 NOT NULL,
	`buffer_before` integer DEFAULT 0 NOT NULL,
	`buffer_after` integer DEFAULT 0 NOT NULL,
	`min_notice` integer DEFAULT 60 NOT NULL,
	`max_days_ahead` integer DEFAULT 30 NOT NULL,
	`available_hours` text DEFAULT '{}' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`custom_fields` text DEFAULT '[]' NOT NULL,
	`allow_guest_cancel` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `booking_pages_slug_unique` ON `booking_pages` (`slug`);--> statement-breakpoint
CREATE TABLE `proposal_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`host_user_id` text NOT NULL,
	`guest_name` text,
	`guest_email` text,
	`duration` integer DEFAULT 60 NOT NULL,
	`location` text,
	`notes` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`expires_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`host_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `proposal_groups_slug_unique` ON `proposal_groups` (`slug`);--> statement-breakpoint
CREATE TABLE `proposal_slots` (
	`id` text PRIMARY KEY NOT NULL,
	`proposal_group_id` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`is_selected` integer DEFAULT false NOT NULL,
	`calendar_hold_event_id` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`proposal_group_id`) REFERENCES `proposal_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`appointment_id` text NOT NULL,
	`send_at` text NOT NULL,
	`sent` integer DEFAULT false NOT NULL,
	`sent_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`appointment_id`) REFERENCES `appointments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`owner_id` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `teams_slug_unique` ON `teams` (`slug`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`avatar_url` text,
	`google_access_token` text,
	`google_refresh_token` text,
	`microsoft_access_token` text,
	`microsoft_refresh_token` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`tags` text,
	`fingerprint` text,
	`cookies` text,
	`localStorage` text,
	`sessionStorage` text,
	`proxy` text,
	`userAgent` text,
	`viewport` varchar(50),
	`timezone` varchar(100),
	`locale` varchar(20),
	`geolocation` varchar(100),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastUsedAt` timestamp,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD `profileId` int;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_profileId_profiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON DELETE set null ON UPDATE no action;
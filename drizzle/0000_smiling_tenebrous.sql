CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`editor_css` text NOT NULL,
	`document_json` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);

import { boolean, char, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

/*
Loss in functionality compared to Prisma schema
Check constraints are not yet implemented
Unique constraints are not yet implemented
UpdatedAt is not yet implemented
*/

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),

	email: text('email').notNull(),

	username: text('username'),
	name: text('name'),
	image: text('image'),
	bio: text('bio'),
	isVerified: boolean('is_verified').default(false),
});

export const usersRelations = relations(users, ({ many }) => ({
	tokens: many(tokens),
	tweets: many(tweets),
}));

export const tokens = pgTable('tokens', {
	id: uuid('id').defaultRandom().primaryKey(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),

	tokenType: text('token_type').notNull(),
	emailToken: char('email_token', { length: 6 }),

	valid: boolean('valid').default(true),
	expiration: timestamp('expiration').notNull(),

	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
});

export const tokensRelations = relations(tokens, ({ one }) => ({
	user: one(users, {
		fields: [tokens.userId],
		references: [users.id],
	}),
}));

export const tweets = pgTable('tweets', {
	id: uuid('id').defaultRandom().primaryKey(),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),

	content: text('content').notNull(),
	image: text('image'),

	userId: uuid('user_id')
		.notNull()
		.references(() => users.id),
});

export const tweetsRelations = relations(tweets, ({ one }) => ({
	user: one(users, {
		fields: [tweets.userId],
		references: [users.id],
	}),
}));

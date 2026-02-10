import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ==========================================
// 認証・ユーザー
// ==========================================

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	avatarUrl: text('avatar_url'),
	googleAccessToken: text('google_access_token'),
	googleRefreshToken: text('google_refresh_token'),
	microsoftAccessToken: text('microsoft_access_token'),
	microsoftRefreshToken: text('microsoft_refresh_token'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull()
});

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	bookingPages: many(bookingPages),
	hostAppointments: many(appointments),
	proposalGroups: many(proposalGroups),
	teamMembers: many(teamMembers),
	ownedTeams: many(teams)
}));

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: text('expires_at').notNull()
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

// ==========================================
// チーム
// ==========================================

export const teams = sqliteTable('teams', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	ownerId: text('owner_id').notNull().references(() => users.id),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull()
});

export const teamsRelations = relations(teams, ({ one, many }) => ({
	owner: one(users, {
		fields: [teams.ownerId],
		references: [users.id]
	}),
	members: many(teamMembers),
	bookingPages: many(bookingPages)
}));

export const teamMembers = sqliteTable('team_members', {
	id: text('id').primaryKey(),
	role: text('role').notNull().default('member'), // "admin" | "member"
	teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }),
	userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
	createdAt: text('created_at').notNull()
});

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
	user: one(users, {
		fields: [teamMembers.userId],
		references: [users.id]
	})
}));

// ==========================================
// 予約受付型（Booking Type）
// ==========================================

export const bookingPages = sqliteTable('booking_pages', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description'),
	userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
	teamId: text('team_id').references(() => teams.id, { onDelete: 'cascade' }),
	duration: integer('duration').notNull().default(30), // 分単位
	bufferBefore: integer('buffer_before').notNull().default(0), // 前バッファ（分）
	bufferAfter: integer('buffer_after').notNull().default(0), // 後バッファ（分）
	minNotice: integer('min_notice').notNull().default(60), // 最小通知時間（分）
	maxDaysAhead: integer('max_days_ahead').notNull().default(30), // 最大何日先まで予約可能
	availableHours: text('available_hours').notNull().default('{}'), // JSON: 曜日ごとの時間帯
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
	customFields: text('custom_fields').notNull().default('[]'), // JSON配列: アンケート/事前情報収集用
	allowGuestCancel: integer('allow_guest_cancel', { mode: 'boolean' }).notNull().default(true),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull()
});

export const bookingPagesRelations = relations(bookingPages, ({ one, many }) => ({
	user: one(users, {
		fields: [bookingPages.userId],
		references: [users.id]
	}),
	team: one(teams, {
		fields: [bookingPages.teamId],
		references: [teams.id]
	}),
	appointments: many(appointments)
}));

// ==========================================
// アポイントメント（予約確定）
// ==========================================

export const appointments = sqliteTable('appointments', {
	id: text('id').primaryKey(),
	type: text('type').notNull().default('booking'), // "booking" | "proposal"
	bookingPageId: text('booking_page_id').references(() => bookingPages.id, { onDelete: 'cascade' }),
	proposalGroupId: text('proposal_group_id').references(() => proposalGroups.id, { onDelete: 'cascade' }),
	hostUserId: text('host_user_id').notNull().references(() => users.id),
	guestName: text('guest_name').notNull(),
	guestEmail: text('guest_email').notNull(),
	guestCompany: text('guest_company'),
	guestPhone: text('guest_phone'),
	startTime: text('start_time').notNull(), // ISO 8601
	endTime: text('end_time').notNull(), // ISO 8601
	status: text('status').notNull().default('confirmed'), // "pending" | "confirmed" | "cancelled"
	meetingUrl: text('meeting_url'),
	calendarEventId: text('calendar_event_id'),
	location: text('location'),
	notes: text('notes'),
	customValues: text('custom_values').notNull().default('{}'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull()
});

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
	bookingPage: one(bookingPages, {
		fields: [appointments.bookingPageId],
		references: [bookingPages.id]
	}),
	proposalGroup: one(proposalGroups, {
		fields: [appointments.proposalGroupId],
		references: [proposalGroups.id]
	}),
	hostUser: one(users, {
		fields: [appointments.hostUserId],
		references: [users.id]
	}),
	reminders: many(reminders)
}));

// ==========================================
// 候補提案型（Proposal Type）
// ==========================================

export const proposalGroups = sqliteTable('proposal_groups', {
	id: text('id').primaryKey(),
	title: text('title').notNull(),
	slug: text('slug').notNull().unique(),
	hostUserId: text('host_user_id').notNull().references(() => users.id),
	guestName: text('guest_name'),
	guestEmail: text('guest_email'),
	duration: integer('duration').notNull().default(60), // 分単位
	location: text('location'),
	notes: text('notes'),
	status: text('status').notNull().default('pending'), // "pending" | "confirmed" | "expired" | "cancelled"
	expiresAt: text('expires_at'),
	createdAt: text('created_at').notNull(),
	updatedAt: text('updated_at').notNull()
});

export const proposalGroupsRelations = relations(proposalGroups, ({ one, many }) => ({
	hostUser: one(users, {
		fields: [proposalGroups.hostUserId],
		references: [users.id]
	}),
	slots: many(proposalSlots),
	appointments: many(appointments)
}));

export const proposalSlots = sqliteTable('proposal_slots', {
	id: text('id').primaryKey(),
	proposalGroupId: text('proposal_group_id').notNull().references(() => proposalGroups.id, { onDelete: 'cascade' }),
	startTime: text('start_time').notNull(), // ISO 8601
	endTime: text('end_time').notNull(), // ISO 8601
	isSelected: integer('is_selected', { mode: 'boolean' }).notNull().default(false),
	calendarHoldEventId: text('calendar_hold_event_id'),
	createdAt: text('created_at').notNull()
});

export const proposalSlotsRelations = relations(proposalSlots, ({ one }) => ({
	proposalGroup: one(proposalGroups, {
		fields: [proposalSlots.proposalGroupId],
		references: [proposalGroups.id]
	})
}));

// ==========================================
// リマインダー
// ==========================================

export const reminders = sqliteTable('reminders', {
	id: text('id').primaryKey(),
	appointmentId: text('appointment_id').notNull().references(() => appointments.id, { onDelete: 'cascade' }),
	sendAt: text('send_at').notNull(), // ISO 8601
	sent: integer('sent', { mode: 'boolean' }).notNull().default(false),
	sentAt: text('sent_at'),
	createdAt: text('created_at').notNull()
});

export const remindersRelations = relations(reminders, ({ one }) => ({
	appointment: one(appointments, {
		fields: [reminders.appointmentId],
		references: [appointments.id]
	})
}));

// ==========================================
// 型エクスポート
// ==========================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type BookingPage = typeof bookingPages.$inferSelect;
export type NewBookingPage = typeof bookingPages.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;
export type ProposalGroup = typeof proposalGroups.$inferSelect;
export type NewProposalGroup = typeof proposalGroups.$inferInsert;
export type ProposalSlot = typeof proposalSlots.$inferSelect;
export type NewProposalSlot = typeof proposalSlots.$inferInsert;
export type Reminder = typeof reminders.$inferSelect;
export type NewReminder = typeof reminders.$inferInsert;

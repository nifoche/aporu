# Aporu 実装計画書

## 参考サービス: 調整アポ (scheduling.receptionist.jp)

### サービス概要
ビジネス向け日程調整SaaS。カレンダー連携により空き日時を自動ピックアップし、
専用URLで日程調整を完了できるサービス。

### 主要機能（調整アポの仕様）

#### 1. 2種類の日程調整方式
- **予約受付型**: ホストが予約ページURLを共有 → ゲストが空き時間から選択
- **候補提案型**: ホストが日程候補を複数ピックアップ → ゲストが候補から1つ選択

#### 2. カレンダー連携
- Google Calendar / Outlook / Garoon と連携
- 空き時間の自動抽出
- 確定後カレンダーに自動予定登録
- 仮押さえ → 確定の管理

#### 3. 日程確定後の自動処理
- 日程確定メール送付
- カレンダーに予定登録
- 会議室の予約
- WEB会議URL自動発行（Zoom / Teams）
- リマインドメール自動送信

#### 4. その他機能
- 複数人の日程調整（全員参加 or 誰か1人参加）
- 代理調整
- アンケート・事前情報収集
- Salesforce連携
- 予約のキャンセル・変更

---

## 技術スタック

| 項目 | 技術 |
|------|------|
| フレームワーク | SvelteKit |
| UI | shadcn-svelte + Tailwind CSS |
| 言語 | TypeScript |
| DB | SQLite (開発) / PostgreSQL (本番) |
| ORM | Prisma |
| 認証 | Lucia Auth (Google / Microsoft OAuth) |
| メール | Nodemailer / Resend |
| カレンダー | Google Calendar API / Microsoft Graph API |

---

## 実装フェーズ

### Phase 1: プロジェクトセットアップ ✅ → 🔲
- [ ] SvelteKit プロジェクト初期化
- [ ] Tailwind CSS セットアップ
- [ ] shadcn-svelte 導入
- [ ] 基本的なプロジェクト構造作成

### Phase 2: データベース設計・セットアップ 🔲
- [ ] Prisma セットアップ
- [ ] スキーマ設計（User, Team, BookingPage, Appointment, TimeSlot 等）
- [ ] マイグレーション実行
- [ ] シードデータ作成

### Phase 3: 認証機能 🔲
- [ ] Lucia Auth セットアップ
- [ ] Google OAuth 認証フロー
- [ ] Microsoft OAuth 認証フロー
- [ ] ログイン/ログアウト UI
- [ ] セッション管理

### Phase 4: ダッシュボード・基本レイアウト 🔲
- [ ] アプリ全体レイアウト（サイドバー、ヘッダー）
- [ ] ダッシュボードページ
- [ ] 設定ページ
- [ ] チーム管理ページ

### Phase 5: 予約受付型（Booking Type）🔲
- [ ] 予約ページ作成・設定画面
- [ ] 予約ページ公開URL生成
- [ ] 空き時間計算ロジック
- [ ] ゲスト向け予約フォーム
- [ ] 予約確定処理
- [ ] 予約一覧・管理画面
- [ ] キャンセル・変更機能

### Phase 6: 候補提案型（Proposal Type）🔲
- [ ] 日程候補選択UI（カレンダービュー）
- [ ] 候補日程のURL生成・送付
- [ ] ゲスト向け候補選択画面
- [ ] 仮押さえ → 確定フロー
- [ ] 候補一覧・管理画面

### Phase 7: カレンダー連携 🔲
- [ ] Google Calendar API 連携
- [ ] 空き時間自動取得
- [ ] 予定自動登録
- [ ] 仮予定管理（候補提案型用）

### Phase 8: メール通知・リマインダー 🔲
- [ ] メール送信基盤セットアップ
- [ ] 日程確定通知メール
- [ ] リマインダーメール（前日/当日）
- [ ] メールテンプレート

### Phase 9: 追加機能（将来）🔲
- [ ] WEB会議URL自動発行（Zoom / Teams API）
- [ ] アンケート・事前情報収集
- [ ] 複数人の空き時間一括判定
- [ ] 代理調整
- [ ] Salesforce連携
- [ ] モバイル対応

---

## データベーススキーマ概要

```
User
├── id, email, name, avatarUrl
├── googleAccessToken, googleRefreshToken
├── microsoftAccessToken, microsoftRefreshToken
└── createdAt, updatedAt

Team
├── id, name, slug
├── ownerId → User
└── createdAt, updatedAt

TeamMember
├── teamId → Team
├── userId → User
└── role (admin/member)

BookingPage (予約受付型)
├── id, title, slug, description
├── userId → User (or teamId → Team)
├── duration (30min, 60min, etc.)
├── availableHours (JSON: 曜日ごとの受付時間)
├── bufferBefore, bufferAfter
├── isActive
└── createdAt, updatedAt

Appointment (予約・アポイントメント)
├── id, type (booking/proposal)
├── bookingPageId → BookingPage (nullable)
├── hostUserId → User
├── guestName, guestEmail, guestCompany
├── startTime, endTime
├── status (pending/confirmed/cancelled)
├── meetingUrl
├── calendarEventId
├── notes
└── createdAt, updatedAt

ProposalGroup (候補提案型)
├── id, title
├── hostUserId → User
├── slug (URL用)
├── status (pending/confirmed/expired)
├── guestName, guestEmail
└── createdAt, updatedAt

ProposalSlot (候補日時)
├── id
├── proposalGroupId → ProposalGroup
├── startTime, endTime
├── isSelected (ゲストが選択したか)
└── calendarHoldEventId (仮押さえのカレンダーイベントID)

Reminder
├── id
├── appointmentId → Appointment
├── sendAt
├── sent
└── createdAt
```

---

## 進捗記録

| 日付 | Phase | 内容 | ステータス |
|------|-------|------|-----------|
| 2026-02-10 | - | 実装計画策定 | ✅ 完了 |
| 2026-02-10 | Phase 1 | SvelteKit + Tailwind CSS + shadcn-svelte セットアップ | ✅ 完了 |
| 2026-02-10 | Phase 2 | Prisma + SQLite スキーマ設計・マイグレーション | ✅ 完了 |
| 2026-02-10 | Phase 3 | セッション認証・開発用ログイン・hooks.server.ts | ✅ 完了 |
| 2026-02-10 | Phase 4 | サイドバーレイアウト・ダッシュボード・設定画面 | ✅ 完了 |
| 2026-02-10 | Phase 5 | 予約ページCRUD・空き時間計算・ゲスト予約フォーム | ✅ 完了 |
| 2026-02-10 | Phase 6 | 候補提案型 作成・ゲスト選択・確定フロー | ✅ 完了 |
| | Phase 7 | カレンダー連携 (Google Calendar API) | 🔲 未着手 |
| | Phase 8 | メール通知・リマインダー | 🔲 未着手 |
| | Phase 9 | WEB会議URL自動発行・追加機能 | 🔲 未着手 |

### 次回の再開ポイント

- **Phase 7: カレンダー連携** から開始
  - Google Calendar API の OAuth 認証フロー実装
  - 空き時間の自動取得
  - 予約確定時にカレンダーへ自動登録
- 設定画面のカレンダー連携ボタンにOAuth接続処理を追加
- Phase 8: メール送信基盤（Nodemailer/Resend）のセットアップ

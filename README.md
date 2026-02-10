# Aporu - 日程調整ツール

ビジネス向け日程調整SaaSサービス。カレンダー連携により空き日時を自動ピックアップし、専用URLで日程調整を完了できます。

## 主な機能

- **予約受付型**: 予約ページURLを共有し、ゲストが空き時間から選択
- **候補提案型**: 複数の日程候補を提示し、ゲストが候補から1つ選択
- カレンダー連携（Google Calendar、Outlook）
- 空き日時の自動ピックアップ
- WEB会議URL自動発行（Zoom、Teams）
- リマインドメール自動送信

## 技術スタック

- **フレームワーク**: SvelteKit
- **UIコンポーネント**: shadcn-svelte
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **DB**: Prisma + SQLite（開発）/ PostgreSQL（本番）

## 開発

```sh
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

## ビルド

```sh
npm run build
npm run preview
```

## 参考サイト

https://scheduling.receptionist.jp/

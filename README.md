# Aporu - 日程調整ツール

ビジネス向け日程調整ツール「調整アポ」のようなサービス。

## 概要

日程調整を自動化するSaaSサービス。カレンダー連携により、複数人の空き日時を自動ピックアップし、専用URLで日程調整を完了できます。

## 主な機能

- カレンダー連携（Google Calendar、Outlook 等）
- 空き日時の自動ピックアップ
- 専用URLによる日程調整
- カレンダーへの予定自動確保
- WEB会議URL自動発行（Zoom、Teams 等）
- リマインドメール自動送信
- SFA連携（Salesforce 等）

## 技術スタック

- **フレームワーク**: SvelteKit
- **UIコンポーネント**: shadcn-svelte
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS

## プロジェクト構成（予定）

```
aporu/
├── src/
│   ├── routes/           # ページルーティング
│   ├── lib/              # 共通ライブラリ
│   ├── components/       # UIコンポーネント
│   └── stores/           # 状態管理
├── static/               # 静的アセット
└── tests/                # テストコード
```

## 開発ステータス

- [x] プロジェクト初期化
- [ ] SvelteKitセットアップ
- [ ] shadcn-svelte導入
- [ ] 認証機能実装
- [ ] カレンダー連携
- [ ] 日程調整ロジック実装

## 参考サイト

https://scheduling.receptionist.jp/

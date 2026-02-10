<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';

	const days = [
		{ key: 'mon', label: '月曜日' },
		{ key: 'tue', label: '火曜日' },
		{ key: 'wed', label: '水曜日' },
		{ key: 'thu', label: '木曜日' },
		{ key: 'fri', label: '金曜日' },
		{ key: 'sat', label: '土曜日' },
		{ key: 'sun', label: '日曜日' },
	];

	const durations = [15, 30, 45, 60, 90, 120];

	let enabledDays = $state<Record<string, boolean>>({
		mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false
	});
</script>

<div class="max-w-2xl">
	<div class="mb-6">
		<h2 class="text-2xl font-bold tracking-tight">予約ページの作成</h2>
		<p class="text-muted-foreground">お客様に共有する予約ページを作成します</p>
	</div>

	<form method="POST" class="space-y-6">
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">基本設定</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="title">タイトル</Label>
					<Input id="title" name="title" placeholder="例: 30分オンラインミーティング" required />
				</div>

				<div class="space-y-2">
					<Label for="description">説明（任意）</Label>
					<textarea
						id="description"
						name="description"
						class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						placeholder="ミーティングの目的や注意事項を記載"
					></textarea>
				</div>

				<div class="space-y-2">
					<Label for="duration">所要時間</Label>
					<select
						id="duration"
						name="duration"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					>
						{#each durations as d}
							<option value={d} selected={d === 30}>{d}分</option>
						{/each}
					</select>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="text-lg">受付可能時間</CardTitle>
				<CardDescription>お客様が予約できる曜日と時間帯を設定します</CardDescription>
			</CardHeader>
			<CardContent class="space-y-3">
				{#each days as day}
					<div class="flex items-center gap-4">
						<label class="flex w-24 items-center gap-2">
							<input
								type="checkbox"
								name="day_{day.key}"
								checked={enabledDays[day.key]}
								onchange={() => enabledDays[day.key] = !enabledDays[day.key]}
								class="h-4 w-4 rounded border-input"
							/>
							<span class="text-sm font-medium">{day.label}</span>
						</label>
						{#if enabledDays[day.key]}
							<Input
								type="time"
								name="start_{day.key}"
								value="09:00"
								class="w-32"
							/>
							<span class="text-muted-foreground">-</span>
							<Input
								type="time"
								name="end_{day.key}"
								value="17:00"
								class="w-32"
							/>
						{:else}
							<span class="text-sm text-muted-foreground">休み</span>
						{/if}
					</div>
				{/each}
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="text-lg">詳細設定</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="bufferBefore">前バッファ（分）</Label>
						<Input id="bufferBefore" name="bufferBefore" type="number" value="0" min="0" step="5" />
						<p class="text-xs text-muted-foreground">予約の前に確保する空き時間</p>
					</div>
					<div class="space-y-2">
						<Label for="bufferAfter">後バッファ（分）</Label>
						<Input id="bufferAfter" name="bufferAfter" type="number" value="0" min="0" step="5" />
						<p class="text-xs text-muted-foreground">予約の後に確保する空き時間</p>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="minNotice">最小通知時間（分）</Label>
						<Input id="minNotice" name="minNotice" type="number" value="60" min="0" step="30" />
						<p class="text-xs text-muted-foreground">何分前まで予約を受け付けるか</p>
					</div>
					<div class="space-y-2">
						<Label for="maxDaysAhead">最大予約可能日数</Label>
						<Input id="maxDaysAhead" name="maxDaysAhead" type="number" value="30" min="1" />
						<p class="text-xs text-muted-foreground">何日先まで予約を受け付けるか</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<div class="flex justify-end gap-3">
			<a href="/booking-pages">
				<Button variant="outline">キャンセル</Button>
			</a>
			<Button type="submit">作成する</Button>
		</div>
	</form>
</div>

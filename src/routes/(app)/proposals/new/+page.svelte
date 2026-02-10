<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';

	const durations = [15, 30, 45, 60, 90, 120];

	let slots = $state<Array<{ date: string; start: string; end: string }>>([]);
	let newDate = $state('');
	let newStart = $state('10:00');
	let selectedDuration = $state(60);

	function addSlot() {
		if (!newDate || !newStart) return;

		const [h, m] = newStart.split(':').map(Number);
		const endMinutes = h * 60 + m + selectedDuration;
		const endH = Math.floor(endMinutes / 60).toString().padStart(2, '0');
		const endM = (endMinutes % 60).toString().padStart(2, '0');

		slots = [...slots, {
			date: newDate,
			start: newStart,
			end: `${endH}:${endM}`
		}];
	}

	function removeSlot(index: number) {
		slots = slots.filter((_, i) => i !== index);
	}

	function formatSlotDate(dateStr: string) {
		const d = new Date(dateStr + 'T00:00:00');
		return d.toLocaleDateString('ja-JP', {
			month: 'long',
			day: 'numeric',
			weekday: 'short'
		});
	}

	// Set default date to tomorrow
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	newDate = tomorrow.toISOString().split('T')[0];
</script>

<div class="max-w-2xl">
	<div class="mb-6">
		<h2 class="text-2xl font-bold tracking-tight">日程候補の作成</h2>
		<p class="text-muted-foreground">候補日時を複数選択して、相手に共有します</p>
	</div>

	<form method="POST" class="space-y-6">
		<input type="hidden" name="slots" value={JSON.stringify(slots)} />

		<Card>
			<CardHeader>
				<CardTitle class="text-lg">基本情報</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<Label for="title">タイトル</Label>
					<Input id="title" name="title" placeholder="例: プロジェクト打ち合わせ" required />
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="guestName">相手の名前（任意）</Label>
						<Input id="guestName" name="guestName" placeholder="田中花子" />
					</div>
					<div class="space-y-2">
						<Label for="guestEmail">相手のメールアドレス（任意）</Label>
						<Input id="guestEmail" name="guestEmail" type="email" placeholder="hanako@example.com" />
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="duration">所要時間</Label>
						<select
							id="duration"
							name="duration"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							bind:value={selectedDuration}
						>
							{#each durations as d}
								<option value={d}>{d}分</option>
							{/each}
						</select>
					</div>
					<div class="space-y-2">
						<Label for="location">場所（任意）</Label>
						<Input id="location" name="location" placeholder="オンライン / 会議室A" />
					</div>
				</div>

				<div class="space-y-2">
					<Label for="notes">メモ（任意）</Label>
					<textarea
						id="notes"
						name="notes"
						class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						placeholder="打ち合わせ内容など"
					></textarea>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="text-lg">日程候補</CardTitle>
				<CardDescription>候補となる日時を追加してください</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<!-- Add slot controls -->
				<div class="flex flex-wrap items-end gap-3">
					<div class="space-y-1">
						<Label for="newDate">日付</Label>
						<Input id="newDate" type="date" bind:value={newDate} class="w-44" />
					</div>
					<div class="space-y-1">
						<Label for="newStart">開始時刻</Label>
						<Input id="newStart" type="time" bind:value={newStart} class="w-32" />
					</div>
					<Button type="button" variant="outline" onclick={addSlot}>
						追加
					</Button>
				</div>

				<!-- Slot list -->
				{#if slots.length === 0}
					<p class="py-4 text-center text-sm text-muted-foreground">
						日程候補を追加してください
					</p>
				{:else}
					<div class="space-y-2">
						{#each slots as slot, i}
							<div class="flex items-center justify-between rounded-lg border p-3">
								<div class="text-sm">
									<span class="font-medium">{formatSlotDate(slot.date)}</span>
									<span class="ml-2 text-muted-foreground">{slot.start} - {slot.end}</span>
								</div>
								<button
									type="button"
									aria-label="削除"
									class="text-muted-foreground hover:text-destructive"
									onclick={() => removeSlot(i)}
								>
									<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
										<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</CardContent>
		</Card>

		<div class="flex justify-end gap-3">
			<a href="/proposals">
				<Button variant="outline">キャンセル</Button>
			</a>
			<Button type="submit" disabled={slots.length === 0}>
				作成してURLを発行
			</Button>
		</div>
	</form>
</div>

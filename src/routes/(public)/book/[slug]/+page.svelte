<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	let selectedDate = $state<string | null>(null);
	let selectedSlot = $state<{ start: string; end: string } | null>(null);
	let step = $state<'date' | 'time' | 'form'>('date');

	let dates = $derived(Object.keys(data.slotsByDate).sort());

	function formatDate(dateStr: string) {
		const d = new Date(dateStr + 'T00:00:00');
		return d.toLocaleDateString('ja-JP', {
			month: 'long',
			day: 'numeric',
			weekday: 'short'
		});
	}

	function selectDate(date: string) {
		selectedDate = date;
		selectedSlot = null;
		step = 'time';
	}

	function selectSlot(slot: { start: string; end: string }) {
		selectedSlot = slot;
		step = 'form';
	}

	function goBack() {
		if (step === 'form') {
			step = 'time';
			selectedSlot = null;
		} else if (step === 'time') {
			step = 'date';
			selectedDate = null;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/40 p-4">
	<div class="w-full max-w-lg">
		<Card>
			<CardHeader class="text-center">
				<CardTitle class="text-xl">{data.bookingPage.title}</CardTitle>
				<CardDescription>
					{data.bookingPage.hostName} - {data.bookingPage.duration}分
				</CardDescription>
				{#if data.bookingPage.description}
					<p class="mt-2 text-sm text-muted-foreground">{data.bookingPage.description}</p>
				{/if}
			</CardHeader>
			<CardContent>
				{#if step !== 'date'}
					<button
						type="button"
						class="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
						onclick={goBack}
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
						戻る
					</button>
				{/if}

				{#if step === 'date'}
					<h3 class="mb-3 text-sm font-medium">日付を選択</h3>
					{#if dates.length === 0}
						<p class="py-8 text-center text-muted-foreground">現在予約可能な時間帯はありません</p>
					{:else}
						<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
							{#each dates as date}
								<button
									type="button"
									class="rounded-lg border p-3 text-center text-sm hover:border-primary hover:bg-primary/5 transition-colors"
									onclick={() => selectDate(date)}
								>
									<span class="font-medium">{formatDate(date)}</span>
									<br />
									<span class="text-xs text-muted-foreground">
										{data.slotsByDate[date].length}枠
									</span>
								</button>
							{/each}
						</div>
					{/if}

				{:else if step === 'time' && selectedDate}
					<h3 class="mb-3 text-sm font-medium">
						{formatDate(selectedDate)} - 時間を選択
					</h3>
					<div class="grid grid-cols-3 gap-2">
						{#each data.slotsByDate[selectedDate] as slot}
							<button
								type="button"
								class="rounded-lg border p-2 text-center text-sm hover:border-primary hover:bg-primary/5 transition-colors"
								onclick={() => selectSlot(slot)}
							>
								{slot.start}
							</button>
						{/each}
					</div>

				{:else if step === 'form' && selectedDate && selectedSlot}
					<div class="mb-4 rounded-lg bg-muted p-3">
						<p class="text-sm font-medium">{formatDate(selectedDate)}</p>
						<p class="text-sm text-muted-foreground">
							{selectedSlot.start} - {selectedSlot.end}（{data.bookingPage.duration}分）
						</p>
					</div>

					<form method="POST" class="space-y-4">
						<input type="hidden" name="date" value={selectedDate} />
						<input type="hidden" name="startTime" value={selectedSlot.start} />

						<div class="space-y-2">
							<Label for="guestName">お名前</Label>
							<Input id="guestName" name="guestName" placeholder="山田太郎" required />
						</div>

						<div class="space-y-2">
							<Label for="guestEmail">メールアドレス</Label>
							<Input id="guestEmail" name="guestEmail" type="email" placeholder="taro@example.com" required />
						</div>

						<div class="space-y-2">
							<Label for="guestCompany">会社名（任意）</Label>
							<Input id="guestCompany" name="guestCompany" placeholder="株式会社○○" />
						</div>

						<div class="space-y-2">
							<Label for="notes">メモ（任意）</Label>
							<textarea
								id="notes"
								name="notes"
								class="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
								placeholder="事前にお伝えしたいこと"
							></textarea>
						</div>

						<Button type="submit" class="w-full">予約を確定する</Button>
					</form>
				{/if}
			</CardContent>
		</Card>

		<p class="mt-4 text-center text-xs text-muted-foreground">
			Powered by Aporu
		</p>
	</div>
</div>

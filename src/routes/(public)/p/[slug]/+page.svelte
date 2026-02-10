<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	let selectedSlotId = $state<string | null>(null);
	let step = $state<'select' | 'form'>('select');

	function formatSlotDateTime(iso: string) {
		const d = new Date(iso);
		return d.toLocaleDateString('ja-JP', {
			month: 'long',
			day: 'numeric',
			weekday: 'short'
		}) + ' ' + d.toLocaleTimeString('ja-JP', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatTimeRange(startIso: string, endIso: string) {
		const s = new Date(startIso);
		const e = new Date(endIso);
		return s.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
			+ ' - '
			+ e.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
	}

	function selectSlot(id: string) {
		selectedSlotId = id;
		step = 'form';
	}

	function getSelectedSlot() {
		return data.slots.find(s => s.id === selectedSlotId);
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/40 p-4">
	<div class="w-full max-w-lg">
		<Card>
			<CardHeader class="text-center">
				<CardTitle class="text-xl">{data.proposal.title}</CardTitle>
				<CardDescription>
					{data.proposal.hostName} - {data.proposal.duration}分
				</CardDescription>
				{#if data.proposal.location}
					<p class="text-sm text-muted-foreground">場所: {data.proposal.location}</p>
				{/if}
				{#if data.proposal.notes}
					<p class="mt-2 text-sm text-muted-foreground">{data.proposal.notes}</p>
				{/if}
			</CardHeader>
			<CardContent>
				{#if data.alreadyConfirmed}
					<div class="py-8 text-center">
						<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
							<svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<p class="font-medium">この日程調整は既に確定しています</p>
					</div>

				{:else if step === 'select'}
					<h3 class="mb-3 text-sm font-medium">ご都合の良い日時を選択してください</h3>
					<div class="space-y-2">
						{#each data.slots as slot}
							<button
								type="button"
								class="w-full rounded-lg border p-3 text-left hover:border-primary hover:bg-primary/5 transition-colors"
								onclick={() => selectSlot(slot.id)}
							>
								<p class="font-medium text-sm">{formatSlotDateTime(slot.startTime)}</p>
								<p class="text-xs text-muted-foreground">{formatTimeRange(slot.startTime, slot.endTime)}</p>
							</button>
						{/each}
					</div>

				{:else if step === 'form'}
					{@const slot = getSelectedSlot()}
					<button
						type="button"
						class="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
						onclick={() => { step = 'select'; selectedSlotId = null; }}
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
						戻る
					</button>

					{#if slot}
						<div class="mb-4 rounded-lg bg-muted p-3">
							<p class="text-sm font-medium">{formatSlotDateTime(slot.startTime)}</p>
							<p class="text-xs text-muted-foreground">{formatTimeRange(slot.startTime, slot.endTime)}</p>
						</div>
					{/if}

					<form method="POST" class="space-y-4">
						<input type="hidden" name="slotId" value={selectedSlotId} />

						<div class="space-y-2">
							<Label for="guestName">お名前</Label>
							<Input id="guestName" name="guestName" placeholder="田中花子" required />
						</div>

						<div class="space-y-2">
							<Label for="guestEmail">メールアドレス</Label>
							<Input id="guestEmail" name="guestEmail" type="email" placeholder="hanako@example.com" required />
						</div>

						<div class="space-y-2">
							<Label for="guestCompany">会社名（任意）</Label>
							<Input id="guestCompany" name="guestCompany" placeholder="株式会社○○" />
						</div>

						<Button type="submit" class="w-full">この日時で確定する</Button>
					</form>
				{/if}
			</CardContent>
		</Card>

		<p class="mt-4 text-center text-xs text-muted-foreground">
			Powered by Aporu
		</p>
	</div>
</div>

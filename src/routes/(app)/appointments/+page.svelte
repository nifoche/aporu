<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	const filters = [
		{ key: 'upcoming', label: '今後の予定' },
		{ key: 'past', label: '過去の予定' },
		{ key: 'cancelled', label: 'キャンセル済み' },
	];

	function formatDateTime(date: string) {
		const d = new Date(date);
		return d.toLocaleDateString('ja-JP', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			weekday: 'short'
		}) + ' ' + d.toLocaleTimeString('ja-JP', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatDuration(start: string, end: string) {
		const s = new Date(start);
		const e = new Date(end);
		const mins = Math.round((e.getTime() - s.getTime()) / 60000);
		return `${mins}分`;
	}

	function statusLabel(status: string) {
		switch (status) {
			case 'confirmed': return '確定';
			case 'pending': return '保留';
			case 'cancelled': return 'キャンセル';
			default: return status;
		}
	}

	function statusVariant(status: string): 'default' | 'secondary' | 'destructive' {
		switch (status) {
			case 'confirmed': return 'default';
			case 'pending': return 'secondary';
			case 'cancelled': return 'destructive';
			default: return 'secondary';
		}
	}
</script>

<div class="space-y-6">
	<div>
		<h2 class="text-2xl font-bold tracking-tight">アポイントメント</h2>
		<p class="text-muted-foreground">予約された全てのアポイントメントを管理します</p>
	</div>

	<div class="flex gap-2">
		{#each filters as f}
			<a href="?filter={f.key}">
				<Button variant={data.filter === f.key ? 'default' : 'outline'} size="sm">
					{f.label}
				</Button>
			</a>
		{/each}
	</div>

	{#if data.appointments.length === 0}
		<Card>
			<CardContent class="py-12 text-center">
				<p class="text-muted-foreground">アポイントメントはありません</p>
			</CardContent>
		</Card>
	{:else}
		<div class="space-y-3">
			{#each data.appointments as apt}
				<Card>
					<CardContent class="flex items-center justify-between p-4">
						<div class="space-y-1">
							<div class="flex items-center gap-2">
								<p class="font-medium">{apt.guestName}</p>
								<Badge variant={statusVariant(apt.status)}>{statusLabel(apt.status)}</Badge>
							</div>
							<p class="text-sm text-muted-foreground">{apt.guestEmail}</p>
							{#if apt.guestCompany}
								<p class="text-sm text-muted-foreground">{apt.guestCompany}</p>
							{/if}
						</div>
						<div class="text-right">
							<p class="text-sm font-medium">{formatDateTime(apt.startTime)}</p>
							<p class="text-xs text-muted-foreground">{formatDuration(apt.startTime, apt.endTime)}</p>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>

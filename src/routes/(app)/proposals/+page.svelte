<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	function statusLabel(status: string) {
		switch (status) {
			case 'pending': return '回答待ち';
			case 'confirmed': return '確定';
			case 'expired': return '期限切れ';
			case 'cancelled': return 'キャンセル';
			default: return status;
		}
	}

	function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
		switch (status) {
			case 'pending': return 'outline';
			case 'confirmed': return 'default';
			case 'expired': return 'destructive';
			case 'cancelled': return 'secondary';
			default: return 'secondary';
		}
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('ja-JP', {
			month: 'short',
			day: 'numeric',
			weekday: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">日程候補</h2>
			<p class="text-muted-foreground">候補提案型の日程調整を管理します</p>
		</div>
		<a href="/proposals/new">
			<Button>新規作成</Button>
		</a>
	</div>

	{#if data.proposals.length === 0}
		<Card>
			<CardContent class="py-12 text-center">
				<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold">日程調整がありません</h3>
				<p class="mt-1 text-sm text-muted-foreground">
					日程候補を作成して、相手に送りましょう
				</p>
				<a href="/proposals/new" class="mt-4 inline-block">
					<Button>日程候補を作成</Button>
				</a>
			</CardContent>
		</Card>
	{:else}
		<div class="space-y-4">
			{#each data.proposals as proposal}
				<Card>
					<CardContent class="p-4">
						<div class="flex items-start justify-between">
							<div class="space-y-1">
								<div class="flex items-center gap-2">
									<p class="font-medium">{proposal.title}</p>
									<Badge variant={statusVariant(proposal.status)}>
										{statusLabel(proposal.status)}
									</Badge>
								</div>
								{#if proposal.guestName || proposal.guestEmail}
									<p class="text-sm text-muted-foreground">
										{proposal.guestName || ''} {proposal.guestEmail ? `<${proposal.guestEmail}>` : ''}
									</p>
								{/if}
								<p class="text-sm text-muted-foreground">
									{proposal.slots.length}件の候補日時 / {proposal.duration}分
								</p>
								<div class="flex flex-wrap gap-1 mt-2">
									{#each proposal.slots.slice(0, 3) as slot}
										<Badge variant={slot.isSelected ? 'default' : 'outline'} class="text-xs">
											{formatDate(slot.startTime)}
										</Badge>
									{/each}
									{#if proposal.slots.length > 3}
										<Badge variant="outline" class="text-xs">
											+{proposal.slots.length - 3}件
										</Badge>
									{/if}
								</div>
							</div>
							<div class="flex gap-2">
								<Button
									variant="ghost"
									size="sm"
									onclick={() => navigator.clipboard.writeText(window.location.origin + '/p/' + proposal.slug)}
								>
									URLコピー
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</div>

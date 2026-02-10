<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	function formatDateTime(date: string) {
		const d = new Date(date);
		return d.toLocaleDateString('ja-JP', {
			month: 'long',
			day: 'numeric',
			weekday: 'short'
		}) + ' ' + d.toLocaleTimeString('ja-JP', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="space-y-6">
	<!-- Stats -->
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="pb-2">
				<CardDescription>予約ページ</CardDescription>
				<CardTitle class="text-3xl">{data.stats.bookingPages}</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-xs text-muted-foreground">有効な予約ページ数</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardDescription>調整中</CardDescription>
				<CardTitle class="text-3xl">{data.stats.pendingProposals}</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-xs text-muted-foreground">回答待ちの日程調整</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardDescription>直近の予定</CardDescription>
				<CardTitle class="text-3xl">{data.stats.upcomingCount}</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-xs text-muted-foreground">今後のアポイントメント</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-2">
				<CardDescription>累計予約</CardDescription>
				<CardTitle class="text-3xl">{data.stats.totalAppointments}</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-xs text-muted-foreground">全アポイントメント数</p>
			</CardContent>
		</Card>
	</div>

	<!-- Quick actions -->
	<div class="flex flex-wrap gap-3">
		<a href="/booking-pages/new">
			<Button>予約ページを作成</Button>
		</a>
		<a href="/proposals/new">
			<Button variant="outline">日程候補を送る</Button>
		</a>
	</div>

	<!-- Upcoming appointments -->
	<Card>
		<CardHeader>
			<CardTitle>直近のアポイントメント</CardTitle>
			<CardDescription>今後の予定一覧</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.upcomingAppointments.length === 0}
				<div class="py-8 text-center text-muted-foreground">
					<p>予定されているアポイントメントはありません</p>
					<a href="/booking-pages/new" class="mt-2 inline-block">
						<Button variant="link">予約ページを作成して始めましょう</Button>
					</a>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.upcomingAppointments as apt}
						<div class="flex items-center justify-between rounded-lg border p-4">
							<div class="space-y-1">
								<p class="font-medium">{apt.guestName}</p>
								<p class="text-sm text-muted-foreground">{apt.guestEmail}</p>
								{#if apt.guestCompany}
									<p class="text-sm text-muted-foreground">{apt.guestCompany}</p>
								{/if}
							</div>
							<div class="text-right">
								<p class="text-sm font-medium">{formatDateTime(apt.startTime)}</p>
								<Badge variant={apt.status === 'confirmed' ? 'default' : 'secondary'}>
									{apt.status === 'confirmed' ? '確定' : apt.status === 'pending' ? '保留' : 'キャンセル'}
								</Badge>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

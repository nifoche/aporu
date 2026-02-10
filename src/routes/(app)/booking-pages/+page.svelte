<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">予約ページ</h2>
			<p class="text-muted-foreground">予約受付型の予約ページを管理します</p>
		</div>
		<a href="/booking-pages/new">
			<Button>新規作成</Button>
		</a>
	</div>

	{#if data.bookingPages.length === 0}
		<Card>
			<CardContent class="py-12 text-center">
				<div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
					<svg class="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
				<h3 class="text-lg font-semibold">予約ページがありません</h3>
				<p class="mt-1 text-sm text-muted-foreground">
					予約ページを作成して、お客様に共有しましょう
				</p>
				<a href="/booking-pages/new" class="mt-4 inline-block">
					<Button>最初の予約ページを作成</Button>
				</a>
			</CardContent>
		</Card>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each data.bookingPages as page}
				<Card>
					<CardHeader>
						<div class="flex items-center justify-between">
							<CardTitle class="text-lg">{page.title}</CardTitle>
							<Badge variant={page.isActive ? 'default' : 'secondary'}>
								{page.isActive ? '有効' : '無効'}
							</Badge>
						</div>
						<CardDescription>{page.duration}分</CardDescription>
					</CardHeader>
					<CardContent>
						<div class="space-y-3">
							{#if page.description}
								<p class="text-sm text-muted-foreground line-clamp-2">{page.description}</p>
							{/if}
							<div class="flex items-center gap-2 text-sm text-muted-foreground">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
									<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
								</svg>
								<code class="text-xs">/book/{page.slug}</code>
							</div>
							<div class="text-sm text-muted-foreground">
								{page._count.appointments} 件の予約
							</div>
							<div class="flex gap-2">
								<a href="/booking-pages/{page.id}" class="flex-1">
									<Button variant="outline" size="sm" class="w-full">編集</Button>
								</a>
								<Button
									variant="ghost"
									size="sm"
									onclick={() => navigator.clipboard.writeText(window.location.origin + '/book/' + page.slug)}
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

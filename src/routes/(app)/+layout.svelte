<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';

	let { children, data } = $props();

	const navItems = [
		{ href: '/dashboard', label: 'ダッシュボード', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ href: '/booking-pages', label: '予約ページ', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
		{ href: '/proposals', label: '日程候補', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
		{ href: '/appointments', label: 'アポイントメント', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
		{ href: '/settings', label: '設定', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
	];

	function isActive(href: string, pathname: string): boolean {
		if (href === '/dashboard') return pathname === '/dashboard';
		return pathname.startsWith(href);
	}
</script>

<div class="flex h-screen bg-muted/40">
	<!-- Sidebar -->
	<aside class="hidden w-64 flex-col border-r bg-background md:flex">
		<div class="flex h-16 items-center border-b px-6">
			<a href="/dashboard" class="flex items-center gap-2">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
					A
				</div>
				<span class="text-lg font-bold">Aporu</span>
			</a>
		</div>

		<nav class="flex-1 space-y-1 p-4">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors {isActive(item.href, $page.url.pathname) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
					</svg>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="border-t p-4">
			<div class="flex items-center gap-3">
				<div class="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-medium">
					{data.user.name.charAt(0)}
				</div>
				<div class="flex-1 truncate">
					<p class="text-sm font-medium truncate">{data.user.name}</p>
					<p class="text-xs text-muted-foreground truncate">{data.user.email}</p>
				</div>
			</div>
			<form method="POST" action="/auth/logout" class="mt-2">
				<Button variant="ghost" size="sm" type="submit" class="w-full justify-start text-muted-foreground">
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
						<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
					</svg>
					ログアウト
				</Button>
			</form>
		</div>
	</aside>

	<!-- Main content -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<!-- Mobile header -->
		<header class="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
			<div class="flex items-center gap-4 md:hidden">
				<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
					A
				</div>
				<span class="text-lg font-bold">Aporu</span>
			</div>
			<div class="hidden md:block">
				<h1 class="text-lg font-semibold">
					{#each navItems as item}
						{#if isActive(item.href, $page.url.pathname)}
							{item.label}
						{/if}
					{/each}
				</h1>
			</div>
			<div class="flex items-center gap-2">
				<!-- Placeholder for notifications/actions -->
			</div>
		</header>

		<!-- Page content -->
		<main class="flex-1 overflow-auto p-4 md:p-6">
			{@render children()}
		</main>
	</div>
</div>

<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
</script>

<div class="flex min-h-screen items-center justify-center bg-muted/40 p-4">
	<Card class="w-full max-w-md text-center">
		<CardHeader>
			<div class="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
				<svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<CardTitle>日程が確定しました</CardTitle>
		</CardHeader>
		<CardContent class="space-y-4">
			<p class="text-sm text-muted-foreground">
				ご回答ありがとうございます。<br />
				確認メールをお送りします。
			</p>
		</CardContent>
	</Card>
</div>

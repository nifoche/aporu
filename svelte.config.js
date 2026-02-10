import adapter from '@sveltejs/adapter-cloudflare';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			platformProxy: {
				config: './wrangler.toml',
				environment: undefined,
				experimental: {},
				persist: false
			}
		})
	}
};

export default config;

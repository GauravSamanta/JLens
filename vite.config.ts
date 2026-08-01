import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Injects the Cloudflare Web Analytics beacon into production builds only.
 *
 * Set VITE_CF_BEACON_TOKEN in the Vercel project's environment variables
 * (Cloudflare dashboard → Web Analytics → your site → the `token` value).
 * Without the token the tag is omitted entirely, so dev servers, previews,
 * and forks stay clean. The beacon is cookieless and sends no personal data.
 */
function cloudflareAnalytics(token: string | undefined): Plugin {
  return {
    name: 'cloudflare-analytics',
    apply: 'build',
    transformIndexHtml() {
      if (!token) return []
      return [
        {
          tag: 'script',
          injectTo: 'body',
          attrs: {
            defer: true,
            src: 'https://static.cloudflareinsights.com/beacon.min.js',
            'data-cf-beacon': JSON.stringify({ token }),
          },
        },
      ]
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    plugins: [
      react(),
      tailwindcss(),
      cloudflareAnalytics(env.VITE_CF_BEACON_TOKEN),
    ],
  }
})

// Post-build step for Next.js `output: 'standalone'` (Hostinger / any Node host).
// Copies static assets next to the standalone server so `npm start` serves CSS/JS/images.
import { cpSync, existsSync } from 'node:fs'

const SA = '.next/standalone'
if (!existsSync(SA)) {
  console.error('[prepare-standalone] .next/standalone not found - is output: "standalone" set in next.config.js?')
  process.exit(1)
}
if (existsSync('public')) cpSync('public', `${SA}/public`, { recursive: true })
if (existsSync('.next/static')) cpSync('.next/static', `${SA}/.next/static`, { recursive: true })
console.log('[prepare-standalone] public/ and .next/static copied into .next/standalone')

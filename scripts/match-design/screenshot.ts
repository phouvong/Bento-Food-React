/**
 * Captures screenshots of a given URL at mobile, tablet, and desktop breakpoints.
 * Called by the /match-design slash command.
 *
 * Usage:
 *   npx ts-node scripts/match-design/screenshot.ts <url> <run-id>
 *
 * Outputs three PNGs to .claude/match-design/runs/<run-id>/:
 *   mobile-375.png  tablet-768.png  desktop-1440.png
 */

import { chromium } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// Breakpoints to capture — tuple of [label, width, height]
const VIEWPORTS: Array<[string, number, number]> = [
    ['mobile-375', 375, 812],
    ['tablet-768', 768, 1024],
    ['desktop-1440', 1440, 900],
]

async function main() {
    const url = process.argv[2]
    const runId = process.argv[3]

    if (!url || !runId) {
        console.error('Usage: screenshot.ts <url> <run-id>')
        process.exit(1)
    }

    const outDir = path.join(process.cwd(), '.claude', 'match-design', 'runs', runId)
    fs.mkdirSync(outDir, { recursive: true })

    const browser = await chromium.launch({ headless: true })

    for (const [label, width, height] of VIEWPORTS) {
        const page = await browser.newPage()
        await page.setViewportSize({ width, height })

        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
            // Brief pause for CSS transitions to settle
            await page.waitForTimeout(800)
        } catch {
            // Page might be SSR-only; capture whatever rendered
        }

        const dest = path.join(outDir, `${label}.png`)
        await page.screenshot({ path: dest, fullPage: false })
        console.log(`captured ${dest}`)
        await page.close()
    }

    await browser.close()
    console.log(`screenshots saved to ${outDir}`)
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})

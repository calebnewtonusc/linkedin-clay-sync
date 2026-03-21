Sync LinkedIn connections to Clay.

Steps:
1. Check that `CLAY_WEBHOOK_URL` is set in `.env` or the environment. If not, ask the user for their Clay webhook URL and save it to `.env`.
2. On macOS: make sure the user has `https://www.linkedin.com/mynetwork/invite-connect/connections/` open in Chrome. If not, ask them to open it.
3. Run: `npm run scrape` (macOS uses existing Chrome; other platforms open a browser for login)
4. Report how many connections were sent to Clay.
5. Ask if they want to install the daily auto-sync cron: `npm run install-cron`

The webhook URL format is: `https://api.clay.com/v3/sources/webhook/<token>`
Get it from Clay: Table → Sources → + Add Source → Webhook → Copy URL

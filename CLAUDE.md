# CLAUDE.md - ryankirsch.dev (Portfolio Site)

## Stack
- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Framer Motion
- **Output:** Static export (`output: 'export'`)
- **Deployment:** Netlify (auto-deploys from `ryan` remote)

## Commands
```bash
npm run dev          # Dev server
npm run build        # Build → outputs to out/
git push origin main && git push ryan main  # Deploy (Netlify auto-deploys from ryan remote)
```

## Git Remotes
- `origin` → Henry's backup repo
- `ryan` → agalloch88/portfolio_site_v2 (deployment source, uses classic PAT from `~/.openclaw/.secrets/github-classic-pat`)

## Style Rules
- **NO em dashes (—) anywhere**
- Authoritative DE positioning: "I build systems that scale" — NOT "transitioning into"
- **NO mention of Data Engineer Academy**, no salary ranges
- Static export only — no server-side features, no API routes
- Tailwind for all styling

## Do NOT Touch
- `next.config.js` — static export config
- No `.env` needed — environment is fully static

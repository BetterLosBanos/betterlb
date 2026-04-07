# BetterLB (Los Baños)

A modern, open-source portal for the Municipality of Los Baños, Laguna, Philippines.

**Live Site:** https://betterlb.org | **Fork of:** [BetterGov.ph](https://bettergov.ph)

---

## Quick Start

```bash
# Clone and install
git clone https://github.com/BetterLosBanos/betterlb
cd betterlb
npm install

# Prepare data
python3 scripts/merge_services.py

# Start dev server
npm run dev
# Open http://localhost:5173
```

---

## For New Developers

### Setup Requirements
- **Node.js** v22+ (use `nvm use` for version from `.nvmrc`)
- **Python** 3.10+ (for data pipeline scripts)

### Essential Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test:e2e     # Run end-to-end tests
npm run lint         # Check code quality
npm run format       # Format with Prettier
```

### Project Structure
```
src/
├── components/      # Reusable UI components
│   ├── ui/          # Local UI components (Card, Badge, Dialog, etc.)
│   ├── layout/      # Page layouts, headers, footers
│   └── navigation/  # Breadcrumbs, menus, sidebars
├── pages/           # Route-level pages
│   ├── services/    # Public services directory
│   ├── government/  # Departments, officials, barangays
│   ├── transparency/# Bids, budget, infrastructure
│   └── admin/       # Admin dashboard
├── data/            # Static JSON data
├── hooks/           # Custom React hooks
├── lib/             # Utilities and helpers
└── types/           # TypeScript definitions
```

### Key Patterns

**Design System (Kapwa):**
```tsx
// Use semantic tokens, never raw colors
import { Button } from '@bettergov/kapwa/button';

// Local UI components
import { Card, Badge } from '@/components/ui';
```

**Component Organization:**
- Keep components under 200 lines
- Extract complex logic to custom hooks
- Use barrel exports (`index.ts`) in component folders

**Data Fetching:**
- Static data: Import from `src/data/`
- Dynamic data: Use `functions/api/` endpoints
- Search: Meilisearch integration

---

## For Other LGUs (Forking)

BetterLB is designed to be adapted for any Philippine LGU.

### Quick Fork (4 Steps)

1. **Edit LGU Config**
   ```json
   // config/lgu.config.json
   {
     "lgu": {
       "name": "Your Municipality",
       "province": "Your Province",
       "type": "municipality"
     }
   }
   ```

2. **Update UI Text**
   ```json
   // public/locales/en/common.json
   {
     "heroTitle": "Your Municipality Portal"
   }
   ```

3. **Replace Data**
   - `/src/data/lgu/yourlgu/directory/departments.json`
   - `/src/data/lgu/yourlgu/services/categories/`

4. **Build & Test**
   ```bash
   npm install && npm run build
   ```

**See [`FORKING.md`](./FORKING.md) for detailed instructions.**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite 6, TypeScript, Tailwind CSS v4 |
| **Backend** | Cloudflare Pages Functions (serverless) |
| **Database** | Cloudflare D1 (SQLite) |
| **Search** | Meilisearch |
| **Maps** | Leaflet |
| **Testing** | Playwright (E2E), Vitest (unit) |

---

## Contributing

We welcome contributions! See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for guidelines.

**Quick Workflow:**
1. Fork the repository
2. Create a branch: `feature/your-feature`
3. Follow [Conventional Commits](https://www.conventionalcommits.org/)
4. Submit a Pull Request

---

## License

**Code:** [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) (Public Domain)

**Data Attribution:**
- Municipality of Los Baños (official data)
- Philippine Government agencies (procurement, budget, infrastructure)

---

**Built by the community, for the community.**
*Cost to the People of Los Baños = ₱0*

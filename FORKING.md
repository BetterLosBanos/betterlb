# 🏛️ BetterLB - Forking Guide

This guide helps you adapt BetterLB for your own Local Government Unit (LGU).

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📋 Configuration File

The `/config/lgu.config.json` file contains all LGU-specific branding values in one place.

### Essential Fields

| Field | Description | Example |
|-------|-------------|-------------|
| `lgu.name` | "Your Municipality" | "Los Baños" |
| `lgu.fullName` | "Municipality of Los Baños" | "Municipality of Los Baños" |
| `lgu.province` | "Your Province" | "Laguna" |
| `lgu.provinceWebsite` | "Province Official Website" | "https://laguna.gov.ph" |
| `lgu.region` | "Your Region" | "Region IV-A" |
| `lgu.regionCode` | "Your Region Code" | "CALABARZON" |
| `lgu.officialWebsite` | "Official LGU Website" | "https://www.losbanos.gov.ph" |
| `portal.name` | "YourPortalName" | "BetterLB" |
| `portal.domain` | "YourDomain" | "BetterLB.org" |
| `portal.baseUrl` | "YourBaseURL" | "https://betterLB.org" |
| `portal.tagline` | "YourTagline" | "Your Slogan" |
| `portal.description` | "YourDescription" | "Portal description..." |
| `portal.navbarTagline` | "Navbar subtitle" | "A Community-run portal for" |
| `portal.footerBrandName` | "Footer brand name" | "Better Los Baños" |
| `portal.footerTagline` | "Footer tagline" | "Community Civic Portal" |

### Example Configuration

```json
{
  "lgu": {
    "id": "sanpablo",
    "name": "San Pablo",
    "fullName": "City of San Pablo",
    "province": "Laguna",
    "region": "Region IV-A",
    "regionCode": "CALABARZON",
    "type": "city",
    "logoPath": "/logos/png/betterlb-blue.png",
    "officialWebsite": "https://www.sanpablo.gov.ph",
    "barangayCount": 14
  },
  "portal": {
    "name": "BetterLGU",
    "domain": "betterlgu.org",
    "baseUrl": "https://betterlgu.org",
    "tagline": "Transparent. Accessible. Friendly.",
    "navbarTagline": "A Community-run portal for",
    "footerBrandName": "Better LGU",
    "footerTagline": "Community Civic Portal"
  }
}
```

## ⚠️ Manual Changes Required

### Code Files

| File | What to Change |
|------|----------------|
| `functions/api/weather.ts` | Update `DEFAULT_CITY` (lines 16-20) with your LGU name and coordinates |
| `/public/locales/en/common.json` | LGU-specific text for descriptions and labels |

---

## 💾 D1 Database (Legislative Data)

The D1 database (`betterlb_openlgu` remote, `BETTERLB_DB` local) contains all legislative data.

### Core Tables to Populate

| Table | Description | What to Replace |
|-------|-------------|-----------------|
| `terms` | Council terms with dates, mayor/vice-mayor info | Your LGU's council terms, elected officials |
| `persons` | Council members and officials | Your councilors, mayor, vice-mayor |
| `memberships` | Person-term relationships | Who served in which term/role |
| `sessions` | Legislative session records | Your session dates, numbers, types |
| `session_absences` | Attendance records (absent-only model) | Your attendance data |
| `documents` | Ordinances, resolutions, executive orders | **ALL** legislative documents from your LGU |
| `document_authors` | Many-to-many relationship for document authors | Who authored each document |
| `committees` | Legislative committees | Your LGU's committee structure |
| `committee_memberships` | Committee assignments | Who serves on which committees |
| `subjects` | Subject tags/categories | Topics relevant to your legislation |
| `document_subjects` | Document-subject relationships | Tag documents with appropriate subjects |
| `review_queue` | Items pending manual review | Data quality queue for your sources |
| `data_conflicts` | Reconciliation between sources | Conflicts found during data import |

### Database Commands

```bash
# Local development
npx wrangler d1 execute BETTERLB_DB --local --file=db/migrations/001_initial_schema.sql

# Remote production
npx wrangler d1 execute betterlb_openlgu --remote --file=db/migrations/001_initial_schema.sql

# Query local database
npx wrangler d1 execute BETTERLB_DB --local --command="SELECT * FROM terms LIMIT 10"
```

### Data Pipeline Scripts

The `pipeline/` directory contains Python scripts to process legislative PDFs into structured JSON:

```bash
# Run in sequence for processing PDFs
python3 pipeline/1_scrape.py        # Scrape document metadata
python3 pipeline/1.5_normalize.py  # Normalize scraped data
python3 pipeline/2_download.py      # Download PDFs
python3 pipeline/3_parse.py         # Parse PDF content
python3 pipeline/4_generate.py      # Generate database-ready JSON
```

Note: this is specific to our LGU´s website. You might need a script that works for your LGU´s govph.

---

## 📁 src/data Directory (Static Data Files)

The `src/data/` directory contains LGU-specific static data organized by category.

### Services Data

Located in `src/data/services/categories/` - these define the services your LGU provides:

| File | What to Replace |
|------|-----------------|
| `agriculture-livelihood.json` | Your LGU's agriculture programs |
| `business-licensing.json` | Your business requirements and fees |
| `certificates-vital-records.json` | Your civil registry processes |
| `education-scholarship.json` | Your scholarship programs |
| `environment-waste.json` | Your waste collection schedules |
| `health-wellness.json` | Your health centers and programs |
| `infrastructure-engineering.json` | Your engineering office services |
| `public-safety.json` | Your public safety contacts |
| `social-services.json` | Your social services offerings |
| `taxation-assessment.json` | Your tax rates and schedules |

> **Important:** After modifying category files, run:
> ```bash
> python3 scripts/merge_services.py
> ```
> This combines category files into `src/data/services/services.json`.

### Directory Data

Located in `src/data/directory/`:

| File | What to Replace |
|------|-----------------|
| `barangays.json` | Your LGU's barangays (update count in config too) |
| `departments.json` | Your department names, addresses, contacts |
| `executive.json` | Your mayor, vice mayor, department heads |
| `legislative.json` | Your councilors and committees |

### Statistics Data

Located in `src/data/statistics/`:

| File | What to Replace |
|------|-----------------|
| `ari.json` | Your LGU's revenue statistics | get from https://data.bettergov.ph/datasets/9
| `cmci.json` | Your CMCI scores (if available) | get from https://cmci.dti.gov.ph/
| `population.json` | Your LGU's population census data | get from https://psa.gov.ph/statistics/population-and-housing

### Other Data Files

| Location | File | What to Replace |
|----------|------|-----------------|
| `src/data/tourism/` | `resorts.json` | Your LGU's tourist spots |
| `src/data/about/` | `history.json` | Your LGU's history |
| `src/data/about/` | `highlights.json` | Your LGU's highlights |
| `src/data/transparency/` | `budgetData.ts` | Your budget allocations | get from https://data.bettergov.ph/datasets/9
| `src/data/transparency/` | `sre.json` | Your SRE evaluation results | get from https://data.bettergov.ph/datasets/9
| `src/data/` | `navigation.ts` | Navigation structure changes (if needed) |
| `src/data/` | `news.ts` | Your LGU's news feed |
| `src/data/` | `websites.json` | Your related government sites |
| `src/data/` | `hotlines.txt` | Your local emergency contacts |

---

## 📄 License

This project is released under [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) dedication.

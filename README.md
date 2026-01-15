# 🏛️ Better LB (Los Baños)

A community-led, open-source portal designed to make the government of the **Municipality of Los Baños** accessible, transparent, and user-friendly.

This project is a municipal-focused fork of [BetterGov.ph](https://bettergov.ph), adapted to meet the specific needs of Los Bañenses.

---

## Why We're Building This Project
Official government websites are often difficult to navigate on mobile devices, lack standardized accessibility features, and can be slow to update. **Better LB** provides a high-performance alternative that mirrors official data (built by BetterGov.PH volunteers) in a modern, inclusive, and community-audited format.

## Our Mission
To empower the citizens of Los Baños with transparent access to municipal services, local legislation, and public data at **₱0 cost to the people**.

## Key Features
*   **Unified Service Directory**: A categorized list of municipal permits, certificates, and programs with step-by-step guides and requirement checklists.
*   **Leadership Profiles**: A "People-First" directory of the Executive and Legislative branches, including contact details and committee assignments.
*   **Citizen Contribution Portal**: A custom workflow allowing non-developers to suggest edits or new services directly via a web form.
*   **Automated Data Pipeline**: A "Human-in-the-loop" verification system using GitHub Actions to audit and merge community data safely.
*   **Transparency Dashboard**: Independent visualizations of public funds and infrastructure projects.

---

## Technical Stack
*   **Frontend**: React 19, Vite, TypeScript
*   **Styling**: Tailwind CSS v4 (using CSS variables and high-contrast tokens)
*   **Backend**: Cloudflare Pages Functions (TypeScript)
*   **Data**: Structured JSON (Modular category-based architecture)
*   **Automation**: GitHub Actions & Python data-processing scripts
*   **Testing**: Playwright (Core sanity & Accessibility scans)

---

## 🚀 How to Run Locally

### 1. Clone and Install
```bash
git clone https://github.com/BetterLosBanos/betterlb
cd betterlb
npm install
```

### 2. Prepare Data
Since the service directory is split into manageable category files, you must merge them before running the app:
```bash
python3 scripts/merge_services.py
```

### 3. Start Development Server
```bash
npm run dev
```
**Access the portal at:** `http://localhost:5173`

---

## Join the Grassroots Movement
We are looking for volunteers passionate individuals who want to make Los Baños a better place. You don't need to be a developer to help!

### How You Can Contribute:
1.  **Non-Developers**: Visit the `/contribute` page on the live site to suggest new services or fix outdated information using our simple web form.
2.  **Developers**: Check the [Issues](https://github.com/BetterLosBanos/betterlb/issues) tab for "Help Wanted" or "Good First Issue" labels.
3.  **Data Auditors**: Help us verify community submissions on GitHub to ensure the portal remains an authoritative source of information.

## License
This project is released under the [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) dedication. The work is dedicated to the public domain and can be freely used, modified, and distributed without restriction.

---
**Built by the community, for the community.**  
*Cost to the People of Los Baños = ₱0*
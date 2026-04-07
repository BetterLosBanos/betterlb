## Inspiration
The inspiration for BetterLB came from recognizing that the Municipality of Los Baños deserved a modern, accessible portal that residents could actually rely on. Official government websites are often difficult to navigate on mobile, slow to update, and lack accessibility features. We wanted to build something community-driven and open-source — a portal that puts Los Bañenses first.

## What it does
BetterLB serves as a community-built portal for the Municipality of Los Baños, offering:
- A modern, user-friendly interface for accessing municipal government services
- Comprehensive public services directory with requirements, fees, and step-by-step processes
- Legislative portal with ordinances, resolutions, and executive orders from the Sangguniang Bayan
- Transparency dashboard covering financial data, procurement bids, and infrastructure projects
- Government directory with contact information for all municipal departments and officials
- Multilingual support (English and Filipino)
- Mobile-responsive design for access on any device

## How we built it
The platform is built using modern web technologies:
- React 19 for the frontend framework
- TypeScript (strict mode) for type safety and better development experience
- Tailwind CSS v4 for responsive and maintainable styling
- Radix UI for accessible component primitives
- Lucide React for consistent iconography
- React Router for client-side routing
- Vite for fast development and optimized builds
- Cloudflare Pages and D1 for deployment and legislative data storage
- Meilisearch with Fuse.js for fast, fuzzy search
- Python pipeline for processing legislative PDFs

## Challenges we ran into
- Sourcing, cleaning, and structuring legislative documents from official PDFs
- Organizing the large number of municipal services into a navigable directory
- Implementing a responsive design that works across all device sizes
- Ensuring accessibility for residents with different abilities
- Managing multilingual support while maintaining content consistency
- Keeping data accurate and up-to-date through community contribution workflows

## Accomplishments that we're proud of
- Built a fully open-source, community-audited portal at zero cost to Los Baños residents
- Created a searchable legislative archive of ordinances, resolutions, and executive orders
- Implemented a powerful fuzzy search and filtering system for services and legislation
- Developed a responsive design that works seamlessly on all devices
- Built a scalable, forkable architecture so other LGUs in the Philippines can adopt it
- Achieved excellent performance metrics through Cloudflare's edge network
- Created a structured data pipeline for processing and publishing legislative documents

## What we learned
- Best practices for organizing municipal government service directories
- Techniques for extracting and structuring data from government PDFs at scale
- Strategies for managing multilingual content effectively
- Approaches to building accessible local government portals
- How to design community contribution workflows that non-developers can participate in
- The importance of open data and transparency in local governance

## What's next for BetterLB
- Expanding coverage of barangay-level services and officials
- Adding more real-time transparency data (budget execution, project tracking)
- Growing the volunteer community of data auditors and translators
- Helping other LGUs fork and deploy their own portals based on BetterLB
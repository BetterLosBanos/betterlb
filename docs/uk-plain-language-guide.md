# UK Plain Language Guide for Citizens Charter

**Version:** 1.0
**Based on:** [GOV.UK Style Guide](https://www.gov.uk/guidance/style-guide/a-to-z)
**Purpose:** Reference guide for standardizing Citizens Charter content

---

## Quick Reference

### Core Principles

1. **Use imperative verbs** for instructions: "Submit" (not "Submits"), "Pay" (not "Payment")
2. **Active voice** over passive: "Submit requirements" (not "Requirements are submitted")
3. **Address the user as "you"** where appropriate
4. **No need to say "please"** in instructions
5. **Be specific and clear** - avoid vague terms
6. **Use short words** - 'buy' not 'purchase', 'help' not 'assist'
7. **Write conversationally** - as if talking one-to-one

### Essential Field Definitions

| Field | Purpose | Examples |
|-------|---------|----------|
| `service_name` | Official name from Citizens Charter document | "Business Registration (Renewal) - Face to Face" |
| `plain_language_name` | User-friendly version for public display | "Renew your business registration in person" |
| `processing_time` | In-person transaction time | "15 minutes", "2 hours" |
| `turnaround_time` | Total time including waiting/approval | "3-5 working days" |
| `client_steps[].action` | What the user does (imperative) | "Submit requirements", "Pay fees" |

---

## Field Definitions

### processing_time vs turnaround_time

**processing_time**: The time it takes to complete the transaction **in person** at the office.
- Used for: Simple services, in-person transaction portion of complex services
- Examples: "15 minutes", "2 hours", "4 hours"
- For simple services: This is the full service time

**turnaround_time**: Total time for complex services including **waiting and approval periods**.
- Used for: Complex services with external dependencies, site inspections, posting periods
- Examples: "3-5 working days", "21-35 working days", "Varies by site inspection"
- For simple services: Leave empty or null

**Examples of split:**

| Original processing_time | New processing_time | New turnaround_time |
|------------------------|---------------------|---------------------|
| "15 Minutes" | "15 minutes" | "" |
| "3-5 working days" | "" | "3-5 working days" |
| "1 day (document review) + BFP Site Inspection + 10 minutes (payment)" | "10 minutes" | "1 day + BFP Site Inspection" |

---

## Imperative Verb Patterns

### Client Steps Standardization

| Current Pattern | Standardized (UK Plain English) | Why |
|-----------------|---------------------------------|-----|
| "Submits requirements" | "Submit requirements" | Third-person → Imperative |
| "The applicant pays" | "Pay" | Third-person → Imperative |
| "Payment of fees" | "Pay fees" | Noun phrase → Verb |
| "Requirements are received" | "Submit requirements" | Passive → Active |
| "Payment and approval" | "Pay fees and receive approval" | Vague → Specific |
| "Transact business" | "Complete your transaction" | Vague → Specific |
| "Visit ebosslosbanos.com..." | "Go to ebosslosbanos.com..." | Conversational |
| "Present/submit documents" | "Present and submit documents" | Clear and specific |

### Common Imperative Verb Conversions

| Third-Person | Imperative |
|--------------|------------|
| Submits | Submit |
| Pays | Pay |
| Receives | Receive |
| Reviews | Review |
| Approves | Approve |
| Processes | Process |
| Issues | Issue |
| Signs | Sign |
| Completes | Complete |
| Prepares | Prepare |
| Attaches | Attach |
| Downloads | Download |
| Prints | Print |
| Fills out | Fill out |
| Encodes | Encode |
| Registers | Register |
| Claims | Claim |
| Appears | Appear |

### Passive to Active Conversions

| Passive Voice | Active Voice |
|---------------|--------------|
| Requirements are received | Submit requirements |
| Documents are processed | Submit documents |
| Application is approved | Receive approval |
| Fees are collected | Pay fees |

---

## Title Transformation Patterns

### Auto-generation Rules

| Pattern | plain_language_name |
|---------|---------------------|
| `issuance of X` | "Get a X" or "Get X" |
| `request for X` | "Apply for X" |
| `collection of X` | "Pay X" |
| `X (renewal)` | "Renew your X" |
| `certification of X` | "Get a X certificate" |
| `X application` | "Apply for X" |

### Title Examples

| Original service_name | plain_language_name |
|----------------------|---------------------|
| "Business Registration (Renewal) - Face to Face" | "Renew your business registration in person" |
| "Issuance of Barangay Clearance" | "Get a barangay clearance" |
| "Collection of Other Payments" | "Pay other fees and charges" |
| "Certification of Indigency" | "Get an indigency certificate" |
| "Request for Police Clearance" | "Apply for a police clearance" |
| "Issuance of Mayor's Permit" | "Get a mayor's permit" |
| "Business Permit Application" | "Apply for a business permit" |
| "Issuance of Fiscal Clearance" | "Get a fiscal clearance" |
| "Certification of Residency" | "Get a residency certificate" |
| "Collection of Garbage Fees" | "Pay garbage fees" |

### Title Transformation Rules

1. **Start with an action verb** - "Get", "Apply for", "Pay", "Renew"
2. **Remove bureaucratic language** - "Issuance of" → "Get", "Request for" → "Apply for"
3. **Use simple words** - "Certification" → "Certificate"
4. **Remove parenthetical qualifiers** - Move to description if needed
5. **Be specific but concise** - Under 65 characters where possible
6. **Address the user directly** - "Get your barangay clearance" (not "Obtaining of...")

### Service-Specific Patterns

| Service Type | Pattern | Example |
|--------------|---------|---------|
| Clearance | "Get a [type] clearance" | "Get a barangay clearance" |
| Certificate | "Get a [type] certificate" | "Get an indigency certificate" |
| Permit | "Get a [type] permit" | "Get a mayor's permit" |
| License | "Get a [type] license" | "Get a business license" |
| Registration (Renewal) | "Renew your [type]" | "Renew your business registration" |
| Application | "Apply for [type]" | "Apply for a building permit" |
| Collection/Payment | "Pay [type]" | "Pay garbage fees" |

---

## Words to Avoid (GOV.UK)

### Banned Words with Replacements

| Avoid | Use Instead | Example |
|-------|-------------|---------|
| agenda | plan | "Follow this plan" (not "Follow this agenda") |
| collaborate | work with | "We work with partners" (not "We collaborate with partners") |
| facilitate | say something specific | "Help" or "Make easier" |
| empower | allow, give permission | "This allows you to..." |
| promote | recommend, support | "We recommend..." |
| streamline | simplify | "Simplified process" |
| purchase | buy | "Buy a license" |
| assist | help | "We can help you..." |
| utilize | use | "Use this form" |
| demonstrate | show | "Show that you..." |
| initiate | start, begin | "Start your application" |
| require (verb) | need, must | "You must provide..." |
| ensure (verb) | make sure | "Make sure to..." |

### Short Words Preference

| Long Word | Short Word |
|-----------|------------|
| purchase | buy |
| assist | help |
| utilize | use |
| demonstrate | show |
| initiate | start |
| require | need |
| select | choose |
| obtain | get |
| receive | get |
| notify | tell |
| inform | tell |
| request | ask for |
| regarding | about |
| subsequent | next |
| prior to | before |

---

## Sentence Style

### Active Voice

**Use active voice:**
- "Submit requirements" ✓
- "Pay fees at the cashier" ✓
- "Bring valid ID" ✓

**Avoid passive voice:**
- "Requirements are to be submitted" ✗
- "Fees are paid at the cashier" ✗
- "Valid ID must be brought" ✗

### Address the User

**Use "you" where appropriate:**
- "You must bring a valid ID" ✓
- "Submit your application in person" ✓

**Avoid third-person:**
- "The applicant must bring a valid ID" ✗
- "Applications must be submitted in person" ✗

### No "Please"

**Don't use "please" in instructions:**
- "Submit your form" ✓
- "Please submit your form" ✗

"Please" is unnecessary and adds clutter. Clear instructions don't need it.

### Be Specific

**Use specific, actionable language:**
- "Pay fees and receive approval" ✓
- "Payment and approval" ✗

- "Go to ebosslosbanos.com and complete the application" ✓
- "Transact business online" ✗

### Write Conversationally

**Write as if talking one-to-one:**
- "Get a barangay clearance" ✓
- "Obtaining of barangay clearance" ✗

- "Apply for a business permit" ✓
- "Business permit application" ✗

---

## Citizens Charter Specific Patterns

### Common Action Verbs by Office

| Office | Common Actions |
|--------|----------------|
| BPLO | Apply, Renew, Pay, Submit, Present |
| Assessor | Request, Get, Submit, Pay |
| Engineering | Apply, Get, Submit, Present |
| LCR | Request, Get, Claim, Submit |
| Market | Pay, Apply, Get |
| Agriculture | Apply, Request, Get |

### Step Pattern Standardization

**Avoid bureaucratic phrases:**
- "For evaluation" → "Evaluation" (drop "For")
- "For processing" → "Processing" (drop "For")
- "For approval" → "Receive approval" (be specific)

**Use clear, sequential steps:**
1. Submit requirements
2. Pay fees
3. Receive approval

---

## Quality Checklist

Use this checklist to validate standardized content:

### Plain Language Names

- [ ] Starts with an action verb (Get, Apply, Pay, Renew)
- [ ] No bureaucratic language (Issuance, Request, Collection)
- [ ] Under 65 characters where possible
- [ ] Addresses user directly (your)
- [ ] Uses simple words (Certificate not Certification)

### Client Steps

- [ ] Uses imperative verbs (Submit, Pay, Bring)
- [ ] No third-person (Submits, Pays)
- [ ] No passive voice (are submitted, is received)
- [ ] Active voice throughout
- [ ] Specific and clear
- [ ] No vague terms (Payment and approval)

### Processing Times

- [ ] In-person time in `processing_time`
- [ ] Working days in `turnaround_time`
- [ ] Properly split for complex services
- [ ] Empty `turnaround_time` for simple services

### Data Quality

- [ ] All requirements have `where_to_secure`
- [ ] No truncated requirements (ends with "(if", "(for", ", ", " or ")
- [ ] Fees in dict format only
- [ ] No deprecated fields (`person_responsible`, `agency_action`)

---

## Script Reference

### Standardization Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `cc_split_processing_time.py` | Split processing_time into in-person + turnaround | `python3 pipeline/cc_split_processing_time.py --write` |
| `cc_standardize_steps.py` | Convert client steps to plain language | `python3 pipeline/cc_standardize_steps.py --write` |
| `cc_generate_plain_titles.py` | Generate plain_language_name from service_name | `python3 pipeline/cc_generate_plain_titles.py --write` |
| `cc_quality_fixer.py` | Fix data quality issues | `python3 pipeline/cc_quality_fixer.py --write` |
| `cc_schema_validator.py` | Validate against updated schema | `python3 pipeline/cc_schema_validator.py` |

### Execution Order

1. **Backup**: Always run scripts with `--dry-run` first
2. **Split times**: `cc_split_processing_time.py`
3. **Fix quality**: `cc_quality_fixer.py`
4. **Generate titles**: `cc_generate_plain_titles.py`
5. **Standardize steps**: `cc_standardize_steps.py`
6. **Validate**: `cc_schema_validator.py`
7. **Merge**: `python3 scripts/merge_citizens_charter.py`
8. **Verify**: Build site and check rendering

---

## References

- [GOV.UK Style Guide A-Z](https://www.gov.uk/guidance/style-guide/a-to-z)
- [GOV.UK Plain English](https://www.gov.uk/guidance/content-design/writing-for-gov-uk)
- [Plain English Campaign](https://www.plainenglish.co.uk/)

---

*Last updated: 2025-02-20*

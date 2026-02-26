# Citizens Charter Data Standardization Plan

**Created:** 2025-02-19
**Plan File:** `/home/mico/.claude/plans/logical-snuggling-haven.md`
**Purpose:** Standardize citizens-charter.json for consistency, plain language clarity, and improved data quality.

---

## Current State Analysis

- **56 services** in categories 1-8 only
- **181 client steps** across 54 services (inconsistent language)
- **18 different fields** found (inconsistent schema)
- **10 services** missing fees
- **3 services** missing client_steps and processing_time
- **57/284 requirements** (20%) missing `where_to_secure`
- **10 truncated requirements** from PDF extraction

**Fee format variations:** dict (28), list (17), string (1), null (10)

---

## Implementation Plan

### Phase 1: Schema Standardization

**Define 10 core required fields for all services:**

| Field | Type | Required | Default |
|-------|------|----------|---------|
| service_number | string | Yes | - |
| service_name | string | Yes | - |
| office_division | string | Yes | - |
| classification | enum | Yes | "Simple" or "Complex" |
| type_of_transaction | enum | Yes | "G2C" or "G2B" |
| who_may_avail | string | Yes | - |
| requirements | array | Yes | [] |
| client_steps | array | Yes | [{step, action}] |
| fees | dict | Yes | {amount: "", description: ""} |
| processing_time | string | Yes | "" |

**Fee format (unified dict):**
```json
{"amount": "₱100.00", "description": "per copy"}
```

**Remove deprecated fields:**
- `person_responsible` (not used in UI)
- `agency_action` from client_steps (mostly empty, unused)

**Keep optional fields:**
- `website` (for online portals)
- `supporting_documents_detail` (conditional requirements)
- `fee_schedule` (for service 1.6 only)

---

### Phase 2: Plain Language Standardization

**Standardize client_steps to clear, consistent imperative language:**

| Current Issues | Target Format |
|----------------|---------------|
| Mixed: "Submit"/"Submits" | Consistent imperative: "Submit" |
| Compound: "Present/submit" | Clear: "Present and submit" |
| Vague: "Payment and approval" | Clear: "Pay fees and receive approval" |
| Long parentheticals | Simplify or move to notes |

**Script to create:** `scripts/standardize_client_steps.py`

**Features:**
- Convert third-person singular to imperative ("Submits" → "Submit")
- Standardize slashes to "and"
- Simplify overly complex sentences
- Remove redundant words
- Preserve essential details in notes if needed
- Dry-run mode with preview

---

### Phase 3: Data Quality Fixes

**Fix 1: Truncated requirements**
- Detect patterns: "(if", "(for", ", ", " or "
- Cross-reference with similar services
- Flag for manual review

**Fix 2: Missing where_to_secure (20%)**
- Smart inference: "DTI" → "Department of Trade and Industry"
- Mark with confidence level (high/medium/manual)
- Default to "Contact the office" if unknown

**Fix 3: Processing time standardization**
- Pattern: "X minutes/hours/days" or "X-Y days"
- Complex cases preserve notes
- Empty string if unknown

**Fix 4: Fee structure unification**
- Convert list format to dict
- String → `{amount: "Refer to...", description: ""}`
- Keep fee_schedule for service 1.6

---

## Scripts to Create

| Script | Purpose |
|--------|---------|
| `scripts/standardize_client_steps.py` | Standardize step language to plain imperative |
| `pipeline/cc_standardize.py` | Schema and fee standardization |
| `pipeline/cc_quality_detector.py` | Detect data quality issues |
| `pipeline/cc_fix_truncated.py` | Fix truncated requirements |
| `pipeline/cc_fix_where_to_secure.py` | Infer missing where_to_secure |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/citizens-charter.ts` | Update interfaces, remove agency_action |
| `pipeline/cc_data_validator.py` | New validation rules |
| `src/data/citizens-charter/citizens-charter.json` | Main data file (after backup) |

---

## Execution Steps

1. **Backup:** Create timestamped backup of citizens-charter.json
2. **Standardize steps:** Run plain language standardization (dry-run first)
3. **Standardize schema:** Run schema standardization script
4. **Fix quality:** Run data quality fix scripts
5. **Validate:** Run updated validator
6. **Merge:** Re-run merge_citizens_charter.py
7. **Verify:** Build site, check frontend rendering

---

## Verification Checklist

- [ ] All 56 services have 10 core fields
- [ ] All client_steps use clear, consistent imperative language
- [ ] All fees in dict format
- [ ] All requirements have where_to_secure
- [ ] No truncated requirements
- [ ] Processing times follow standard pattern
- [ ] Validation passes with 0 errors
- [ ] Frontend renders correctly

---

## Critical Files

- `src/data/citizens-charter/citizens-charter.json` - Source data (56 services, 181 steps)
- `src/types/citizens-charter.ts` - TypeScript interfaces
- `pipeline/cc_data_validator.py` - Validation logic
- `scripts/merge_citizens_charter.py` - Office mappings reference

---

*End of Standardization Plan*

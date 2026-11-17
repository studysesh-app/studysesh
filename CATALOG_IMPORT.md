# Updating the course catalog

The checked-in catalog is not current; see [COURSES_CALENDAR_CHECK.md](./COURSES_CALENDAR_CHECK.md). No new catalog was imported in this session. Obtain an authorized, complete source for the intended academic year before using this procedure.

## Input and generation

Provide a UTF-8 JSON array of course codes and titles only:

```json
[
  { "code": "TEST 1000", "name": "Example course" }
]
```

In PowerShell, generate **new** review files (the command refuses to overwrite an existing output):

```powershell
npm run catalog:prepare -- --input .\catalog-authorized.json --sql .\catalog-generated.sql --json .\catalog-generated.json --year 2026-27
```

The generator requires at least 3,000 courses and 80 distinct subject prefixes by default, rejects duplicate or malformed codes and control characters, and escapes titles for SQL. The thresholds are guardrails against accidentally retiring most of the catalog; use `--minimum` and `--min-prefixes` only after independently confirming a smaller source is complete. It does not fetch or verify the source or its license.

## Review and rollout

1. Compare counts, codes, titles, additions and retirements against the authorized source. Investigate extraction damage and academic-year mismatches. Do not treat the generator's validation as an academic catalog audit.
2. After reviewing, place the generated SQL in `supabase\migrations\` using the next unused migration number, and replace `courses.json` with the reviewed generated JSON for demo search. Review both changes together.
3. Apply migrations through `030` and the generated import to a disposable staging project. The import updates titles and marks missing courses inactive; it **does not delete course rows**, so existing enrollments, boards and tutor records remain linked. New enrollment and tutoring applications reject inactive courses.
4. Verify added, renamed and retired examples in live search and demo search. Verify a user already enrolled in a retired course can still view and remove it, while a new user cannot enroll. Run the tests and the deployed smoke checklist before a coordinated production rollout.

If the source, permission, or completeness cannot be verified, do not run the import. The existing catalog remains available but stale until a reviewed source is supplied.

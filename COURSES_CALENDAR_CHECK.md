# courses.json vs Carleton 2026-27 undergraduate calendar

Checked 3 October 2026 against the live web edition of the Carleton undergraduate calendar.

## Verdict

**Not up to date.** `courses.json` is still the 2025-26 extract described in `BACKEND_PLAN.md` (3,808 courses, 113 subject prefixes). It is not a current 2026-27 catalog.

The 2026-27 undergraduate calendar **is published**. The official web edition is [calendar.carleton.ca/undergrad/](https://calendar.carleton.ca/undergrad/). Course lists are at [calendar.carleton.ca/undergrad/courses/](https://calendar.carleton.ca/undergrad/courses/). Post-publication corrections are tracked at [calendar.carleton.ca/updates/](https://calendar.carleton.ca/updates/) (co-op international-student rules, 29 June 2026; Nursing program requirements and courses, 2 July 2026). There is not a “calendar not yet published” gap.

Overlap is high, so a casual spot-check of unchanged codes will look fine. It is not current: a whole new subject prefix is missing, and dozens of codes have been added, retired, renumbered, or retitled.

## How this was checked

- Local file: a JSON list of `{code, name}` objects. 3,808 unique codes, 113 prefixes (`ACSE` through `WGST`). No year field in the file.
- Official source: every subject page linked from the 2026-27 Courses index, plus `ACSE` (`/undergrad/courses/acse/`) and `ISAP` (`/undergrad/courses/ISAP/`), which use non-standard URLs. 109 index links; 108 returned 200 on the first pass; `ACSE` and `ISAP` were fetched separately and included.
- Parsed only `courseblockcode` + the course-block title (3,803 current course blocks, 114 prefixes). Page titles and in-page year strings say 2026-27.
- A code was treated as **removed** only if it is not a current course block. Many of those are also labeled “no longer offered” in precludes text. Mentions that are only prerequisites or “no longer offered” were not counted as current courses.
- Title strings that are a prefix of each other (local titles cut off mid-phrase, or local titles with program-text glued on the end) were **not** counted as renames. About 263 shared codes look like that extraction damage. About 12 more differ only by punctuation or a dropped hyphen.

This is a catalog comparison, not a check of what is scheduled this term. The calendar itself says not every listed course is offered every year; term offerings are on central.carleton.ca.

A frozen 2025-26 calendar was not re-downloaded. “Still 2025-26” rests on (1) the file matching the documented 3,808 / 113 extract and (2) the file still containing codes the 2026-27 calendar explicitly marks no longer offered.

## Counts

| | courses.json | 2026-27 course blocks |
| --- | ---: | ---: |
| Courses | 3,808 | 3,803 |
| Subject prefixes | 113 | 114 (`BTEC` is new) |
| Codes in both | 3,701 | 3,701 |
| Only in the 2026-27 calendar | — | 102 |
| Only in courses.json | 107 | — |
| Same code, exact title | 3,405 | |
| Same code, substantive title change | 29 | see caveats below |

66 of 114 prefixes have the **same set of codes**. That is not the same as up to date: `NEUR`, `HUMS`, and `SOWK` are in that group and still have title changes.

48 prefixes differ in at least one code. Sampled below, well past a COMP-only check.

## New subject: Biotechnology (BTEC)

`BTEC` is on the 2026-27 courses index and is absent from `courses.json` (0 local rows). All 13 blocks were read from the BTEC page:

| Code | 2026-27 title |
| --- | --- |
| BTEC 2301 | Biotechnology I |
| BTEC 3301 | Biotechnology II |
| BTEC 3302 | Regulations and Intellectual Property |
| BTEC 3303 | Quality Control and Quality Assurance |
| BTEC 3501 | Agrifood Technologies |
| BTEC 4501 | Food Bio-Innovation |
| BTEC 4601 | Regenerative Medicine |
| BTEC 4602 | Biotherapeutics and Vaccines |
| BTEC 4701 | Environmental Bioremediation |
| BTEC 4702 | Industrial Microbiology |
| BTEC 4908 | Research Thesis |
| BTEC 4909 | Practicum |
| BTEC 4910 | Consulting Project |

## Evidence by department

### Still aligned on codes (examples)

These prefixes have the same codes locally and in 2026-27. Titles were not all re-read one by one; do not treat this as a title audit.

`ACSE` (13), `AFRI` (24), `ALDS` (45), `BIOL` (88), `CSEC` (9), `EACH` (2), `ECON` (89), `FOOD` (21), `FREN` (51), `HIST` is **not** in this list (see below). `PSYC` is **not** in this list (`PSYC 4235` is gone).

`ACSE 2001` Architecture and the Environment is still a 2026-27 course block (local title matches the short name; the longer local title for `ACSE 4101` is truncated in the file but the code is current).

### COMP

| Code | courses.json | 2026-27 |
| --- | --- | --- |
| COMP 3009 | Computer Graphics | Not a course block. `COMP 4509` precludes it as no longer offered. |
| COMP 4509 | absent | Computer Graphics |
| COMP 3801 | Algorithms for Modern Data Sets | Not a course block. `COMP 4801` precludes it as no longer offered. |
| COMP 4801 | absent | Algorithms for Data Mining, Web, and Social Networks |
| COMP 3308 | Bioinformatics | Not a course block. Biology precludes it as no longer offered. |
| COMP 3008 | Human-Computer Interaction (plus scraped program text) | Software Structures for User Interfaces |
| COMP 4806 | Numerical Linear Algebra | Scientific Computing II (Honours) |
| COMP 1005 | Introduction to Computer Science I | Same title. Still current. |

Local COMP count 78; 2026-27 count 77 (75 shared, 3 only local, 2 only calendar).

### NURS (matches the 2 July 2026 update)

| Code | courses.json | 2026-27 |
| --- | --- | --- |
| NURS 1004 | Pharmacology and Medication Management I | Not a course block. `NURS 1005` precludes it as no longer offered. |
| NURS 1005 | absent | Pharmacology and Medication Management I |
| NURS 1100 | Experiential Learning - Simulation I | Not a course block. `NURS 1101` precludes it as no longer offered. |
| NURS 1101 | absent | Experiential Learning - Simulation I |
| NURS 2000 | Community Health | Not a course block. `NURS 2010` precludes additional credit for it. |
| NURS 2010 | absent | Community Health |
| NURS 2111 | absent | Experiential Learning - Integrated Simulation |
| NURS 2011 | Health Equity and Social Justice | Absent from course blocks. |
| NURS 2012 | Resilience Training | Absent from course blocks. |
| NURS 2013 | Interpersonal Communication | Absent from course blocks. |
| NURS 3002 | Directed Studies - NCLEX | Absent from course blocks. |
| NURS 1000 | Indigenous Health | Still a course block (not re-titled in this check). |

Local 44; calendar 41 (37 shared, 7 only local, 4 only calendar).

`NURS 4112` is still a course block, titled Experiential Learning - Improving Nursing. The local name (“Nursing B. Credits Not Included in the Major CGPA…”) is scrape debris, so the old title is **unverified**.

### ECOR

Fifteen local ECOR codes are not 2026-27 course blocks. The calendar text marks these no longer offered (some also still appear inside old prerequisite sentences): `ECOR 1010`, `1041`, `1042`, `1043`, `1044`, `1045`, `1046`, `1047`, `1048`, `1051`, `1052`, `1053`, `1054`, `1101`, `1606`.

No new ECOR codes were found. Local 28; calendar 13.

The local name for `ECOR 1606` (“Problem Solving and Computers 10. 0.5 credit from:”) is scrape debris. The code itself is explicitly no longer offered. The clean 2025-26 title was not re-verified.

### MUSI

Largest churn. Local 101; calendar 94 (80 shared, 21 only local, 14 only calendar).

New blocks include `MUSI 3008` Popular Music 1980-2000, `MUSI 3105` Western Art Music: 1600 to 1750, `MUSI 3304` Principles and Practices of Music Pedagogy, `MUSI 3308` Music and Environment, `MUSI 3720` Global Music Traditions, `MUSI 4008` Exploratory Music, `MUSI 4101` Music and Identity, `MUSI 4108` Popular Music in 12 Songs, `MUSI 4301` Music, Community, and Social Justice, `MUSI 4302` Music Industries and Histories, `MUSI 4305` Western Art Music: 1900 to the Present, `MUSI 4309` Music and Disability, `MUSI 4706` Sound Studies, `MUSI 4707` Songwriting.

Examples the calendar marks no longer offered: `MUSI 2102`, `MUSI 2103`, `MUSI 3403`, `MUSI 3408`, `MUSI 3409`, `MUSI 4306`. Others are simply absent as course blocks, including `MUSI 2009`, `MUSI 3104`, `MUSI 3400`, `MUSI 3405`, `MUSI 4007`, `MUSI 4702`.

Same-code retitles include `MUSI 2701` Popular Music Practice → Jazz and Popular Music Theory, `MUSI 3106` Popular Musics of the World → Global Popular Music, `MUSI 4102` Ethnomusicology in Theory and Practice → Music and Ethnography in Ottawa, `MUSI 4104` First Peoples Music in Canada → Issues in Indigenous Music Studies, `MUSI 4105` Study of Musics in Africa → Issues in African Music Studies.

### MECT, SREE, ENVE

- `MECT`: local has 2 codes; 2026-27 has 10. Added: `MECT 3200` Sensors & Actuator Hardware Control, `MECT 3201` Solid Mechanics, `MECT 3300` Signal Processing, `MECT 3500` Dynamic Systems & Control, `MECT 3510` Mechatronics Design I, `MECT 4400` Thermo-Fluid, `MECT 4500` Robotics, `MECT 4510` Mechatronics Design II.
- `SREE`: 5 added, none removed. Includes `SREE 2100` Fundamentals of Energy Conversion, `SREE 3100` Low-Carbon Energy Generation I, `SREE 3200` Low-Carbon Energy Generation II, `SREE 3300` Risk and Decision Analysis in Engineering, `SREE 4100` Modeling and Analysis of Energy Systems.
- `ENVE`: 5 added, none removed. Includes `ENVE 2100` Transport and Transformation of Environmental Contaminants, `ENVE 2300` Fluid Mechanics, `ENVE 3100` Air Quality Engineering, `ENVE 3104` Environmental Planning and Impact Assessment, `ENVE 3105` Engineering and Decision Analysis. `ENVE 2001` retitled from Process Analysis for Environmental Engineering to Foundations of Environmental Engineering.

### MATH, STAT, DATA, BUSI

- `MATH 1805` Discrete Structures I: explicitly no longer offered (calendar points at `COMP 1805`).
- `MATH 2000` Multivariable Calculus and Fundamentals of Analysis: explicitly no longer offered. New blocks: `MATH 2001` … I and `MATH 2002` … II.
- Also new: `MATH 3702` Mathematical Modelling (Honours), `MATH 4702` Industrial Mathematics (Honours).
- Retitles: `MATH 3806` Numerical Analysis (Honours) → Scientific Computing I (Honours); `MATH 4806` Numerical Linear Algebra (Honours) → Scientific Computing II (Honours).
- `STAT 3210` is not a 2026-27 course block. New block with the same title: `STAT 2210` Inferential Data Science Foundations I.
- `DATA 2200` is not a 2026-27 course block. New block with the same title: `DATA 3200` Communication Skills for Data Scientists. The other six DATA codes are shared.
- `BUSI`: removed as current blocks — `BUSI 1002` (explicitly no longer offered), `BUSI 1850`, `BUSI 2505` (only appears as a prerequisite alternative, not a course block), `BUSI 2850`. Added: `BUSI 2535` Financial Planning I, `BUSI 3535` Financial Planning II, `BUSI 4535` Financial Planning III. Local 154; calendar 153.

### HIST, ENGL, PHIL, SOCI, CHEM

- `HIST 2304` Social and Cultural History of Canada: explicitly no longer offered. New: `HIST 2313` Home, Work, and Play in Early Canada, `HIST 2314` Home, Work, and Play in Modern Canada, `HIST 2510` 19th-Century Germany, `HIST 2511` 20th-Century Germany, `HIST 4609` Seminar in Russian Cultural History. `HIST 3905` Topics in International History is absent as a course block. Local 151; calendar 154.
- `ENGL`: absent as course blocks — `ENGL 3305` Shakespeare and the Stage, `ENGL 3306` Shakespeare and Film, `ENGL 3420` Professional Writing Practicum. New: `ENGL 2914` Special Topics in Writing, `ENGL 3307` Shakespeare Studies, `ENGL 3402` 18th-Century Literature, `ENGL 3601` 20th- and 21st-Century Poetry, `ENGL 3603` 20th- and 21st-century Fiction. Whether 3307 replaces 3305/3306 is **unverified** (the calendar excerpts read here do not say so).
- `PHIL`: three added, none removed — `PHIL 3002` 17th Century Philosophy, `PHIL 3003` 18th Century Philosophy, `PHIL 3005` 19th Century Philosophy.
- `SOCI`: `SOCI 3000`, `SOCI 3002`, and `SOCI 4009` are explicitly no longer offered. Also absent as blocks: `SOCI 2030`, `SOCI 3420`. `SOCI 4200` is not a course block. New: `SOCI 2004` Data Literacy for Social Sciences, `SOCI 3008` Data Analysis for Social Sciences, `SOCI 3015` Palestine: History, Culture and Anti-Colonial Struggle, `SOCI 4102` Multiple Regression Analysis. `SOCI 3030` retitled to Work, Industry, and Occupations.
- `CHEM 1008` Inquiry in Chemistry Research: absent (not found even as a cross-reference). Retitles: `CHEM 3201` → Structure Elucidation; `CHEM 3202` Advanced Organic Chemistry II → Organic Chemistry III. `CHEM 1001` is still the same course; the local name has a trailing “&” from extraction.

### Architecture, SYSC, and a few others

- Drawing moved: `ARCN 1005` Introduction to Drawing: Seeing Through the Hand is explicitly no longer offered. Current block: `ARCH 1007` with that same title. `ARCH 1000` Introduction to Architecture and `ARCC 2100` Design and the Environment are explicitly no longer offered. Several `ARCS 2105` / `2106` / `2302` / `2303` / `2304` studio codes are marked no longer offered (they also remain inside some prerequisite sentences). `ARCN 3999` is absent as a block; `ARCH 3999` Co-operative Work Term is new.
- `SYSC 1005`, `SYSC 2001`, `SYSC 3601`, and `SYSC 4507` are explicitly no longer offered. `SYSC 2003` Introductory Real-Time Systems is absent as a course block. No new SYSC codes. Local 69; calendar 64.
- `ELEC 4504` Avionics Systems: explicitly no longer offered. Related, not claimed as the same course: new `AERO 3504` Avionics I, and `AERO 4504` retitled Avionics II. Also new: `AERO 3303` High-Speed Flight Aerodynamics. `AERO 4302` and `AERO 4402` retitled (Aircraft Aerodynamics; Aircraft Propulsion).
- `HLTH 4201` explicitly no longer offered; new `HLTH 2201` Applied Health Statistics. Also new: `HLTH 4203` Social Dimensions of Aging, `HLTH 4403` Gender and Health.
- `IDES 4002` Professional Practice explicitly no longer offered; new `IDES 3002` Professional Practice. Also absent as blocks: `IDES 3105`, `IDES 3202`, `IDES 4200`.
- `COMS 2501` Media Law and `COMS 3404` Music Industries explicitly no longer offered. New: `COMS 2401` Media Law and Ethics in a Digital World, `COMS 4302` Music Industries and Histories. Parallel new blocks: `JOUR 2400` and `MPAD 2400` (same media-law title). `JOUR 2501` and `MPAD 2501` are not current blocks (`JOUR 2501` is marked no longer offered).
- `PSYC 4235` Psychology of Climate Change: explicitly no longer offered. No replacement code was verified.
- `PSCI 3104` and `PADM 4320` are absent as course blocks (local titles: Politics in Cent/Eastern Euro; Ethics for Public Policy). No replacement was verified.
- `ISAP` codes otherwise match; one addition: `ISAP 4006` Bridging Science and Society.
- `ANTH 3015` Palestine: History, Culture and Anti-Colonial Struggle is new (also listed as `SOCI 3015`).
- `LAWS 3504` retitled Law and Aboriginal Peoples → Law and Indigenous Peoples.
- `CIVE 3307` Municipal Hydraulics, `MECH 2600` Introduction to Biomedical Engineering, `PHYS 4705` Introduction to Quantum Phenomena, `LING 3802` Beyond the BA, `FILM 1130` Film Studies Research and Methods, `FILM 3404` Ecocinema, `IMD 3002` 3D Computer Graphics, `IRM 3009` Information Backup and Recovery, `WGST 3999` Co-operative Work Term, `ENSC 4207` / `ERTH 4207` Environmental Isotopes are in the 2026-27 blocks and absent from the file.
- Five local `DIGH` 5000-level codes (`DIGH 5000`, `5011`, `5012`, `5800`, `5902`) are absent from the undergraduate DIGH page. They look like graduate numbers that the old extract picked up. Whether they were ever undergraduate calendar courses is **unverified**.
- `LAWS 3206`, `LAWS 5008`, and `LAWS 5302` are absent as undergraduate course blocks. Local names contain program-list debris (“8. 1.5 credits from”, and similar). Treat those three local rows as **unverified** as real course titles, not as confirmed 2025-26 deletions.
- `CIED 0999` Academic Prep is absent. Not re-checked against a 2025-26 archive.
- `BIOC 3202` and `BIOC 4204` are absent as course blocks. No “no longer offered” sentence was found for them in this pass, so retirement wording is **unverified**; they are not current blocks.

### Same-code title changes (substantive)

These codes exist in both places and the titles are not the same string, not a truncation, and not punctuation-only:

- `AERO 4302`, `AERO 4402`, `AERO 4504`
- `CHEM 3201`, `CHEM 3202`
- `COMP 3008`, `COMP 4806`
- `COMS 4411` Algorithmic Culture → Artificial Intelligence and Algorithmic Cultures
- `COMS 4503` Visualizing Social Media… → Platform Practices and Analytics
- `ENVE 2001`
- `HUMS 1500` …Five Books that → …Great Books - Big Ideas (local title is also cut off)
- `LAWS 3504`
- `MATH 3806`, `MATH 4806`
- `MUSI 2701`, `3106`, `3205`, `4006`, `4102`, `4104`, `4105`, `4205`, `4209`
- `NEUR 1202` and `NEUR 1203` (Disease → Conditions)
- `SOCI 3030`
- `SOWK 3002` Introduction to Statistical Analysis in Social Work → Introduction to Data Analysis and Visualization for Social Work

`NURS 3101` is the same course with hyphens dropped and program text stuck on the local name, not a confirmed rename. `NURS 4112` local title is unverified (see above).

## What a refresh of courses.json needs

1. Re-extract course-block code and title from every subject linked on the 2026-27 Courses index, including Biotechnology (`BTEC`). Follow the real hrefs: ACSE is `/undergrad/courses/acse/`, ISAP is `/undergrad/courses/ISAP` (no trailing slash in the index).
2. Keep only current course blocks. Do not keep codes that appear only as “no longer offered” or as leftover prerequisites.
3. Parse the title inside the course block only. The current file truncates some titles and, on others, appends the next program rule (“credits in”, “B. Credits Not Included in the Major CGPA”). Those rows should be cleaned even when the code is unchanged.
4. After the scrape, diff against this file: expect on the order of 102 additions and 107 deletions, plus the title changes above, then re-check the Updates page so a later Senate correction (Nursing already changed once this calendar year) is not missed.
5. If the app needs “offered this term” rather than “in the calendar,” that is a separate pull from the class schedule. `courses.json` is a code-and-name catalog; the calendar course list is the right source for a refresh.

## Unverified

- Exact 2025-26 wording for rows whose local titles are scrape debris (`ECOR 1606`, `NURS 4112`, `LAWS 3206`, `LAWS 5008`, `LAWS 5302`, `MPAD 2501`, and similar).
- Whether `DIGH` 5000-level rows and `CIED 0999` were real 2025-26 undergraduate courses.
- Whether `ENGL 3307` is the official replacement for `ENGL 3305` / `ENGL 3306`.
- A “no longer offered” label for `BIOC 3202` and `BIOC 4204` (they are simply not current course blocks).
- Full title equality for the 66 prefixes whose **codes** match. Only mismatches that failed a string check were reviewed.

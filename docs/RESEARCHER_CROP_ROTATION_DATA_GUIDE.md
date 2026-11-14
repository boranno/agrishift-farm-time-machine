# AgriShift Researcher Brief

## Khulna crop-rotation evidence and dataset handoff

**Version:** 1.0  
**Prepared:** 9 November 2026  
**Audience:** Agricultural researcher supporting AgriShift  
**Purpose:** Collect and document local agronomic evidence that the development
team can safely turn into a transparent crop-rotation comparison and, only
where labels support it, a validated model.

> This brief is a data-collection specification, not a crop recommendation or
> field-sampling protocol. The researcher and relevant local authorities must
> approve the site, crop calendar, laboratory methods, sampling design,
> permissions, and any agronomic interpretation.

## 1. Project question and scope

AgriShift is developing farmer-facing crop-rotation decision support for
saline coastal farming in Khulna. The core comparison is a documented current
rotation against a small number of locally feasible alternatives, considering
soil, water, crop sequence, management, and farmer constraints.

For the first evidence package, please recommend **one pilot locality** and
locally relevant crop sequences. Include the current/common practice as the
baseline and alternatives only when credible local evidence supports them.
Record the actual crop and management dates; do not rely on season names alone.

Yes, a reusable **crop database is part of this handoff**. Keep the crop
catalog (what the crop is), variety catalog (what cultivar is planted), and
crop-stage/evidence records (what is known about its duration and response to
environmental conditions) separate from individual field crop events. This
lets the backend use one referenced crop record across farms without treating
an undocumented threshold as fact.

The deliverable is an evidence-backed dataset and review pack. It is not
necessary to train an ML model. A small or observational dataset may support
exploration and rule review, but cannot by itself establish general model
performance or causal benefits of a rotation.

## 2. Researcher priorities

Please return these items in order of importance:

1. **Pilot definition:** district, upazila, union/village or polder where
   evidence is available; local crop calendar; soil/water context; and why this
   location is a useful, bounded pilot.
2. **Crop reference catalog:** standardized crop identities, local names,
   varieties, crop-stage timing, and source-backed environmental-response
   information for crops relevant to the pilot.
3. **Crop and rotation evidence:** locally practiced sequences, planting and
   harvest windows, water needs/constraints, and feasible alternatives. Cite
   the exact source for each factual claim.
4. **Evidence inventory:** SRDI soil records, field/lab measurements, BARI/BRRI
   or DAE guidance, peer-reviewed studies, and any trial or extension records.
   Record access permission and reuse restrictions for every source.
5. **Structured data:** the CSV files in Section 5 with a data dictionary,
   units, missing-value explanations, and stable anonymous IDs.
6. **Methods and quality report:** how measurements and observations were
   produced; what is missing or uncertain; and which data must not be used for
   prediction or generalization.
7. **Scientific review:** review of current AgriShift rotation claims and
   proposed comparisons, identifying claims that are supported, unsupported,
   location-specific, or unsafe to generalize.

If some information is unavailable, mark it as unavailable and explain why.
Do not estimate or fill in a measurement to make the tables look complete.

## 3. What to collect

### A. Site and plot context

- Administrative location and, where permitted, coordinates and coordinate
  accuracy. Use WGS84 decimal degrees and record how the location was obtained.
- AEZ, polder or hydrological unit when known, soil landscape/texture, drainage,
  elevation source, and exposure to tidal or saline water.
- Plot area and boundaries or a clearly documented representative point.
- Water access: rainfed, pond, canal, river, groundwater, or mixed; seasonal
  availability and known quality constraints.
- Do not include farmer names, phone numbers, national IDs, or precise private
  coordinates in the shareable dataset. Use coded IDs; keep any re-identification
  key separately with the data owner.

### B. Crop calendar and rotation history

For each crop event, capture crop and variety as locally named and, when
possible, a standardized code; preceding crop; sowing, transplanting, and
harvest dates; establishment method; fallow/relay/intercrop status; and the
source or respondent type for each record.

Record actual dates as well as local season labels (Rabi, Kharif-1, Kharif-2).
Season timing can vary by locality and year. Mark whether dates are measured,
from a farm log, recalled, or taken from a published calendar.

### C. Soil measurements

For every sample, capture plot, date, crop stage, sampling depth, sampling
method, laboratory, analytical method, units, and replicate/sample identifier.
For salinity:

- Record whether the result is **ECe** (electrical conductivity of the
  saturated-paste extract) or another method such as EC1:5. These are not
  interchangeable. Preserve the method exactly; do not convert unless the
  conversion is documented and approved by the researcher.
- Record units and reference temperature/correction where supplied (commonly
  dS/m at 25 °C for ECe).
- Prefer comparable pre- and post-season samples from the same plot and
  documented depth, using an approved local sampling and lab protocol.
- Include pH, texture, organic matter/carbon, and nutrients only when measured;
  include the method and units for each.
- A soil sample is a measurement at a point/time/depth, not automatically a
  field-wide or satellite-scale truth value.

Do not infer soil salinity from NASA soil moisture or vegetation indices.
Satellite products can provide environmental context; they do not replace
ground salinity measurements.

### D. Crop and rotation outcomes

Where records exist, capture harvested area, harvested mass, yield unit and
moisture basis, crop failure or damage, quality/grade, and harvest date. Keep
raw reported values as well as any standardized yield calculation. State the
calculation and denominator.

For any claimed rotation benefit (yield, soil salinity change, water saving,
fertilizer reduction, income, or soil-health improvement), include the
comparison group, period, number and type of observations, method, and source.
Do not attribute a change to the rotation alone if other management or weather
differences could explain it.

### E. Water and farm management

Record irrigation/drainage events, source, dates, amounts and units where
measured, water quality including ECw where tested, fertilizer/organic inputs,
crop protection and tillage, residue handling, and major management changes.
For each value distinguish measured, farmer-reported, estimated, or unknown.
Attach a method/source to reported and estimated values.

### F. Environmental and NASA context

The developer will handle NASA product/API extraction and joins unless
otherwise agreed. The researcher should identify which local crop decisions
could plausibly depend on rainfall, temperature, soil moisture, vegetation,
flooding, or salinity, and provide locally appropriate crop-stage context.

Keep NASA data in a separate, provenance-preserving table. Record product,
provider, version, variable, units, pixel/grid scale, time coverage,
coordinates/area extraction method, access date, quality flags, and all
aggregation or transformation steps. Do not mix gridded observations with
field measurements without labeling their different scales.

The MIT coastal Bangladesh salinity visualization may be cited as external
regional research and scenario context. Its modeled projections are not
AgriShift predictions, current field measurements, or training labels unless
the research team confirms a suitable downloadable dataset, terms, and method.

## 4. Study design and interpretation

- Label each dataset as **controlled trial**, **observational farm record**,
  **laboratory/extension record**, **published reference**, or **remote-sensing
  product**. Do not combine these categories without retaining the type.
- For a field trial, document the protocol, treatment definitions, comparator,
  plot/block layout, randomization, replication, season/year, exclusions, and
  deviations. The researcher should set and justify sample size and sampling
  design; this brief does not prescribe either.
- For observational data, document selection and possible confounders. Do not
  call an association a causal rotation effect.
- Capture rotation history across multiple seasons. A single soil sample or
  one season of yield cannot establish a multi-year soil-health or rotation
  effect.
- Keep evidence-based rules distinct from ML predictions. Rules need cited
  thresholds, scope, and reviewer approval. ML needs an explicit target,
  sufficient representative labeled examples, leakage-safe validation, metrics,
  and limitations.
- Do not train or score on synthetic/demo rows. Keep missing or unavailable
  values missing; never encode missing as zero.

## 5. Recommended dataset folder and CSV schemas

Deliver plain UTF-8 CSV files with one row per entity/event, a header row,
stable IDs, and no merged cells. Use ISO dates (`YYYY-MM-DD`), decimal numbers,
WGS84 latitude/longitude, and explicit units in column names or this
dictionary. Empty values should be blank/NA with a separate missing reason
where relevant; zero is a real measurement, not a missing-value code.

```text
researcher-handoff/
  README.md
  data_dictionary.csv
  sources_and_permissions.csv
  crop_source_links.csv               # normalize citations in database
  evidence_source_links.csv            # normalize citations in database
  crop_catalog.csv
  crop_varieties.csv
  crop_stage_evidence.csv
  sites.csv
  plots.csv
  rotation_treatments.csv
  rotation_treatment_steps.csv
  crop_events.csv
  soil_samples.csv
  water_samples.csv
  management_events.csv
  harvest_outcomes.csv
  environmental_observations.csv   # local observations only, if available
  field_protocols/                  # approved protocol or redacted notes
  references/                       # citations/links; only share permitted files
```

### `sites.csv` — study location

| Field | Type / units | Required | Meaning |
|---|---|---:|---|
| `site_id` | text ID | Yes | Anonymous stable site code; primary key. |
| `district`, `upazila` | text | Yes | Administrative location. |
| `union`, `village_or_polder` | text | If known | More specific locality; generalize if disclosure risk. |
| `latitude`, `longitude` | decimal degrees | If permitted | WGS84 representative coordinate; restrict precision if needed. |
| `coordinate_accuracy_m` | metres | If known | Accuracy/source of coordinate. |
| `aez_code` | text | If known | Agro-Ecological Zone and source. |
| `site_context` | text | Yes | Short description of coastal, hydrological, and farming context. |
| `location_source` | text | Yes | GPS, map, administrative record, or other source. |

### `plots.csv` — plot or field unit

| Field | Type / units | Required | Meaning |
|---|---|---:|---|
| `plot_id` | text ID | Yes | Anonymous stable plot code; primary key. |
| `site_id` | text ID | Yes | Links to `sites.site_id`. |
| `area_m2` | m² | If known | Measured or documented plot area. |
| `soil_texture`, `drainage_class` | text | If known | Value plus method/source in notes or dictionary. |
| `irrigation_access` | controlled text | Yes | `rainfed`, `pond`, `canal`, `groundwater`, `mixed`, `unknown`. |
| `record_start_date`, `record_end_date` | ISO date | If known | Coverage of farm/plot records. |

### `crop_catalog.csv` — canonical crop identities

One row per crop species or locally meaningful crop type, not one row per
planting. Keep local names as aliases and do not silently merge crops that
have different agronomic identities.

| Field | Type / units | Required | Meaning |
|---|---|---:|---|
| `crop_id` | text ID | Yes | Stable canonical crop code; primary key. |
| `crop_name_en` | text | Yes | Standard English/common name used by the app. |
| `crop_name_bn` | text | If available | Researcher-reviewed Bangla name. |
| `crop_name_local` | text | If available | Name used in the pilot locality. |
| `scientific_name` | text | If known | Botanical name; cite/verify ambiguous identities. |
| `crop_group` | controlled text | Yes | For example cereal, pulse, oilseed, green manure, vegetable. |
| `crop_use` | text | If known | Food, fodder, green manure, oil, or other locally relevant use. |
| `identity_source_ids` | text/list | Yes | Source IDs supporting names/classification. |
| `identity_review_status` | controlled text | Yes | `unreviewed`, `reviewed`, or `ambiguous`; note reviewer. |

### `crop_varieties.csv` — variety/cultivar identities

Keep cultivar-specific claims here; do not assume a species-level trait applies
to every variety.

| Field | Type / units | Required | Meaning |
|---|---|---:|---|
| `variety_id` | text ID | Yes | Stable cultivar code; primary key. |
| `crop_id` | text ID | Yes | Links to `crop_catalog.crop_id`. |
| `variety_name` | text | Yes | Exact released or locally used variety name/code. |
| `variety_name_local` | text | If available | Local name/alias; preserve the original spelling. |
| `release_or_registration_source_id` | text | If known | Source confirming identity/release; do not infer. |
| `duration_days_min`, `duration_days_max` | days | If evidenced | Crop duration range and the conditions/definition. |
| `seed_or_propagule_notes` | text | If relevant | Source-backed availability/establishment facts, not a market guarantee. |
| `source_ids` | text/list | Yes | Sources for all supplied variety-level facts. |
| `review_status`, `reviewer`, `review_date` | text / ISO date | Yes | Review state and who checked the record. |

### `crop_stage_evidence.csv` — stage timing and environmental response

Use one row per crop or variety, stage, environmental factor, and cited
evidence claim. A crop-stage calendar row can have a blank factor/threshold
when only the timing is known. Thresholds must be supported by a source and
must preserve the tested conditions; never fill thresholds from general
internet summaries or model convenience.

| Field | Type / units | Required | Meaning |
|---|---|---:|---|
| `evidence_id` | text ID | Yes | Stable unique evidence-row code. |
| `crop_id`, `variety_id` | text IDs | Yes / if variety-specific | Crop identity and optional cultivar link. |
| `stage_code`, `stage_name_local`, `stage_name_en` | text | Yes | Stage identity and reviewed names. |
| `stage_start_day_min`, `stage_start_day_max` | days from planting | If known | Documented approximate stage timing; state planting-date basis. |
| `factor` | controlled/text | If response claim | E.g. heat, rainfall deficit/excess, soil salinity, inundation. |
| `response_type` | text | If response claim | The documented response/outcome, not a general “risk” label. |
| `threshold_min`, `threshold_max`, `threshold_unit` | numeric/text | Only if source specifies | Preserve threshold direction, duration, crop stage, cultivar, and measurement method in conditions. |
| `conditions_and_scope` | text | Yes | Location, soil/water context, duration, growth stage, and applicability limits. |
| `source_ids` | text/list | Yes | Exact citations from `sources_and_permissions.csv`. |
| `evidence_type`, `review_status` | text | Yes | Trial, official guidance, paper, expert review; plus review state. |

### `rotation_treatments.csv` — comparison strategy

| Field | Type / units | Required | Meaning |
|---|---|---:|---|
| `treatment_id` | text ID | Yes | Stable rotation/management strategy code. |
| `treatment_name` | text | Yes | Local and/or English name. |
| `comparison_role` | controlled text | Yes | `current_baseline`, `alternative`, or `trial_control`. |
| `sequence_description` | text | Yes | Ordered crops/seasons and fallow/relay details. |
| `evidence_type` | controlled text | Yes | Trial, observed practice, published recommendation, or proposed. |
| `source_ids` | text/list | Yes | IDs from `sources_and_permissions.csv`; multiple IDs separated consistently. |
| `review_status` | controlled text | Yes | `unreviewed`, `reviewed`, `not_supported`, with reviewer/date recorded. |

### `crop_events.csv` — one crop in one plot/season

| Field | Type / units | Required | Meaning |
|---|---|---:|---|
| `crop_event_id` | text ID | Yes | Stable unique crop-event code. |
| `plot_id` | text ID | Yes | Links to `plots.plot_id`. |
| `treatment_id` | text ID | If part of comparison | Links to rotation strategy; leave blank if not applicable. |
| `crop_id`, `variety_id` | text IDs | Yes / if known | Foreign keys to crop catalog and variety catalog; use IDs, not free-text as the join key. |
| `crop_name_local`, `variety_name_local` | text | If available | Preserve names as recorded; canonical names come from the catalogs. |
| `season_label`, `season_year` | text / year | Yes | Local season and agricultural year definition. |
| `previous_crop` | text | If known | Preceding crop or fallow; important for sequence effects. |
| `sowing_date`, `transplant_date`, `harvest_date` | ISO date | As applicable | Actual dates; distinguish observed from recalled/planned. |
| `establishment_method` | text | If known | Direct seed, transplanted, relay, intercropped, etc. |
| `date_source`, `date_quality` | text | Yes | Farm log, measured, recall, published calendar; quality/uncertainty note. |

### `soil_samples.csv` — one sample/replicate and lab result

| Field | Type / units | Required | Meaning |
|---|---|---:|---|
| `sample_id` | text ID | Yes | Stable unique sample code. |
| `plot_id` | text ID | Yes | Links to plot. |
| `sample_date`, `crop_event_id` | date / text ID | Yes / if relevant | Collection date and associated crop event. |
| `crop_stage` | text | If relevant | Stage at collection; use local/standard stage description. |
| `depth_top_cm`, `depth_bottom_cm` | cm | Yes | Sample depth interval. |
| `sampling_method`, `lab_name`, `lab_report_id` | text | Yes | Protocol/lab traceability; omit report ID if it exposes private data. |
| `salinity_value`, `salinity_unit`, `salinity_method` | decimal / text | If measured | Preserve ECe vs EC1:5 and method; never merge unlike methods. |
| `salinity_reference_temp_c` | °C | If supplied | Temperature reference/correction from lab protocol. |
| `ph_value`, `organic_matter_pct` | decimal | If measured | Include method and reporting basis in dictionary. |
| `texture_class`, `texture_method` | text | If measured | Preserve lab/field method. |
| `replicate_id`, `quality_flag` | text | Yes | Replicate identity and QC outcome. |

### `water_samples.csv` and `management_events.csv`

Water samples: `water_sample_id`, `plot_id` or `site_id`, `sample_date`,
`water_source`, `ecw_value`, `ecw_unit`, `method`, `lab_name`, `quality_flag`.
Use ECw for water electrical conductivity; do not confuse it with soil ECe.

Management events: `event_id`, `plot_id`, `crop_event_id`, `event_date`,
`event_type`, `input_or_source`, `amount`, `unit`, `method_or_note`,
`record_source`, `quality_flag`. Use separate rows for fertilizer, irrigation,
drainage, tillage, residue, and other events; never put several event types in
one cell.

### `harvest_outcomes.csv` — one measured outcome per crop event

`outcome_id`, `crop_event_id`, `harvested_area_m2`, `harvest_mass_kg`,
`yield_t_ha`, `yield_moisture_pct`, `moisture_basis`, `harvest_date`,
`quality_or_grade`, `crop_failure_status`, `damage_cause`,
`measurement_method`, `record_source`, `quality_flag`.

Keep raw harvested area/mass and moisture basis. If a standardized yield is
provided, document its formula and standard moisture basis; do not mix
standardized and unadjusted values without a flag.

`crop_events.csv` records what was planted in one plot/season and should
reference `crop_catalog.csv` and `crop_varieties.csv`. The catalogs hold
reusable crop identities and cited traits. A rotation sequence can be
reconstructed by ordering crop events by dates and linking them to the
treatment.

### `environmental_observations.csv` — optional local observations

`observation_id`, `site_id` or `plot_id`, `observation_datetime`,
`variable`, `value`, `unit`, `measurement_method`, `source_id`,
`spatial_temporal_scale`, `quality_flag`. Use this for documented local weather,
water level, inundation duration/depth, or other measurements. NASA-derived
values should be ingested and provenance-tagged separately by the developer.

### `sources_and_permissions.csv` — required source register

`source_id`, `citation_or_title`, `organization_or_authors`, `publication_year`,
`url_or_archive_reference`, `page_table_or_section`, `data_owner`,
`access_date`, `license_or_permission`, `attribution_required`,
`allowed_project_use`, `limitations`, `reviewer`.

Every number, crop threshold, calendar, sequence claim, and dataset row must be
traceable to a source, measurement, or explicitly labeled assumption. For
literature, provide the page/table/figure where possible. Record “permission
not yet confirmed” rather than assuming a source can be redistributed.

## 6. How the database should be organized

The CSV handoff is an **exchange/import format**. The application database
should be relational (PostgreSQL is a suitable choice for the planned FastAPI
backend), with stable primary keys and foreign keys. Do not keep the whole crop
catalog in one spreadsheet cell or duplicate crop traits in every farm record.

```text
sources --< crop_source_links >-- crops --< crop_varieties
                                      |
                                      +--< crop_stage_evidence
                                                |
                           evidence_source_links >-- sources

sources --< site_source_links >-- sites --< plots --< crop_events >-- crop_varieties
                                                       |
                                                       +--< soil_samples
                                                       +--< management_events
                                                       +--< harvest_outcomes

sources --< rotation_source_links >-- rotation_treatments
                                          |
                                          +--< rotation_treatment_steps >-- crops / varieties
```

`A --< B` means one A record can be linked to many B records. A join/link table
is used when a fact has several sources or when a source supports multiple
records.

The handoff can keep source IDs as clearly delimited lists for convenience,
but the production database should use one row per link in tables such as
`crop_source_links(crop_id, source_id)` and
`evidence_source_links(evidence_id, source_id)`.

### Core table responsibilities and keys

| Database table | Key relationship | Store this |
|---|---|---|
| `crops` | `crop_id` primary key | Canonical crop identity and reviewed names; no farm measurements. |
| `crop_varieties` | `variety_id` primary key; `crop_id` foreign key | Cultivar identity and cultivar-specific documented traits. |
| `crop_stage_evidence` | `evidence_id` primary key; crop/optional variety foreign keys | One sourced stage-timing or environmental-response claim, with method, scope, units, review state, and valid/source dates. |
| `sites` / `plots` | `site_id` / `plot_id`; plot references site | Generalized location and field context; protect precise coordinates and identity. |
| `crop_events` | `crop_event_id`; plot, crop, variety, optional treatment foreign keys | What was actually grown in that plot and season, with actual dates and record quality. |
| `rotation_treatments` / `rotation_treatment_steps` | treatment and ordered step keys | A proposed or studied sequence. Each step references a crop/variety and season/order; do not rely on free-text sequence descriptions as machine-readable data. |
| `soil_samples`, `water_samples` | sample key; plot/site and optional crop-event foreign keys | Raw lab/field results, method, units, depth, time, replicates, and QA flags. |
| `management_events`, `harvest_outcomes` | event/outcome key; plot and crop-event foreign keys | Management exposures and measured crop outcomes. |
| `sources` and `*_source_links` | source key plus record/source composite key | Citation, source location, permissions, and exact links from evidence records to sources. |
| `environmental_observations` | observation key; site/plot and source/product keys | Local or remote-sensing observation, with provider, product, scale, time, units, and QC. Keep product-derived rows distinct from field measurements. |

Use database constraints for unique IDs, required values, valid foreign keys,
positive area, valid date order, and controlled status/method values where
appropriate. Preserve raw values; put standardized/derived values in separate
columns or derived tables with formulas and software/version recorded. Use
database migrations so schema changes are reviewable. Do not put farmer names,
contact details, or re-identification keys in the shared research database.

### Crop catalogue use in the application

- Every crop/variety gets a stable ID; names in Bangla, English, and local
  languages are labels/aliases, not join keys.
- A variety belongs to a crop. A crop event references the selected variety
  when known; otherwise leave variety unknown instead of guessing.
- A crop-stage evidence row represents one claim, such as a documented
  approximate stage window or response to a factor. Store the source and
  conditions on the claim, not just a single threshold number.
- Candidate rotation steps reference crop and optional variety IDs and have
  sequence order, season, and source/review status. Actual `crop_events` record
  what happened, not what was recommended.
- Version evidence records rather than silently overwriting facts when a
  cultivar release, local calendar, source interpretation, or review changes.
- Keep evidence states explicit, for example `reported`, `source_verified`,
  `expert_reviewed`, `not_supported`, and `superseded`; define these states with
  the developer and researcher.

## 7. How this structure helps the ML engineer

The researcher should hand over **source data and labels**, not a pre-made
model matrix with undocumented assumptions. The ML engineer creates a
reproducible feature dataset from the normalized records and NASA data.

For each training row, the engineer must define the prediction unit (for
example plot-season or sample-date), target and unit (such as a specified
method of soil salinity or a documented crop outcome), prediction date/horizon,
and which inputs would actually have been available at prediction time.

| ML record field | Purpose |
|---|---|
| `example_id` | Stable row ID for a sample, plot-season, or other defined prediction unit. |
| `plot_id`, `site_id`, `crop_id`, optional `variety_id` | Grouping, joins, and reporting; identifiers are not automatically numeric features. |
| `season_year`, crop-window start/end, observation cutoff | Defines the prediction task and prevents future information from entering features. |
| `target_name`, `target_value`, `target_unit`, `target_method`, `target_date` | Exactly what was measured/predicted, how, and when. Keep the observed target separate from predictors. |
| `feature_name`, `feature_value`, `feature_unit`, `feature_window` | Values available before prediction; include aggregation window and method. Prefer a long-form feature table or a versioned wide snapshot. |
| `source_ids`, `quality_flags`, `missingness` | Provenance, QC, and missing-data behavior for labels and features. |
| `feature_pipeline_version`, `dataset_version`, `split_group` | Reproducibility and leakage-safe group split (e.g. held-out site, plot, or year). |

Before fitting, agree with the researcher on whether an observation is an
independent label, whether repeated samples are clustered within a plot, and
what held-out sites/years are scientifically meaningful. Do not randomly split
rows when samples from the same plot, trial, or time series can occur in both
train and test. Keep source records and raw labels immutable; version the
engineered dataset and code.

The crop database can support ML by supplying crop/variety identity, documented
stage timing, and sourced factor context. It does **not** make a crop-risk
target appear automatically: observed damage, measured ECe, yield, or another
defined outcome must come from suitable independent records. Do not use
post-outcome management, future weather, or future measurements as predictors
for an earlier forecast. Do not convert a published threshold into a training
label unless the researcher has explicitly designed and justified that task.

## 8. Responsible AI use by the researcher

AI may help organize literature, translate or normalize crop-name candidates,
extract draft fields from documents, check schema consistency, or draft
research questions. A qualified human must verify every scientific claim and
source. AI is not a source of truth and must not invent local observations,
citations, crop thresholds, crop calendars, measurements, consent, or
validation results.

### Knowledge base required for an AI assistant

Only provide materials that the data owner permits the tool to process. The
approved, versioned knowledge pack should contain:

- Official BARI/BRRI/DAE/SRDI documents or researcher-approved copies, with
  complete bibliographic details, page/table/figure numbers, publication date,
  language, source URL, and permission/reuse status.
- Peer-reviewed papers and trial reports relevant to the specific crop,
  variety, growth stage, Khulna/coastal setting, soil/water conditions, and
  environmental factor being reviewed.
- The project crop catalog, data dictionary, controlled vocabulary, and
  definitions for local crop names, seasons, ECe/EC1:5/ECw, and growth stages.
- Study protocols, method notes, and approved, de-identified data only when
  sharing with the selected AI system is authorized.
- A version/date for each document, plus a record of what is not covered. NASA
  data products and MIT projections must retain their own source, scale, and
  observed/model/scenario status; they are not interchangeable with local
  measurements.

Keep retrieval grounded in this approved pack and require citations to the
exact supplied document and page/table/section. If a source is absent or does
not support a claim, the assistant must return “not found / requires researcher
review,” not fill the gap from memory. Confirm the AI vendor's data handling,
retention, and privacy terms before uploading unpublished or restricted
material.

### Copyable prompt for evidence extraction

```text
You are assisting an agricultural researcher preparing AgriShift's Khulna
crop reference catalog. Use only the documents and approved data supplied in
this session. Do not use outside knowledge to fill gaps.

Task: extract candidate crop/variety identity, local and English names, crop
stage names and documented timing, and environmental-response statements that
are explicitly supported by the supplied sources. Return one proposed record
per distinct source-backed claim using the provided crop_catalog.csv,
crop_varieties.csv, and crop_stage_evidence.csv column definitions.

For every non-empty factual field, include source_id and exact page,
table, figure, or section. Preserve the source's units, measurement method,
crop/variety, growth stage, duration, location, and experimental conditions.
Keep ECe, EC1:5, and ECw distinct. Do not convert units, infer a threshold,
generalize a trial to all of Khulna, or turn correlation into a causal claim.
If a value or identity is missing or ambiguous, leave it blank and explain
what the researcher must verify. Do not create measurements, citations,
varieties, farmer testimony, model labels, or confidence scores.

Output:
1. Draft CSV rows matching the supplied headers.
2. A claim-to-citation table with short supporting quotations and page/section.
3. An uncertainty/ambiguity list and questions for the researcher.
4. A list of claims that should NOT be used for rules or ML until verified.

All rows are drafts. No row is approved for the crop database until the
researcher checks it against the original source and records reviewer,
review_date, and review_status.
```

### AI review and disclosure checklist

- Check each extracted row against the original source; an AI citation is not
  evidence until a person verifies that location in the source.
- Do not upload personal, identifying, confidential, unpublished, or
  permission-restricted farmer/research data unless the owner and tool terms
  explicitly allow it. Prefer approved redacted documents.
- Keep original source files and human-verified records; label AI drafts and
  never import unreviewed output as approved crop data or ML labels.
- Log tool/model and version when available, date, purpose, prompt, source
  material/data provided, output retained, human reviewer, corrections, and
  verification outcome in the project AI-use disclosure.
- Disclose AI use in the NASA submission as the current official instructions
  require. A prompt template does not replace that disclosure.

## 9. Example rows (illustrative format only)

The values below demonstrate formatting, **not real Khulna observations**.
Do not use them to train, evaluate, or recommend crops.

```csv
crop_id,crop_name_en,crop_name_bn,crop_name_local,scientific_name,crop_group,crop_use,identity_source_ids,identity_review_status
CROP-EXAMPLE,Example crop,,,,cereal,not_collected,SRC-EXAMPLE,illustrative_only
```

```csv
variety_id,crop_id,variety_name,variety_name_local,release_or_registration_source_id,duration_days_min,duration_days_max,seed_or_propagule_notes,source_ids,review_status,reviewer,review_date
VAR-EXAMPLE,CROP-EXAMPLE,Example variety,,,,,not_collected,SRC-EXAMPLE,illustrative_only,,
```

```csv
evidence_id,crop_id,variety_id,stage_code,stage_name_local,stage_name_en,stage_start_day_min,stage_start_day_max,factor,response_type,threshold_min,threshold_max,threshold_unit,conditions_and_scope,source_ids,evidence_type,review_status
EVIDENCE-EXAMPLE,CROP-EXAMPLE,,stage-1,,,,,,,,,,not collected,SRC-EXAMPLE,published_reference,illustrative_only
```

```csv
site_id,district,upazila,union,village_or_polder,latitude,longitude,coordinate_accuracy_m,aez_code,site_context,location_source
SITE-EXAMPLE,Khulna,Example upazila,,,,,,unknown,Illustrative only,not collected
```

```csv
sample_id,plot_id,sample_date,crop_event_id,crop_stage,depth_top_cm,depth_bottom_cm,sampling_method,lab_name,salinity_value,salinity_unit,salinity_method,salinity_reference_temp_c,replicate_id,quality_flag
SAMPLE-EXAMPLE,PLOT-EXAMPLE,,,,,,Not collected,Not collected,,,NOT_COLLECTED,,R1,illustrative_only
```

```csv
crop_event_id,plot_id,treatment_id,crop_id,variety_id,crop_name_local,variety_name_local,season_label,season_year,previous_crop,sowing_date,transplant_date,harvest_date,establishment_method,date_source,date_quality
EVENT-EXAMPLE,PLOT-EXAMPLE,TREATMENT-EXAMPLE,CROP-EXAMPLE,,,,,2026,,,,,,not_collected,illustrative_only
```

## 10. Data quality, ethics, and privacy checklist

- [ ] Stable IDs link crop → variety → crop-stage evidence, and anonymous IDs
      link site → plot → crop event → samples/outcomes.
- [ ] Units, method, date, depth, and source are present for every measurement.
- [ ] ECe, EC1:5, and ECw are not mixed or relabeled.
- [ ] Measured, recalled, estimated, modeled, and missing values are distinguishable.
- [ ] Missing values have a reason where known; zeros are not used as placeholders.
- [ ] Duplicate IDs, impossible dates, invalid coordinates, and unit inconsistencies
      are checked and reported, not silently deleted.
- [ ] QA/QC flags and any exclusions have explanations and preserve raw data.
- [ ] Farmer participation/consent and institutional permissions are documented
      with the responsible data owner; no unnecessary personal data is shared.
- [ ] Source license, citation, attribution, and redistribution restrictions are
      checked before project publication.
- [ ] Sensitive coordinates and field records are restricted or generalized as
      agreed with the researcher and data owner.
- [ ] The data pack contains a README, data dictionary, source register, and
      a short quality/method note.

## 11. Backend handoff and validation plan

The backend team will use the returned IDs and schemas to validate and ingest
records, retain original values and provenance, and join suitable environmental
data by location and date. Please do not pre-aggregate or overwrite raw lab
measurements. Include transformation formulas in a separate note.

Before a recommendation or ML output is enabled:

1. The researcher reviews crop names, calendars, thresholds, rotation feasibility,
   and source citations for the pilot locality.
2. The developer checks file schemas, uniqueness, units, missingness, date and
   location ranges, crop/variety foreign keys, and joins; invalid rows are
   reported with reasons.
3. The team defines a target that is actually measured (for example, lab ECe or
   standardized crop yield) before selecting an ML method.
4. Validation splits by independent plot/site and/or year as appropriate.
   Repeated samples from the same plot or season must not leak across train and
   test. Report performance by held-out group and include a simple baseline.
5. A small dataset is labeled exploratory. Do not claim general Khulna-wide
   accuracy from a single site/season or from random row splitting.
6. Final UI output states location scale, observation/model/scenario status,
   period, units, evidence, uncertainty/limitations, and when local expert
   review is required.

For the initial product, a transparent crop-rotation comparison using
researcher-reviewed evidence may be more defensible than a newly trained
predictive model. Keep the model as a later step until labeled data and
independent validation are adequate.

## 12. Researcher return checklist

Please return:

- [ ] Recommended pilot area and rationale; crop calendar with local variation.
- [ ] Current baseline rotation and candidate alternatives with traceable sources.
- [ ] Any available anonymized site/plot/crop/soil/water/management/harvest data.
- [ ] Data dictionary, source and permission register, and measurement protocols.
- [ ] Quality report: coverage, missingness, uncertainty, exclusions, and limits.
- [ ] Review notes on existing AgriShift numerical claims and crop assumptions.
- [ ] A short meeting/readout explaining what can be used now, what needs more
      fieldwork, and what should not be claimed.

## 13. Review references

- [NASA Space Apps 2026 Field Shift challenge](https://www.spaceappschallenge.org/2026/challenges/adapting-farms-with-nasa-data/) — crop-rotation decision-support scope and example Earth-observation sources.
- [MIT coastal Bangladesh soil salinity explorer](https://www.mit.edu/~eltahirgroup/DST_SoilSalinity/index.html) — external observed maps and modeled scenario projections; verify data reuse terms with the research team.
- AgriShift current rotation claims to audit: `frontend/src/services/rotationService.js`. Treat its hard-coded values as unverified until the researcher traces and reviews the original evidence.

**Scientific sign-off:** Researcher name/role: ____________________  
**Date:** ____________________  
**Scope reviewed / limitations:** ___________________________________________

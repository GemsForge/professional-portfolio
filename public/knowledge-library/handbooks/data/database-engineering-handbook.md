# 🗃️ Database Engineering Handbook

## Page 1: 🎯 Purpose

This practical field guide covers the personal data layer:

- 🪶 SQLite for local development
- 🐘 PostgreSQL for remote, multi-user applications
- 🧱 Minimum standards for creating tables
- 🔎 Useful SQL-editor patterns
- 🧪 DEV, FIT, and PROD separation
- ☁️ The minimum viable remote-database configuration

> 🧬 **Guiding principle:** Preserve the schema before preserving the implementation.

**📥 Collect → 🧱 Structure → 🏷️ Standardize → ✅ Validate → 📊 Analyze → 🔗 Connect**

---

## Page 2: 🧭 1. Database environments

| Environment | Purpose | Recommended database | Safety expectation |
|---|---|---|---|
| 🛠️ **DEV** | Local design, experiments, and development | SQLite or disposable PostgreSQL | Data may be reset; use sample or synthetic data |
| 🧪 **FIT** | Functional and integration testing | PostgreSQL preferred; SQLite compatibility tests when needed | Repeatable fixtures; no production personal data |
| 🚀 **PROD** | Real application and personal data | Managed PostgreSQL | Backups, restricted access, migrations, monitoring, and recovery |

In this book, **FIT** means **Functional/Integration Test**.

### 🔐 Environment rule

Every environment has its own database, connection string, credentials, configuration label, and data policy. Never let an application guess whether it is connected to DEV, FIT, or PROD.

### 🧭 SQLite vs PostgreSQL vs MySQL

The three systems solve related problems, but they are not interchangeable in every environment.

| Decision area | 🪶 SQLite | 🐘 PostgreSQL | 🐬 MySQL |
|---|---|---|---|
| **Database type** | Embedded file database | Client/server relational database | Client/server relational database |
| **Installation** | Very small; usually one executable and one file | Requires a running database server or managed provider | Requires a running database server or managed provider |
| **Best fit** | Local tools, prototypes, offline apps, imports, and tests | Production applications, complex relational data, APIs, and multi-user systems | Production web applications, common hosted workloads, and teams already using the MySQL ecosystem |
| **DEV use** | ✅ Preferred default for local development | ✅ Useful when DEV must match PROD | ✅ Useful when PROD is MySQL |
| **FIT use** | ✅ Fast unit and compatibility tests | ✅ Preferred for integration tests when PROD is PostgreSQL | ✅ Preferred for integration tests when PROD is MySQL |
| **PROD use** | ⚠️ Single-user or offline systems only | ✅ Planned default for the remote personal data layer | ✅ Viable alternative when required by hosting or application compatibility |
| **Concurrent writes** | Limited by file locking and workload | Strong multi-user concurrency | Strong multi-user concurrency |
| **Remote access** | Not designed as a network database | Designed for network access | Designed for network access |
| **Typing and constraints** | Flexible typing; constraints must be configured carefully | Strong typing and extensive constraints | Strong typing, with behavior depending on configuration and storage engine |
| **Complex queries** | Good for modest workloads | Excellent for advanced relational queries and extensions | Strong for common relational and web workloads |
| **Scaling path** | Usually migrate to a server database | Scales from small deployments to large systems | Scales from small deployments to large systems |
| **Portability** | Extremely portable; one database file | Portable through dumps, migrations, and managed services | Portable through dumps, migrations, and managed services |
| **Primary caution** | Not a shared production database for many writers | More operational setup and administration | Confirm SQL behavior, defaults, and hosting features before assuming portability |

### ✅ Practical selection rule

- Choose **SQLite** when the database is local, portable, single-user, offline, temporary, or used for tests.
- Choose **PostgreSQL** when the application needs a remote, secure, multi-user production database with strong relational behavior. This is the planned remote database for this architecture.
- Choose **MySQL** when a hosting provider, existing application, team standard, or compatibility requirement makes it the appropriate server database.

> 🔁 Keep the schema portable where practical, but test the actual target database. A SQLite success does not automatically prove PostgreSQL or MySQL compatibility.

### 🧭 Environment configuration contrast

The following is an **illustrative GemsForgeAPI configuration pattern**. It shows how the same application can use different database targets across environments; it is not a claim that these exact variable names are already implemented in the repository.

| Environment | 🪶 SQLite configuration | 🐘 PostgreSQL configuration | GemsForgeAPI-style example | Data policy |
|---|---|---|---|---|
| 🛠️ **DEV** | Local file such as `./Data/GemsForge_dev.sqlite` | Local or disposable database such as `gemsforge_dev` | `APP_ENV=DEV`<br>`DATABASE_PROVIDER=sqlite`<br>`SQLITE_PATH=./Data/GemsForge_dev.sqlite` | Safe for experiments; may be reset |
| 🧪 **FIT** | Separate fixture file such as `./Data/GemsForge_fit.sqlite` | Dedicated test database such as `gemsforge_fit` | `APP_ENV=FIT`<br>`DATABASE_PROVIDER=postgresql`<br>`DATABASE_URL=postgresql://.../gemsforge_fit` | Sanitized, repeatable test data only |
| 🚀 **PROD** | Only for a deliberate single-user/offline deployment | Managed database such as `gemsforge_prod` | `APP_ENV=PROD`<br>`DATABASE_PROVIDER=postgresql`<br>`DATABASE_URL=postgresql://.../gemsforge_prod`<br>`DATABASE_SSLMODE=require` | Real data; restricted access and backups |

### 🔐 Configuration rules across environments

- 🏷️ The environment name must be explicit: `DEV`, `FIT`, or `PROD`.
- 🗂️ Each environment must point to a different database file or database name.
- 🔑 Credentials belong in environment configuration or a secret manager, never in committed source files.
- 🧪 FIT must never use the PROD connection string.
- 🚀 PROD migrations should be applied by an approved migration process, not by the running application role.
- 🩺 The application health check should report the environment and schema version without exposing credentials.

### 🧱 Example application configuration structure

```text
GemsForgeAPI/
├── Sources/
│   └── App/
│       ├── DatabaseConfiguration.swift
│       └── Migrations/
├── Data/
│   ├── GemsForge_dev.sqlite
│   └── GemsForge_fit.sqlite
└── .env.example
```

```text
# .env.example — names and values are illustrative
APP_ENV=DEV
DATABASE_PROVIDER=sqlite
SQLITE_PATH=./Data/GemsForge_dev.sqlite

# FIT or PROD would use PostgreSQL instead:
# APP_ENV=FIT
# DATABASE_PROVIDER=postgresql
# DATABASE_URL=postgresql://user:password@host:5432/gemsforge_fit
# DATABASE_SSLMODE=require
```

🔒 Never commit passwords or complete connection strings to source control.

The application should fail safely when the environment label and database target do not match.

---

## Page 3: 🪶 2. SQLite: the local workshop

SQLite is a portable file-based database. It is excellent for local development, imports, experiments, and isolated tests.

### 🚀 Start a local database

```bash
sqlite3 GemLife_dev.sqlite
```

### ⚙️ Recommended session setup

```sql
.headers on
.mode box
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_key_check;
PRAGMA integrity_check;
```

### 👀 What the setup changes

The first two commands improve how query results look:

| Session setting | Without it | With it |
|---|---|---|
| `.headers on` | Results may appear as `1\|Budget\|Active` with no field names | Column names identify each value |
| `.mode box` | Results may be difficult to scan in plain text | Rows and columns appear in a readable table |

For example, a query such as:

```sql
SELECT ExampleThingID, Name, Status
FROM ExampleThing;
```

could appear without the display settings like this:

```text
1|Budget|Active
2|Employment|Active
```

With `.headers on` and `.mode box`, the same results are easier to inspect:

```text
┌────────────────┬────────────┬────────┐
│ ExampleThingID │ Name       │ Status │
├────────────────┼────────────┼────────┤
│ 1              │ Budget     │ Active │
│ 2              │ Employment │ Active │
└────────────────┴────────────┴────────┘
```

The remaining commands affect database behavior and validation:

| Command | Without it | With it |
|---|---|---|
| `PRAGMA foreign_keys = ON` | Invalid relationships may be accepted | Broken references are rejected |
| `PRAGMA journal_mode = WAL` | Read/write behavior is more limited | SQLite handles concurrent reads and writes more effectively |
| `PRAGMA busy_timeout = 5000` | A busy database may fail immediately | SQLite waits up to five seconds |
| `PRAGMA foreign_key_check` | Existing relationship problems remain hidden | Broken relationships are reported |
| `PRAGMA integrity_check` | File problems may go unnoticed | SQLite checks database integrity |

In short: `.headers on` and `.mode box` make results easier to read; the `PRAGMA` commands make the session safer to use and easier to validate.

### 📌 SQLite rules

- 🗂️ Keep schemas, migrations, seeds, triggers, and queries separate.
  Example:

  ```text
  Schema_Transactions.sql
  Migrate_Transactions_AddReceiptID.sql
  Seed_Transactions.sql
  Trigger_Transactions_ReceiptID.sql
  Get_Transactions.sql
  ```
- 🧭 Treat the application's migration history as the authoritative record of structural change.
  Example:

  ```sql
  -- Standalone SQL example for a local SQLite database.
  -- GemsForgeAPI expresses its application schema change in a Fluent migration.
  ALTER TABLE Transactions ADD COLUMN ReceiptID TEXT;
  ```
- 💾 Back up before rebuilds or destructive migrations.
  Example:

  ```text
  GemLife_dev.sqlite
  GemLife_dev_backup_2026-10-27.sqlite
  ```
- 🔗 Enable foreign keys on every connection.
  Example:

  ```sql
  PRAGMA foreign_keys = ON;
  ```

  **Why:** A foreign key says, “this record must point to a real record in another table.” For example, a transaction may contain a `MerchantID`, but that merchant must first exist in the `Merchants` table. SQLite only checks that rule when foreign-key enforcement is turned on for the connection. Otherwise, it can save a transaction for a merchant that does not exist.

  ```sql
  -- Without foreign-key enforcement, this may be accepted:
  INSERT INTO Transactions (TransactionID, MerchantID)
  VALUES ('txn-001', 'merchant-does-not-exist');

  -- With foreign-key enforcement enabled, SQLite rejects the invalid reference.
  ```
- 🕒 Use ISO-8601 text for timestamps unless another standard is documented.
  Example:

  ```text
  2026-10-27T14:30:00Z
  ```
- 💰 Do not store formatted currency; use integer minor units or a documented decimal representation.
  Example:

  ```text
  AmountMinorUnits = 1999
  Currency = USD
  ```

  **Why:** A value such as `'$19.99'` is text for display. The currency symbol, commas, spacing, and decimal formatting make calculations, sorting, filtering, and currency conversion unreliable. It also becomes unclear whether `19.99` means USD, CAD, or another currency.

  ```text
  ❌ Stored for display:  "$1,299.50"
  ✅ Stored as data:     AmountMinorUnits = 129950
                         Currency = USD
  ```

  The application can format `129950` as `$1,299.50` when displaying it, while the database retains an unambiguous value for calculations.
- 🧪 Use disposable DEV databases for experiments.
  Example:

  ```text
  GemLife_experiment.sqlite
  ```

  **Why:** An experiment may change tables, import incorrect data, or delete records while you are learning. Use a separate copy that can be deleted and recreated. Keep the main DEV database available for normal development and known-good testing.

  ```text
  ✅ Normal development: GemLife_dev.sqlite
  🧪 Experiment:        GemLife_experiment.sqlite
  🗑️ Failed experiment: delete and recreate GemLife_experiment.sqlite
  ```

> ⚠️ SQLite’s file-locking model is not a substitute for PostgreSQL when many users or services need concurrent access.

---

## Page 4: 🐘 3. PostgreSQL: the shared application database

PostgreSQL is the remote target for authenticated application access, concurrent users, stronger typing, backups, and production workloads.

### 👥 Recommended roles

- 👑 `gemlife_owner` — owns database objects; not used by the running application
- 🛠️ `gemlife_migrator` — applies approved migrations
- 🔌 `gemlife_app` — least-privilege application access
- 🧑‍💻 Personal/admin role — human administration with strong authentication

### 🏗️ Basic setup pattern

```sql
CREATE ROLE gemlife_owner NOLOGIN;
CREATE ROLE gemlife_migrator LOGIN;
CREATE ROLE gemlife_app LOGIN;
CREATE DATABASE gemlife_prod OWNER gemlife_owner;
```

---

## Page 5: 🔄 4. SQLite and PostgreSQL compatibility

Design portable SQL first, then add engine-specific behavior deliberately.

### ✅ Prefer

- Explicit column lists in every `INSERT`
- Standard `CREATE TABLE`, `ALTER TABLE`, `SELECT`, `INSERT`, `UPDATE`, and `DELETE`
- Database constraints instead of relying only on application code
- Repository adapters for database-specific behavior
- Tests for foreign keys, uniqueness, nullability, dates, and transactions

### 🚫 Do not assume

- SQLite’s typing rules behave like PostgreSQL’s strict typing
- SQLite’s locking model behaves like PostgreSQL concurrency
- A local query is automatically safe for a remote service
- Display formatting is an appropriate storage format

---

## Page 6: 🧾 5. Data types: SQLite and PostgreSQL

SQLite uses storage classes and type affinity, while PostgreSQL enforces declared types more strictly. Choose a type according to the meaning of the data, not how the value appears on screen.

| Data meaning | 🪶 SQLite recommendation | 🐘 PostgreSQL recommendation | Use when | Avoid when |
|---|---|---|---|---|
| 🆔 Stable text identifier | `TEXT` | `TEXT` or `VARCHAR` | IDs may contain prefixes or move between systems | The value is only an internal numeric sequence |
| 🔢 Whole number | `INTEGER` | `INTEGER` or `BIGINT` | Counts, quantities, or sequence values | Fractions are meaningful |
| 🔢 Decimal measurement | `REAL` | `NUMERIC(precision, scale)` | Approximate measurements in SQLite; exact decimals in PostgreSQL | Financial values need exact SQLite arithmetic |
| 💰 Currency amount | Integer minor units, such as cents | `NUMERIC(12,2)` or integer minor units | Money must calculate accurately | Formatted strings such as `'$19.99'` |
| ✅ Boolean | `INTEGER` using `0` and `1` | `BOOLEAN` using `TRUE` and `FALSE` | Yes/no or enabled/disabled values | There are multiple states |
| 📝 Text | `TEXT` | `TEXT` or `VARCHAR(n)` | Names, labels, codes, statuses, and notes | Binary files or controlled values needing a reference table |
| 📅 Calendar date | ISO-8601 `TEXT`, such as `2026-10-27` | `DATE` | A date without a time or timezone | Exact event time matters |
| 🕒 Date and time | ISO-8601 `TEXT`, such as `2026-10-27T14:30:00Z` | `TIMESTAMPTZ` | Events ordered across time zones | A date-only field |
| ⏱️ Duration | Integer seconds or milliseconds | `INTERVAL` or integer duration | Elapsed time and retention periods | A specific calendar timestamp |
| 🏷️ Status | `TEXT` with `CHECK` or reference table | `TEXT` with `CHECK`, enum, or reference table | Stable values such as `Active` and `Archived` | Free-form notes or frequently changing values |
| 🧩 JSON/document data | `TEXT` containing valid JSON | `JSONB` | Flexible source payloads or API metadata | Core fields needing joins or frequent filtering |
| 🖼️ Binary/file data | `BLOB` | `BYTEA` | Small binary values stored in the database | Large images, videos, or documents |
| 🔗 URL or email | `TEXT` | `TEXT` or `CITEXT` where appropriate | Web addresses and contact values | Values that have not been validated |

### 🧭 Practical type rules

- 🆔 Use stable text IDs when records may move through SQLite, PostgreSQL, CSV, JSON, or a future application.
- 💰 Store money as exact numeric values or integer minor units; never use display formatting as the source of truth.
- 🕒 Store timestamps in UTC and convert them for display. Prefer `TIMESTAMPTZ` in PostgreSQL and documented ISO-8601 text in SQLite.
- ✅ Use PostgreSQL `BOOLEAN`; use SQLite `INTEGER` with a documented `0`/`1` rule.
- 🏷️ Use a reference table when a vocabulary needs descriptions, ordering, ownership, or lifecycle dates.
- 🧩 Keep JSON for flexible metadata, not fields the application regularly searches or joins.
- 🖼️ Prefer file storage plus a database reference for large assets.
- ⚠️ Do not assume `VARCHAR(255)` in SQLite enforces length the same way it does in PostgreSQL.

---

## 🧱 6. Minimum criteria for creating a table

Before creating a table, answer these questions:

1. 🎯 **Purpose** — What real-world thing, event, relationship, or reference value does one row represent?
2. 📏 **Grain** — What does exactly one row mean? Write this as one sentence.
3. 🆔 **Identifier** — What stable primary key identifies the row?
4. 🧾 **Required fields** — Which values must exist when the row is created?
5. 🔤 **Data types** — Is each field stored according to its meaning rather than its display format?
6. 🏷️ **Controlled values** — Should a field use a reference table or allowed-value list?
7. 🔗 **Relationships** — Which other tables does this table connect to?
8. 🚫 **Uniqueness** — Which facts must never be duplicated?
9. 🕒 **Dates and provenance** — Do we need created, updated, effective, source, or legacy dates?
10. 🛡️ **Validation** — Which invalid states can the database prevent?
11. ⚡ **Indexes** — Which searches, joins, sorts, or uniqueness rules require indexes?
12. ♻️ **Migration and recovery** — Can the change be applied, verified, and recovered safely?
13. 🔒 **Privacy** — Does the table contain sensitive data requiring access restrictions?

### 📝 Minimum table template

```sql
CREATE TABLE IF NOT EXISTS ExampleThing (
    ExampleThingID TEXT PRIMARY KEY,
    Name           TEXT NOT NULL,
    Status         TEXT NOT NULL DEFAULT 'Active',
    CreatedAt      TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt      TEXT,
    SourceSystem   TEXT,
    LegacyID       TEXT,
    Notes          TEXT,
    CHECK (length(trim(Name)) > 0),
    CHECK (Status IN ('Active', 'Inactive'))
);

CREATE UNIQUE INDEX IF NOT EXISTS UX_ExampleThing_Legacy
    ON ExampleThing (SourceSystem, LegacyID)
    WHERE LegacyID IS NOT NULL;
```

💡 Use a reference table instead of an inline `CHECK` when values need descriptions, ordering, ownership, lifecycle dates, or frequent maintenance.

---

## 🧰 7. Useful SQL-editor patterns

Use these patterns whenever you inspect a schema, investigate data quality, preview a change, validate a relationship, or verify a migration. They are the standard inspection and safety patterns for database work in DEV, FIT, and—when carefully scoped—PROD.

### 🔍 Inspect the schema

Use this when you need to understand what tables, indexes, triggers, and relationships already exist before changing anything.

```sql
SELECT name, type
FROM sqlite_master
WHERE type IN ('table', 'index', 'trigger', 'view')
ORDER BY type, name;

PRAGMA table_info(Transactions);
PRAGMA foreign_key_list(Transactions);
```

🧭 **Example:** Before adding a `ReceiptID` column, inspect the existing `Transactions` table and its foreign keys so the new relationship follows the current design.

### 🕵️ Find duplicates before adding a constraint

Use this before adding a `UNIQUE` constraint or unique index. It identifies records that would cause the migration to fail or expose existing data-quality problems.

```sql
SELECT NaturalKey, COUNT(*) AS DuplicateCount
FROM ExampleThing
GROUP BY NaturalKey
HAVING COUNT(*) > 1;
```

🧭 **Example:** Before requiring each service to have a unique `ServiceCode`, identify duplicate codes and resolve them first.

### 🔗 Find broken relationships

Use this to find child records that point to a parent record that does not exist.

```sql
SELECT child.ExampleThingID
FROM ExampleThing AS child
LEFT JOIN ParentThing AS parent
  ON parent.ParentThingID = child.ParentThingID
WHERE child.ParentThingID IS NOT NULL
  AND parent.ParentThingID IS NULL;
```

🧭 **Example:** Find transactions whose `MerchantID` no longer matches a row in `Merchants` before enabling or validating a foreign key.

### 👀 Preview before changing data

Use this before every non-trivial `UPDATE`, `DELETE`, or backfill. First select the exact rows that the change will affect.

```sql
BEGIN;

UPDATE ExampleThing
SET Status = 'Inactive'
WHERE ExampleThingID = '...';

SELECT changes();
ROLLBACK;
```

🧭 **Example:** Before changing inactive services to an archived status, inspect the affected rows and keep `ROLLBACK` until the result is confirmed.

✅ Replace `ROLLBACK` with `COMMIT` only after inspecting the result.

### 🔁 Transactional migration pattern

Use this when a schema change and its data backfill must succeed together.

```sql
BEGIN;
-- 1. Structural change
-- 2. Data backfill
-- 3. Verification queries
COMMIT;
```

🧭 **Example:** Add a nullable `LogoKey` column, populate it from existing service data, verify that every populated key is valid, and commit only after the checks pass.

If verification fails, use `ROLLBACK`. A migration is not finished until its post-migration checks pass.

### 🩺 Health checks

Use these after imports, migrations, rebuilds, restores, and before promoting a database to the next environment.

```sql
PRAGMA integrity_check;
PRAGMA foreign_key_check;
SELECT COUNT(*) FROM ExampleThing;
```

🧭 **Example:** After restoring a DEV database, confirm that the file is structurally sound, foreign keys are valid, and the expected number of records exists before testing.

For PostgreSQL, use `EXPLAIN` and `EXPLAIN ANALYZE` carefully, especially against PROD data.

---

## 📨 8. Database change requests and file changes

### 🗂️ File and naming conventions

```text
Schema_<Subject>.sql         🧱 Table and constraint definition
Migrate_<Change>.sql         🔄 Versioned structural or data change
Seed_<Subject>.sql           🌱 Reference data or test fixtures
Get_<Subject>.sql            🔎 Reusable read/query patterns
Trigger_<Subject>_<Rule>.sql 🛡️ Database-enforced behavior
```

For GemsForgeAPI, Fluent migrations in the application are authoritative; standalone SQL files here are examples, fixtures, or one-off data work unless explicitly adopted by the application. Every migration should document its purpose, affected tables, assumptions, execution order, verification queries, and recovery approach. Seeds must identify whether they contain reference data, test fixtures, or personal data. Application queries should name their columns explicitly; avoid `SELECT *` as an application contract.

### 📨 Example database-change request

```text
## 🧱 Database Change Request: Add Service Logos

### 🎯 Purpose

Add a reusable logo reference to services without storing duplicate image data in the Services table.

### 🧩 Affected areas

- Services
- ServiceLogos
- Import and seed scripts
- API response model
- Console service display

### 📏 Row meaning

Each ServiceLogos row represents one reusable logo asset. Each Services row may reference one logo.

### 🆔 Identifier

Use LogoKey as the stable application identifier. Preserve existing service IDs.

### 🛠️ Proposed changes

- Add LogoKey to Services.
- Create or update the ServiceLogos table.
- Add a foreign-key relationship.
- Add a uniqueness rule for LogoKey.
- Backfill existing service records where a matching logo exists.
- Keep unmatched services valid with a nullable logo reference.

### 🧪 Validation plan

- Confirm existing services are preserved.
- Check for duplicate logo keys.
- Check for invalid foreign-key references.
- Confirm imports do not create duplicate logos.
- Run SQLite migration tests.
- Run PostgreSQL FIT migration tests.
- Verify the API response remains backward-compatible.

### ♻️ Recovery plan

Back up the database, record the schema version, and export affected service records before migration. If validation fails, roll back where possible or restore the backup, correct the migration, and rerun it in DEV and FIT.

### ✅ Acceptance criteria

- Existing service identifiers remain unchanged.
- No duplicate logo keys exist.
- No orphaned logo references exist.
- Migration runs successfully in DEV and FIT.
- API and Console behavior remain functional.
- Recovery instructions are documented.
```

### 📁 What the file changes could look like

The request above could produce a change set like this:

```text
Schema_ServiceLogos.sql
    🧱 Create the reusable ServiceLogos table.

Migrate_Services_Add_LogoKey_FK.sql
    🔄 Add the nullable LogoKey column, foreign key, index, and backfill logic.

Seed_ServiceLogos.sql
    🌱 Add approved reference logo records or FIT fixtures.

Seed_Service_Toastmasters.sql
    🌱 Update service fixture data when a logo relationship is part of the fixture.

Get_ServiceLogos.sql
    🔎 Add reusable logo lookup and validation queries.

Get_Services.sql
    🔎 Include the logo relationship in service reads where required.

Schema_ServiceLogoAssets.sql
    🖼️ Define the asset metadata table if the design separates logos from stored files.

API/ServiceModel.swift
    🔌 Add the API representation of LogoKey and the related logo data.

Console service component
    🖥️ Display the logo when available and preserve the existing fallback when absent.

Migration test or execution fixture
    🧪 Verify the migration, foreign keys, duplicate prevention, and backward compatibility.

Database-change notes
    📝 Record the schema version, affected tables, verification results, and recovery steps.
```

The exact files depend on the repository’s existing structure. The important practice is to identify the database, migration, seed, query, application, test, and documentation changes before implementation begins.

---

## ☁️ 9. MVP for a remote database

The remote-database MVP is complete when this path works end to end:

1. ☁️ Provision one managed PostgreSQL database.
2. 🔒 Require TLS, network restrictions, and strong credentials.
3. 👥 Create owner, migrator, and least-privilege application roles.
4. 🌎 Create explicit DEV, FIT, and PROD configuration values.
5. 🧱 Apply the existing schema through migrations.
6. 🧪 Load only sanitized fixtures into FIT.
7. ❤️ Add a health check for connectivity and schema version.
8. 💾 Configure automated backups and retention.
9. ♻️ Perform one restore test into a separate database.
10. 🚪 Restrict PROD writes to the API and approved migration process.
11. 📋 Record engine version, schema version, backup status, and last restore-test date.

### 🚫 Not required for the MVP

Replicas, sharding, a data warehouse, a complex deployment platform, and multiple production regions can wait.

### ✅ Required for the MVP

Recoverability, environment separation, least privilege, repeatable migrations, a tested connection, and a tested restore path.

---

## 🚦 10. Proposed database-change release checklist

This is **not a universal or officially accepted developer checklist**. There is no single checklist used by every database team. It is the recommended minimum gate for this project, based on common database-engineering practices and this architecture’s priorities: schema clarity, migration safety, validation, portability, and recovery.

Use the full checklist for changes that affect shared or production data. For a harmless local experiment, a shorter review may be appropriate.

| Check | Why it matters |
|---|---|
| [ ] 📏 Row grain is documented | Prevents one table from mixing unrelated meanings or duplicate records |
| [ ] 🆔 Identifier is stable and migration-safe | Keeps records traceable when moving between SQLite, PostgreSQL, and future systems |
| [ ] 🧾 Required fields are explicit | Prevents incomplete records from entering the database |
| [ ] 🏷️ Controlled values are defined | Keeps statuses, categories, and classifications consistent |
| [ ] 🔗 Foreign keys are tested | Prevents orphaned or invalid relationships |
| [ ] 🚫 Uniqueness rules are tested | Prevents accidental duplicates |
| [ ] 🧹 Existing data has a migration path | Protects historical data during structural change |
| [ ] 🔄 Migration is versioned and repeatable | Makes DEV, FIT, and PROD consistent and recoverable |
| [ ] 💾 Production recovery point exists | Provides a safe point before applying a risky change |
| [ ] 🧪 DEV and FIT checks pass | Finds structural and integration problems before PROD |
| [ ] 🔌 Application contracts are updated when response shapes change | Prevents database changes from silently breaking the API or UI |
| [ ] ♻️ Recovery or rollback is documented | Defines what to do when deployment or validation fails |

> 🧭 This checklist is a project standard, not a certification requirement. It should evolve as the database, application, hosting provider, and risk level change.

---

## 🔗 11. Technical references

Use these official references when checking engine behavior, SQL syntax,
constraints, migrations, backups, and schema diagrams. This handbook explains
the project practice; the vendor documentation defines version-specific behavior.

- [SQLite documentation](https://www.sqlite.org/docs.html) — SQL language, pragmas, transactions, foreign keys, and file-based database behavior.
- [SQLite foreign key support](https://www.sqlite.org/foreignkeys.html) — enabling and testing referential integrity.
- [SQLite transaction documentation](https://www.sqlite.org/lang_transaction.html) — transaction behavior and locking.
- [PostgreSQL documentation](https://www.postgresql.org/docs/current/) — current server, SQL, type, constraint, transaction, and administration references.
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html) — primary keys, foreign keys, unique rules, checks, and exclusion constraints.
- [PostgreSQL backup and restore](https://www.postgresql.org/docs/current/backup.html) — backup strategies and recovery procedures.
- [MySQL reference manual](https://dev.mysql.com/doc/refman/en/) — engine-specific SQL, constraints, transactions, and administration behavior.
- [Fluent migrations](https://docs.vapor.codes/fluent/migration/) — the application migration reference for GemsForgeAPI’s Vapor/Fluent stack.
- [DBML documentation](https://dbml.dbdiagram.io/docs/) — a text format for maintaining database diagrams and relationships.

### 🗺️ ERD reference

An ERD is the visual companion to the migration history. Use it to review row
meaning, primary keys, foreign keys, cardinality, ownership, and dependency order
before changing a table. The ERD does not replace migrations; it makes the model
easier to understand and review.

## 📝 Appendix: Where documentation belongs

A database change produces executable code, design decisions, and operational records. Keep each where it can be maintained and found again. This appendix is a filing guide for this Apple-centered project.

### 🧱 Project files

Schema files, application migrations, seeds, triggers, reusable SQL queries, and automated checks. For GemsForgeAPI, the Fluent migrations in the repository are the source of truth for the application schema.

### 🍎 Apple Notes

Field dictionaries, architecture decisions, maintenance procedures, environment explanations, troubleshooting patterns, and database operating rules.

### 📊 Apple Numbers

Environment inventory, schema versions, controlled vocabularies, migration status, backup history, restore history, and reference-table maintenance.

> 🌱 Update this book whenever a database convention, identifier rule, environment rule, migration pattern, or remote-hosting requirement becomes stable.

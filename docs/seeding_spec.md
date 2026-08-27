# Database Seeding Specification

This document outlines the industry-standard database seeding specification for the FIFO and Aveling LMS application. It details the precise order of seeding, idempotency mechanisms, and the "Safe Sync" strategy.

## 1. Overview
The seeding process ensures the initial population of necessary lookup data (catalogs, categories, courses, psychometric questions) across the database without disrupting user-generated data. 
The seeder is implemented in `server/src/seedDatabase.ts` and uses hardcoded JSON/TS structures located in `server/src/data/`.

## 2. Safe Sync Seeding Strategy
To prevent foreign key constraint errors and preserve critical user data, the seeding strategy relies on idempotency and partial updates:
- **Never `force: true` universally:** Universal dropping of tables in production leads to catastrophic data loss.
- **Upsert mechanisms:** We utilize Sequelize's `findOrCreate` or `upsert` patterns to insert static data.
- **Controlled table sync:** If a specific lookup table structure is irreparably corrupted, it must be cleared individually by disabling foreign key checks, dropping, and recreating *only* that specific table, before re-enabling foreign key checks.

## 3. Execution Order Dependency Graph
To satisfy relational integrity and foreign key constraints, seeding must strictly follow this execution order:

### Phase 1: Foundational Lookups (No Dependencies)
1. **Job Categories (`JobCategory`)**: Insert core FIFO industry categories (e.g., Mining, Culinary, Health & Safety).
2. **Ticket Catalog (`TicketCatalog`)**: Populate the master list of all valid tickets and certifications recognized by the platform.
3. **Certification Types (`CertificationType`)**: Define LMS certification types (e.g., standard, advanced, specialized).
4. **Bank Accounts (`BankAccount`)**: Create baseline Blue Collar recruitment admin accounts for invoice processing.

### Phase 2: Core Platform Data (Depends on Phase 1)
5. **Job Listings (`JobListing`)**: Insert template jobs from `server/src/data/fifoJobs.ts`. 
    - *Dependency:* `JobCategory`
6. **Job Ticket Requirements (`job_ticket_requirements`)**: Link `JobListing` templates to multiple `TicketCatalog` items indicating mandatory certifications.
    - *Dependency:* `JobListing`, `TicketCatalog`

### Phase 3: LMS Structural Data (Depends on Phase 1)
7. **Courses (`Course`)**: Insert all Aveling LMS courses from `server/src/data/lmsData.ts`.
    - *Dependency:* `CertificationType`
8. **Course Modules (`CourseModule`)**: Load the modules for each course.
    - *Dependency:* `Course`
9. **Exam Configurations (`ExamConfig`)**: Setup passing marks and time limits for courses.
    - *Dependency:* `Course`
10. **Exam Questions (`ExamQuestion`)**: Populate the question banks.
    - *Dependency:* `Course`

### Phase 4: Assessment & Admin Data
11. **Admin Users (`User`)**: Verify existence or create the master system administrator (`nnamdisolomon1@gmail.com`).
12. **Psychometric Configuration**: The psychometric questions (Module 1 & 2) reside in memory (`server/src/data/psychometricModule1Questions.ts`), requiring no direct DB seeding for the questions themselves, but we may reset generic psychometric constraints if applicable.

## 4. Execution Commands
**Local Environment:**
\`\`\`bash
npm run seed
\`\`\`
*(This executes `npx ts-node src/seedDatabase.ts`)*

**Production Environment:**
In production, the seeder can be triggered selectively via an authorized admin API endpoint to prevent SSH terminal dependency:
\`\`\`bash
POST /api/admin/seed
Authorization: Bearer <Admin_JWT>
\`\`\`

## 5. Idempotency & Rollback
- Each seeding function (e.g., `seedJobCategories()`, `seedTicketCatalogs()`) is wrapped in a try/catch block. 
- If a seed block fails, the failure is logged (`[Seeder] Error in JobCategory: ...`), but it does not crash the entire seeding process, allowing remaining independent entities to seed.
- Using `findOrCreate` on composite unique constraints ensures running the seeder 100 times results in the exact same database state as running it once.

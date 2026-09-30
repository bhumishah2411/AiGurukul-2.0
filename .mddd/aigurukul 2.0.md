aigurukul 2.0



**MASTER PROMPT :** 

You are the lead software architect and senior full-stack engineer responsible for rebuilding AI Gurukul from scratch as a production-quality software product.



IMPORTANT:

This is a NEW production rebuild.



Do NOT modify or patch the existing AI Gurukul implementation.

Do NOT reuse the existing backend architecture.

Do NOT create a temporary prototype that will later need a major rewrite.



Build the system with production-quality architecture from the beginning, while using free/local infrastructure wherever possible during development.



==================================================

PRODUCT

==================================================



Product name:

AI Gurukul – Ancient Wisdom for Modern Life



Purpose:



AI Gurukul is an AI-powered guidance and learning platform that helps users explore Indian wisdom and apply it to modern-life situations.



Core knowledge domains include:



\- Bhagavad Gita / Krishna

\- Chanakya wisdom

\- Ramayana

\- Mahabharata

\- Panchatantra

\- Ayurveda

\- Sanskrit / Tamil / Pali knowledge

\- Classical Indian texts



The platform should provide:



1\. AI wisdom guidance

2\. Persona-based responses

3\. RAG-grounded answers

4\. Source citations

5\. Ayurveda consultation

6\. Knowledge graph exploration

7\. Dynamic quizzes

8\. Gamification

9\. Progress tracking

10\. Multilingual support

11\. Manuscript/document translation

12\. Document ingestion

13\. User authentication

14\. User history and personalization



==================================================

NON-NEGOTIABLE ARCHITECTURE

==================================================



Use a monorepo.



The main applications MUST be:



apps/

&#x20; web/

&#x20; api/

&#x20; worker/



web:

\- Next.js

\- React

\- TypeScript



api:

\- Node.js

\- Express.js

\- TypeScript



worker:

\- Node.js

\- TypeScript

\- BullMQ

\- Redis



IMPORTANT:



The BullMQ worker MUST be separate from the API process.



The API must NOT execute long-running background jobs directly.



==================================================

DATABASE

==================================================



USE:



MongoDB + Mongoose



DO NOT USE:



\- PostgreSQL

\- Prisma

\- SQL database



MongoDB is the primary application database.



Mongoose is the ODM.



Design proper Mongoose schemas, indexes, validation and repository abstractions.



Potential collections include:



\- users

\- sessions

\- wisdom content

\- conversations

\- messages

\- ayurveda data

\- quizzes

\- quiz attempts

\- game progress

\- achievements

\- documents

\- ingestion jobs

\- translation history

\- source metadata



Do not create every collection blindly.



Only create collections when required by the corresponding feature.



==================================================

VECTOR DATABASE

==================================================



Use Pinecone as the vector database abstraction.



However, DO NOT tightly couple application code to Pinecone.



Create a vector database provider interface.



Example concept:



VectorStoreProvider



Possible implementations:



\- LocalVectorStoreProvider

\- PineconeVectorStoreProvider



The application should depend on the interface rather than directly on Pinecone.



==================================================

AI PROVIDER ABSTRACTION

==================================================



Do NOT tightly couple the application to a single LLM provider.



Create:



AIProvider



Possible implementations:



\- LocalAIProvider

\- AnthropicAIProvider

\- OpenAIProvider



The initial development environment should support free/local options wherever practical.



The architecture must allow changing the provider without rewriting business logic.



==================================================

EMBEDDING PROVIDER

==================================================



Create:



EmbeddingProvider



Possible implementations:



\- LocalEmbeddingProvider

\- CohereEmbeddingProvider

\- OpenAIEmbeddingProvider



Do not place provider-specific embedding logic inside controllers or services.



==================================================

OBJECT STORAGE

==================================================



Uploaded documents must NOT be processed directly from arbitrary API memory/storage.



Introduce an object-storage abstraction.



Create:



ObjectStorageProvider



Possible implementations:



\- LocalObjectStorageProvider

\- S3CompatibleObjectStorageProvider



Uploaded files should follow this general lifecycle:



Upload

&#x20; ↓

Object Storage

&#x20; ↓

Document record in MongoDB

&#x20; ↓

BullMQ ingestion job

&#x20; ↓

Worker

&#x20; ↓

Text extraction

&#x20; ↓

Chunking

&#x20; ↓

Embedding

&#x20; ↓

Vector database

&#x20; ↓

Source metadata / citations



==================================================

SHARED PACKAGES

==================================================



Create shared packages for:



packages/

&#x20; types/

&#x20; validation/

&#x20; config/

&#x20; database/

&#x20; ai/

&#x20; embeddings/

&#x20; vector-store/

&#x20; storage/

&#x20; logging/



Use these packages wherever appropriate.



The exact package structure can be adjusted if there is a strong architectural reason.



Avoid duplicate schemas and types across web/api/worker.



==================================================

VALIDATION

==================================================



Use Zod for request and data validation.



Validation should happen at system boundaries.



Do not trust client-side validation alone.



Shared Zod schemas should live in the shared validation package where appropriate.



==================================================

API ARCHITECTURE

==================================================



Use:



Controller

&#x20;   ↓

Service

&#x20;   ↓

Repository

&#x20;   ↓

Database



Controllers should remain thin.



Business logic belongs in services.



Database access belongs in repositories.



Do not put MongoDB queries directly inside controllers.



==================================================

AUTHENTICATION

==================================================



Support:



\- Email/password authentication

\- Google OAuth

\- Secure password hashing using bcrypt

\- JWT/session-based authentication according to the finalized architecture



Prefer secure httpOnly cookies for browser authentication.



Use:



\- Secure cookies in production

\- SameSite protection

\- Proper CORS configuration

\- Rate limiting

\- Authentication middleware

\- Authorization checks



Never store plaintext passwords.



Never commit secrets.



==================================================

REDIS + BULLMQ

==================================================



Redis is used for:



\- caching

\- queues

\- background jobs

\- rate limiting where appropriate



BullMQ worker handles long-running operations such as:



\- document ingestion

\- text extraction

\- chunking

\- embedding generation

\- vector indexing

\- potentially AI-heavy asynchronous tasks



API should enqueue jobs and return appropriate job status information.



==================================================

RAG

==================================================



RAG must be source-grounded.



The system must track:



\- source document

\- source title

\- source type

\- source location/page/chunk where available

\- chunk ID

\- retrieval metadata

\- relevance information where appropriate



AI responses should be able to return citations/source references.



Never make RAG a black box.



The architecture must preserve traceability from:



Answer

→ Retrieved chunk

→ Source

→ Original document



==================================================

OBSERVABILITY

==================================================



Implement from Phase 1:



\- structured logging

\- request IDs

\- correlation IDs where appropriate

\- health endpoint

\- readiness endpoint

\- graceful shutdown

\- centralized error handling



Every API request should have a traceable request ID.



Logs should be structured rather than random console.log statements.



==================================================

TESTING

==================================================



Testing starts in Phase 1.



Required testing layers:



1\. Unit tests

2\. Integration tests

3\. End-to-end tests



Do not postpone testing until the end of the project.



Each phase must add tests for the functionality introduced in that phase.



==================================================

DATABASE MIGRATIONS + SEEDING

==================================================



MongoDB does not use SQL migrations in the same way as PostgreSQL.



Therefore implement a MongoDB-compatible migration/versioning mechanism.



Requirements:



\- versioned database migration scripts

\- deterministic migration execution

\- migration status tracking

\- seed scripts

\- development seed data

\- safe production behavior



Do NOT introduce Prisma or SQL migration tooling.



==================================================

SECURITY

==================================================



Implement production security practices throughout the project:



\- Zod validation

\- secure authentication

\- password hashing

\- rate limiting

\- CORS

\- Helmet/security headers

\- input sanitization where appropriate

\- file upload validation

\- file size limits

\- MIME type validation

\- safe error responses

\- secrets through environment variables

\- no secrets in Git

\- dependency auditing

\- authorization checks



==================================================

FRONTEND DESIGN

==================================================



Visual identity:



Obsidian Temple + Vedic Sacred Gold.



Primary colors:



Background:

\#0D0B08



Surface:

\#211D12



Secondary surface:

\#2A2515



Text:

\#EDE8D5



Muted text:

\#9A9078



Gold:

\#D4AF37



Gold light:

\#F2D675



Gold dim:

\#8B6914



Persona accents:



Krishna:

\#7B68EE



Chanakya:

\#C46B3A



Guru/Vaidya:

\#3A9B8C



The UI should feel:



\- premium

\- ancient

\- intelligent

\- calm

\- modern

\- immersive

\- readable

\- professional



Avoid excessive gradients, unnecessary animations and generic AI-dashboard styling.



==================================================

CORE FEATURES

==================================================



The final application should contain:



PHASE 1

Foundation + architecture + observability + testing



PHASE 2

Authentication



PHASE 3

Wisdom guidance + AI streaming



PHASE 4A

Ayurveda



PHASE 4B

Knowledge graph



PHASE 5A

RAG infrastructure



PHASE 5B

Dynamic quizzes



PHASE 6

Gamification



PHASE 7

Languages + manuscript translation



PHASE 8

Production hardening + deployment



==================================================

DEVELOPMENT PRINCIPLE

==================================================



DO NOT BUILD EVERYTHING AT ONCE.



Work strictly phase-by-phase.



Before implementing a phase:



1\. Understand existing architecture.

2\. Inspect repository structure.

3\. Identify dependencies.

4\. Plan the phase.

5\. Implement only that phase.



After implementation:



1\. Run formatting.

2\. Run linting.

3\. Run type checking.

4\. Run unit tests.

5\. Run integration tests where applicable.

6\. Run E2E tests where applicable.

7\. Build all affected applications.

8\. Fix all errors.

9\. Verify environment configuration.

10\. Verify security-sensitive code.



Then provide a completion report.



STOP.



WAIT FOR USER APPROVAL.



Do NOT automatically continue to the next phase.



==================================================

IMPORTANT

==================================================



Never:



\- use PostgreSQL

\- use Prisma

\- create SQL migrations

\- combine API and worker into one process

\- put business logic in controllers

\- put database queries directly in controllers

\- hard-code API keys

\- commit .env files

\- tightly couple business logic to one AI provider

\- tightly couple business logic to Pinecone

\- process uploaded documents without object-storage abstraction

\- skip tests

\- skip logging

\- skip health/readiness checks

\- build all phases in one step



MongoDB + Mongoose is the ONLY primary database choice.



Start with Phase 0 only.



Do not implement Phase 1 until Phase 0 is reviewed and approved.



**PHASE 0 :** ARCHITECTURE PLANNING



Do NOT write production application code yet.



Your task is to inspect the current project/environment and produce the finalized implementation architecture for AI Gurukul.



The architecture MUST use:



\- MongoDB

\- Mongoose

\- Next.js

\- React

\- TypeScript

\- Node.js

\- Express.js

\- Redis

\- BullMQ

\- separate worker

\- Pinecone behind an interface

\- AI provider interface

\- embedding provider interface

\- object storage interface



Do NOT use PostgreSQL or Prisma.



==================================================

TASKS

==================================================



1\. Define the complete monorepo structure.



Expected high-level structure:



/

├── apps/

│   ├── web/

│   ├── api/

│   └── worker/

│

├── packages/

│   ├── types/

│   ├── validation/

│   ├── config/

│   ├── database/

│   ├── ai/

│   ├── embeddings/

│   ├── vector-store/

│   ├── storage/

│   └── logging/

│

├── tests/

├── docker-compose.yml

├── package.json

├── turbo.json

└── README.md



You may improve this structure if there is a strong reason.



2\. Define responsibilities of:



web

api

worker

types

validation

config

database

ai

embeddings

vector-store

storage

logging



3\. Define API architecture:



Routes

→ Controllers

→ Services

→ Repositories

→ Mongoose



4\. Define MongoDB collections.



For each collection explain:



\- purpose

\- important fields

\- indexes

\- relationships/references

\- whether it is required now or later



5\. Define the MongoDB migration/versioning strategy.



6\. Define seed-data strategy.



7\. Define authentication architecture.



8\. Define Redis architecture.



9\. Define BullMQ queues and workers.



10\. Define provider interfaces:



AIProvider

EmbeddingProvider

VectorStoreProvider

ObjectStorageProvider



11\. Define RAG data flow.



12\. Define citation/source tracking model.



13\. Define observability:



\- structured logs

\- request ID

\- health

\- readiness

\- error handling



14\. Define testing strategy:



\- unit

\- integration

\- E2E



15\. Define local-development infrastructure.



Prefer free/local infrastructure.



16\. Define production infrastructure separately.



17\. Define environment variables.



Separate:



development

test

production



18\. Define security architecture.



==================================================

IMPORTANT

==================================================



Do not implement the application yet.



Produce:



1\. Architecture diagram

2\. Folder structure

3\. Technology decisions

4\. MongoDB schema plan

5\. Provider interfaces

6\. API architecture

7\. Worker architecture

8\. RAG architecture

9\. Testing architecture

10\. Observability architecture

11\. Security architecture

12\. Phase-by-phase implementation plan



Then STOP.



Wait for approval.



ANS : RETURNED THE ARCHITECTURE FLOW



**PHASE 1 : FOUNDATION**



Implement ONLY Phase 1.



Do not implement authentication, wisdom, Ayurveda, RAG, quizzes, games, translation or other future features yet.



==================================================

GOAL

==================================================



Create the production-ready foundation of the AI Gurukul monorepo.



==================================================

MONOREPO

==================================================



Create:



apps/

&#x20; web/

&#x20; api/

&#x20; worker/



packages/

&#x20; types/

&#x20; validation/

&#x20; config/

&#x20; database/

&#x20; ai/

&#x20; embeddings/

&#x20; vector-store/

&#x20; storage/

&#x20; logging/



Configure:



\- package manager

\- workspace

\- Turborepo

\- TypeScript

\- ESLint

\- Prettier

\- shared configs



==================================================

DATABASE

==================================================



Set up:



MongoDB + Mongoose



Create the database package.



Implement:



\- MongoDB connection

\- connection configuration

\- connection lifecycle

\- graceful disconnect

\- environment validation



Do NOT use PostgreSQL.

Do NOT use Prisma.



==================================================

MIGRATIONS

==================================================



Implement MongoDB migration/versioning infrastructure.



Implement:



\- migration runner

\- migration version tracking

\- migration status

\- development seed runner



Do not create feature-specific collections unless required by the foundation.



==================================================

CONFIG

==================================================



Create centralized configuration using environment variables.



Validate environment variables using Zod.



Separate:



.env.example

development

test

production



Never expose secrets to the frontend.



==================================================

API

==================================================



Create Express API foundation.



Implement:



\- application bootstrap

\- routing

\- middleware

\- centralized errors

\- 404 handling

\- CORS

\- Helmet

\- request IDs

\- structured logging

\- graceful shutdown



==================================================

HEALTH

==================================================



Create:



GET /health



GET /ready



Health should confirm the process is running.



Readiness should verify required dependencies such as MongoDB and Redis.



==================================================

WORKER

==================================================



Create a separate worker application.



Connect worker to Redis/BullMQ.



The worker MUST run independently from the API.



Create the basic queue infrastructure but do not implement RAG jobs yet.



==================================================

REDIS

==================================================



Create Redis configuration and shared connection utilities.



Prepare BullMQ infrastructure.



==================================================

PROVIDER INTERFACES

==================================================



Create interfaces only for now:



AIProvider

EmbeddingProvider

VectorStoreProvider

ObjectStorageProvider



Add placeholder/local implementations where useful.



Do not integrate paid providers yet.



==================================================

STORAGE

==================================================



Create object storage abstraction.



Implement a local development storage provider.



Do not directly upload/process documents in the API.



==================================================

TESTING

==================================================



Set up:



\- unit testing

\- integration testing

\- E2E testing



Create initial tests for:



\- configuration validation

\- MongoDB connection

\- API health

\- API readiness

\- request IDs

\- error handling

\- worker startup



==================================================

QUALITY GATES

==================================================



Run:



\- formatting

\- lint

\- typecheck

\- unit tests

\- integration tests

\- E2E tests

\- production builds



Fix all errors.



Then provide:



1\. Files created

2\. Architecture implemented

3\. MongoDB setup

4\. Redis setup

5\. Worker setup

6\. Testing setup

7\. Commands to run locally

8\. Test results

9\. Build results

10\. Known limitations



STOP.



Wait for approval before Phase 2.


---
name: Strict Enums
description: Prefer PostgreSQL Enums over magic strings in Prisma schema and codebase.
---

# Database Schema & Types

Always prefer using strict `enum` types over "magic strings" for categorical or constrained fields.

- In `schema.prisma`, use `enum` (e.g. `enum TicketStatus { Open Closed }`) instead of `String` with comments.
- In backend routing and frontend UI code, strictly rely on the generated Enum types instead of raw string literals whenever handling constrained data types.
- Ensure that Enum values map correctly between the frontend selectors and the database backend (e.g. converting space characters to underscores as required by Prisma/PostgreSQL).

---
description: Always use Zod for data validation
---

# Zod & React-Hook-Form Rule

- **Always use `react-hook-form` paired with `zod` for all form handling and data validation.** This applies strictly to any forms (like adding a new user, updating profiles, etc.).
- Use `@hookform/resolvers/zod` to seamlessly integrate the validation schema with the hook.
- Enforce strict typing with `z.infer<typeof schema>`.
- Provide meaningful error messages for constraints (e.g. `.min(3, { message: "Must be at least 3 characters" })`).

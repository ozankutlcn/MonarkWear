## UI/UX-only workflow (optional addition)

For requests explicitly about interface design or UX, use `/ui-pilot` to plan, prototype and implement, and `/ui-review` to audit rendered output. The full workflow lives in `.claude/skills/` and specialized agent definitions in `.claude/agents/`.

Do not treat UI/UX authorization as permission to modify API, backend, data models, authentication, infrastructure, security settings, or business logic. Before editing, identify the actual allowed UI paths; inspect the final diff. Prefer project-specific visual identity over a shared color palette or component layout. Never invent portfolio facts.

For unrelated development tasks, follow the existing project instructions; these UI-specific rules do not redefine backend standards.

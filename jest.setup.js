// Diagnostics are dev-only by design (see src/backend/redact.ts). Tests run
// with them off so a failure report shows the failure, not the request log.
global.__DEV__ = false

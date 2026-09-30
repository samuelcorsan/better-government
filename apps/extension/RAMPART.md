# Spike notes: Rampart in MV3

Findings from integrating `@nationaldesignstudio/rampart` into the extension report page:

- `createGuard({ heuristicsOnly: true })` loads with no ONNX model, no WASM CSP exception, and no network. Suitable for the packaged `report.html` entry.
- Rampart heuristics alone do **not** cover Spanish NIE/DNI/CIF/IBAN; those live in `@reforma-digital/capture` (checksum-aware redactor). Defense in depth: capture → Rampart → human review → intake re-sanitize.
- Full NER (≈15 MB q4 ONNX + `@huggingface/transformers`) needs `wasm-unsafe-eval`, local model files under `dist/models/`, and `allowRemoteModels = false`. Deferred: enable later behind a build flag without changing the report UX.
- Cross-origin `fetch` from `report.html` requires `optional_host_permissions` for `BG_INTAKE_ORIGIN`, requested at submit time (no token in the package).

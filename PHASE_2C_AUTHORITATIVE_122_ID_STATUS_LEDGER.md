# Phase 2C Authoritative 122-ID Status Ledger

## 1. Authority

This file is the single authoritative current-status ledger for the 122 frozen Phase 2C Batch 2 atomic requirements. It records already approved Human decisions; it does not reclassify requirements or create implementation authority.

The normative identity and wording of the 122 requirements remain controlled by `PHASE_2C_BATCH_2_ATOMIC_IMPLEMENTATION_READINESS.md`. The `Frozen requirement` cell for every row below is copied verbatim from that register's `Atomic semantic / acceptance condition` cell. Frozen Revision 11 and its protected corrections/supplements control normative semantics, not current status.

The controlling Human decision dated 2026-08-09 approves this complete baseline and specifically sets `I03.R006`, `B02.R004`, and `I10.R003` to `Not implemented`, while preserving `I10.R004` as `Implemented, evidence incomplete`.

## 2. Current authoritative aggregate

```text
Human CLOSED:                       56
Implemented, evidence incomplete:  14
Not implemented:                   25
Primary browser/manual pending:    27
-------------------------------------
Total:                            122
Remaining:                         66
D:                                  0
```

## 3. Status definitions

- `Human CLOSED`: an explicit Human Closure controls. The requirement may not be reopened or weakened without another explicit Human decision.
- `Implemented, evidence incomplete`: the required production path exists, but approved closure evidence is incomplete.
- `Not implemented`: the exact required production mechanism/path is absent, incomplete, or contradicted by current behavior.
- `Primary browser/manual pending`: production behavior appears present, but authoritative acceptance principally requires real browser, viewport, print, assistive-technology, or manual evidence.

These four labels are exact and mutually exclusive. `UNRESOLVED` is not permitted in this completed ledger.

## 4. Source precedence and source keys

Later explicit Human decisions control earlier conflicting classifications.

1. **H0** — Current Human approval, `C:\Users\ekate\.codex\attachments\063f39da-faac-46f4-bf21-2c1e1dff0ac8\pasted-text.txt`, especially lines 31–70, 121–124, 267–274, and 317–320.
2. **HC0** — Explicit `I01.R001` / `I01.R002` Human Closure in the persisted task transcript, `C:\Users\ekate\.codex\sessions\2026\08\04\rollout-2026-08-04T08-04-53-019fcb29-1028-7d61-a2ce-9e913533b431.jsonl`, line 5472 (the original Human message states both IDs `CLOSED` and later repeats that both are human-reviewed and closed).
3. **HC1** — Seven-ID selection-ownership foundation Closure, `C:\Users\ekate\.codex\attachments\7807d28b-088a-46f4-ab25-817eeb8a0ab5\pasted-text.txt`, lines 9–15.
4. **HC2** — Human Closure audit adding 22 IDs, `C:\Users\ekate\.codex\attachments\9cbc1726-c520-4e05-83b7-3fd3e3a3b349\pasted-text.txt`, lines 30–78; lines 90–96 also preserve the earlier I04/L04 status evidence.
5. **HC3** — `I11.R003` Human Closure and 32-ID baseline, `C:\Users\ekate\.codex\attachments\14695d69-3ed8-48b1-8fdc-008e7c0fa221\pasted-text.txt`, lines 19–35.
6. **HC4** — I02 and W06 protected Human Closure, `C:\Users\ekate\.codex\attachments\d80d6404-3581-4573-a26d-31e59b37d401\pasted-text.txt`, lines 27–39.
7. **HC5** — N05 protected Human Closure, `C:\Users\ekate\.codex\attachments\65e5e7d0-ee3c-48d3-bb8c-96b67336a811\pasted-text.txt`, lines 19–39.
8. **HC6** — A06 authoritative Human Closure, `C:\Users\ekate\.codex\attachments\2034df73-030e-4cca-96c1-80f147486ebf\pasted-text.txt`, lines 18–40.
9. **HC7** — I09 Human Closure and 56-ID transition, `C:\Users\ekate\.codex\attachments\5ee8519a-e459-48a9-9af4-7801b38d64ee\pasted-text.txt`, lines 20–74.
10. **RA** — Complete 60-ID current-reality audit with the per-ID table, persisted in `C:\Users\ekate\.codex\sessions\2026\08\04\rollout-2026-08-04T08-04-53-019fcb29-1028-7d61-a2ce-9e913533b431.jsonl`, line 7116. Human review preserves the 58 uncontested rows in `C:\Users\ekate\.codex\attachments\af275427-4a1d-45b7-b085-584a87374d37\pasted-text.txt`, lines 1, 72, and 218; H0 accepts that audit subject only to its explicit corrections at lines 130 and 262–269.
11. **CR** — Accepted three-ID correction review, incorporated by H0: `I03.R006`, `B02.R004`, and `I10.R003` are `Not implemented`.
12. **NR** — `PHASE_2C_BATCH_2_ATOMIC_IMPLEMENTATION_READINESS.md`; normative identity/wording only, never status authority.

Implementation/evidence references use these abbreviations: `CF` = `app/chart-figures.tsx`; `CW` = `app/calculator-workspace.tsx`; `CSS` = `app/globals.css`; `AT` = `app/annual-table.tsx`; `TF` = `tests/app/chart-figures.test.tsx`; `TW` = `tests/app/calculator-workspace.test.tsx`; `CM` = `lib/presentation/chart-model.ts`; `CMT` = `tests/presentation/chart-model.test.ts`.

## 5. Complete authoritative table

| Requirement ID | Requirement family | Frozen requirement | Authoritative current status | Status authority type | Status authority source | Exact source location | Decision chronology | Superseded or conflicting prior status | Current implementation/evidence reference | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| W06.R001 | W06 | Ending balance renders as the `A0→A5` total when `A4=A5`. | Human CLOSED | Human Closure | HC4 | HC4 lines 27–39; NR:33 | Closed 2026-08-08; current | Earlier implementation state superseded | CF:9–43; TF:111 | Closure protected. |
| W06.R002 | W06 | The rendered composition has exactly the frozen five steps; equality of A4/A5 never creates a sixth/fifth increment artifact. | Human CLOSED | Human Closure | HC4 | HC4 lines 27–39; NR:34 | Closed 2026-08-08; current | Earlier implementation state superseded | CF:38–43; TF:150 | Closure protected. |
| A06.R001 | A06 | A partial point label is exactly `Year {year} — partial period, months {startMonth}–{endMonth}`. | Human CLOSED | Human Closure | HC6 | HC6 lines 34–40; NR:35 | Closed 2026-08-08; current | Earlier Not-implemented state superseded | CM/CMT; TF:392 | Closure protected. |
| A06.R002 | A06 | The final partial point appends exactly `The final recorded period covers months {startMonth}–{endMonth}.` to static summary. | Human CLOSED | Human Closure | HC6 | HC6 lines 34–40; NR:36 | Closed 2026-08-08; current | Earlier Not-implemented state superseded | CM/CMT; TF:411 | Closure protected. |
| A06.R003 | A06 | A selected partial point uses the exact partial point label as `{label}`. | Human CLOSED | Human Closure | HC6 | HC6 lines 34–40; NR:37 | Closed 2026-08-08; current | Earlier Not-implemented state superseded | CM/CMT; TF:423 | Closure protected. |
| A06.R004 | A06 | Non-partial point and selected labels are exactly `Year {year}`. | Human CLOSED | Human Closure | HC6 | HC6 lines 34–40; NR:38 | Reality correction then Closure 2026-08-08 | NI → IEI → Human CLOSED | CM/CMT; TF:432 | Closure controls earlier classification. |
| A06.R005 | A06 | A non-partial final point emits no partial static-summary sentence. | Human CLOSED | Human Closure | HC6 | HC6 lines 34–40; NR:39 | Reality correction then Closure 2026-08-08 | NI → IEI → Human CLOSED | CM/CMT; TF:454 | Closure controls earlier classification. |
| N05.R001 | N05 | USD full values in visible chart text/selection/list are not compacted. | Human CLOSED | Human Closure | HC5 | HC5 lines 35–39; NR:40 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF; TF:165 | Closure protected. |
| N05.R002 | N05 | EUR full values in visible chart text/selection/list are not compacted. | Human CLOSED | Human Closure | HC5 | HC5 lines 35–39; NR:41 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF; TF:169 | Closure protected. |
| N05.R003 | N05 | GBP full values in visible chart text/selection/list are not compacted. | Human CLOSED | Human Closure | HC5 | HC5 lines 35–39; NR:42 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF; TF:173 | Closure protected. |
| N05.R004 | N05 | CAD full values in visible chart text/selection/list are not compacted. | Human CLOSED | Human Closure | HC5 | HC5 lines 35–39; NR:43 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF; TF:177 | Closure protected. |
| N05.R005 | N05 | AUD full values in visible chart text/selection/list are not compacted. | Human CLOSED | Human Closure | HC5 | HC5 lines 35–39; NR:44 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF; TF:181 | Closure protected. |
| I01.R001 | I01 | Composition figure has one chart surface in Tab order with `role="group"`, visible-title name, and exact visible instruction description. | Human CLOSED | Human Closure | HC0 | HC0 session line 5472; NR:45 | Human Closure 2026-08-07; current | None controlling | CF:30–49; TF:342 | Explicit per-ID Human Closure; closure protected. |
| I01.R002 | I01 | Annual figure has one chart surface in Tab order with the same required semantic construction. | Human CLOSED | Human Closure | HC0 | HC0 session line 5472; NR:46 | Human Closure 2026-08-07; current | None controlling | CF:52–68; TF:342 | Explicit per-ID Human Closure; closure protected. |
| I01.R003 | I01 | Data points, bars, connectors, and baselines are not focusable. | Human CLOSED | Human Closure | HC2 | HC2 lines 30–58; NR:47 | Closed 2026-08-08; current | Earlier evidence state superseded | CF:38–47,60–66; TF:342 | Closure protected. |
| I01.R004 | I01 | Pointer hit regions are not focusable. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:48 | Approved 2026-08-09; current | No authoritative conflict | CF:35–66; TF:342 | Required pointer hit-region mechanism is absent. |
| I02.R001 | I02 | Left Arrow reaches the preceding selectable item. | Human CLOSED | Human Closure | HC4 | HC4 lines 36–39; NR:49 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF:22–27; TF:203 | Closure protected. |
| I02.R002 | I02 | Left Arrow prevents scroll. | Human CLOSED | Human Closure | HC4 | HC4 lines 36–39; NR:50 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF:22–27; TF:221 | Closure protected. |
| I02.R003 | I02 | Right Arrow reaches the following selectable item. | Human CLOSED | Human Closure | HC4 | HC4 lines 36–39; NR:51 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF:22–27; TF:229 | Closure protected. |
| I02.R004 | I02 | Right Arrow prevents scroll. | Human CLOSED | Human Closure | HC4 | HC4 lines 36–39; NR:52 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF:22–27; TF:247 | Closure protected. |
| I02.R005 | I02 | Home selects the first selectable item. | Human CLOSED | Human Closure | HC4 | HC4 lines 36–39; NR:53 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF:22–27; TF:255 | Closure protected. |
| I02.R006 | I02 | Home prevents scroll. | Human CLOSED | Human Closure | HC4 | HC4 lines 36–39; NR:54 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF:22–27; TF:273 | Closure protected. |
| I02.R007 | I02 | End selects the final selectable item. | Human CLOSED | Human Closure | HC4 | HC4 lines 36–39; NR:55 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF:22–27; TF:281 | Closure protected. |
| I02.R008 | I02 | End prevents scroll. | Human CLOSED | Human Closure | HC4 | HC4 lines 36–39; NR:56 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF:22–27; TF:302 | Closure protected. |
| I02.R009 | I02 | Keyboard boundary behavior stays within the successful model. | Human CLOSED | Human Closure | HC4 | HC4 lines 36–39; NR:57 | Closed 2026-08-08; current | Earlier evidence-incomplete state superseded | CF:22–27; TF:310 | Closure protected. |
| I02.R010 | I02 | Keyboard selection updates committed and visible state through workspace ownership. | Human CLOSED | Human Closure | HC1 | HC1 lines 9–15; NR:58 | Foundation Closure 2026-08-07; current | None controlling | CW:85–87,338–343; TF/TW | Closure protected. |
| I03.R001 | I03 | Mouse click selects the nearest x-position item. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:59 | Approved 2026-08-09; current | None | CF lacks spatial pointer handler | Exact plotting-area path absent. |
| I03.R002 | I03 | Touch/tap selects the nearest x-position item. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:60 | Approved 2026-08-09; current | None | CF lacks touch/spatial handler | Exact tap path absent. |
| I03.R003 | I03 | An equal-distance x tie selects the earlier item. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:61 | Approved 2026-08-09; current | None | No distance/tie implementation | Required algorithm absent. |
| I03.R004 | I03 | Pointer action outside an eligible hit region is a no-op. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:62 | Approved 2026-08-09; current | None | No eligible plotting-region hit test | Required mechanism absent. |
| I03.R005 | I03 | Pointer commitment updates committed/visible selection without changing model identity. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:63 | Approved 2026-08-09; current | None | Workspace owner exists; pointer commitment absent | Partial prerequisite only. |
| I03.R006 | I03 | Click/tap interaction never calls financial calculation. | Not implemented | Explicit Human correction | H0 + CR | H0 lines 31,121,267,317; NR:64 | Corrected 2026-08-09; current | IEI candidate superseded | CF list-button click is a substitute path | Frozen plotting/hit-region click/tap path is absent. |
| I04.R001 | I04 | Composition pointer hit regions measure at least 24×24 CSS pixels. | Not implemented | Current Human baseline | H0; earlier HC2 evidence | H0 baseline; HC2 lines 90–96; NR:65 | Earlier NI preserved by H0 | None | CF has no pointer hit region | Browser evidence cannot precede implementation. |
| I04.R002 | I04 | Annual pointer hit regions measure at least 24×24 CSS pixels. | Not implemented | Current Human baseline | H0; earlier HC2 evidence | H0 baseline; HC2 lines 90–96; NR:66 | Earlier NI preserved by H0 | None | CF has no pointer hit region | Browser evidence cannot precede implementation. |
| I05.R001 | I05 | Hover preview changes visible selection without committing selection. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:67 | Approved 2026-08-09; current | None | CF has no hover state/handler | Required product mechanism absent. |
| I05.R002 | I05 | Pointer leave restores the committed selection. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:68 | Approved 2026-08-09; current | None | CF has no preview/leave handler | Required product mechanism absent. |
| I05.R003 | I05 | Hover preview writes no announcement. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:69 | Approved 2026-08-09; current | None | No hover preview or announcement state | Required mechanism absent. |
| I05.R004 | I05 | Pointer leave/restoration writes no announcement. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:70 | Approved 2026-08-09; current | None | No leave/restoration mechanism | Required mechanism absent. |
| I06.R001 | I06 | Initial chart selection writes no announcement. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:71 | Approved 2026-08-09; current | None | CW:83–87; TW:122 lacks silence assertion | DOM evidence remains. |
| I06.R002 | I06 | Stale invalid draft writes no announcement. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:72 | Approved 2026-08-09; current | None | CW:328 creates `role="status"`; TW:369/378 | Current code contradicts the atom. |
| I06.R003 | I06 | Recommitting the same index writes no announcement. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:73 | Approved 2026-08-09; current | None | CF:22–27; exact silence test missing | Automatable evidence remains. |
| I06.R004 | I06 | Any clamp/normalization restoration writes no announcement. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:74 | Approved 2026-08-09; current | None | CF clamp/normalization; silence test missing | Automatable evidence remains. |
| I06.R005 | I06 | Programmatic restoration writes no announcement. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:75 | Approved 2026-08-09; current | None | CW:108–111,176–179; silence test missing | Automatable evidence remains. |
| I07.R001 | I07 | A changed keyboard commitment announces exactly once. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:76 | Approved 2026-08-09; current | None | No dedicated chart announcement region | Required mechanism absent. |
| I07.R002 | I07 | A changed click commitment announces exactly once. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:77 | Approved 2026-08-09; current | None | No dedicated chart announcement region | Required mechanism absent. |
| I07.R003 | I07 | A changed tap commitment announces exactly once. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:78 | Approved 2026-08-09; current | None | No tap/announcement mechanism | Required mechanism absent. |
| I08.R001 | I08 | Initial composition committed/visible selection is Ending balance index 4. | Human CLOSED | Human Closure | HC1 | HC1 lines 9–15; NR:79 | Foundation Closure 2026-08-07; current | None controlling | CW:63–67; TW:122 | Closure protected. |
| I08.R002 | I08 | Initial annual committed/visible selection is the final supplied point. | Human CLOSED | Human Closure | HC1 | HC1 lines 9–15; NR:80 | Foundation Closure 2026-08-07; current | None controlling | CW:63–67; TW:122 | Closure protected. |
| I08.R003 | I08 | Initial composition selection is silent. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:81 | Approved 2026-08-09; current | None | TW:122 verifies index, not silence | Exact DOM assertion remains. |
| I08.R004 | I08 | Initial annual selection is silent. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:82 | Approved 2026-08-09; current | None | TW:122 verifies index, not silence | Exact DOM assertion remains. |
| I09.R001 | I09 | New accepted result resets annual 100→1 selection to index 0. | Human CLOSED | Human Closure | HC7 | HC7 lines 20–34,72–74; NR:83 | Closed 2026-08-09; current | IEI superseded | CW:102–111; TW:255 | Closure protected. |
| I09.R002 | I09 | The annual 100→1 reset is silent. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:84 | Approved 2026-08-09; current | None | TW:255 lacks silence assertion | Automatable evidence remains. |
| I09.R003 | I09 | New accepted result resets annual 1→100 selection to index 99. | Human CLOSED | Human Closure | HC7 | HC7 lines 20–34,72–74; NR:85 | Closed 2026-08-09; current | IEI superseded | CW:102–111; TW:283 | Closure protected. |
| I09.R004 | I09 | The annual 1→100 reset is silent. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:86 | Approved 2026-08-09; current | None | TW:283 lacks silence assertion | Automatable evidence remains. |
| I09.R005 | I09 | New accepted result clears annual hover preview. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:87 | Approved 2026-08-09; current | None | No annual hover-preview state | Required product mechanism absent. |
| I09.R006 | I09 | New accepted result makes the new final annual item visible. | Human CLOSED | Human Closure | HC7 | HC7 lines 20–34,72–74; NR:88 | Closed 2026-08-09; current | IEI superseded | CW; TW:310 | Closure protected. |
| I10.R001 | I10 | Invalid/incomplete draft preserves committed selection. | Human CLOSED | Human Closure | HC1 | HC1 lines 9–15; NR:89 | Foundation Closure 2026-08-07; current | None controlling | CW:137–141; TW:156 | Closure protected. |
| I10.R002 | I10 | Ordinary rerender preserves committed selection. | Human CLOSED | Human Closure | HC1 | HC1 lines 9–15; NR:90 | Foundation Closure 2026-08-07; current | None controlling | CW state; TW:141 | Closure protected. |
| I10.R003 | I10 | Locale change preserves committed selection. | Not implemented | Explicit Human correction | H0 + CR | H0 lines 32–33,61–69,123,273; NR:91 | Corrected 2026-08-09; current | IEI superseded | No runtime locale lifecycle; currency is not locale | Human correction controls. |
| I10.R004 | I10 | Viewport change preserves committed selection. | Implemented, evidence incomplete | Explicit Human preservation | H0 | H0 lines 69,195,274,462; NR:92 | Preserved 2026-08-09; current | Evidence-path concern did not reclassify | CW state independent of CSS viewport | Do not reopen. |
| I11.R001 | I11 | New accepted result resets composition selection to Ending index 4. | Human CLOSED | Human Closure | HC1 | HC1 lines 9–15; NR:93 | Foundation Closure 2026-08-07; current | None controlling | CW:102–111; TW:189 | Closure protected. |
| I11.R002 | I11 | New accepted result clears composition hover preview. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:94 | Approved 2026-08-09; current | None | No composition hover-preview state | Required mechanism absent. |
| I11.R003 | I11 | New accepted result updates visible composition selected-value text to Ending balance. | Human CLOSED | Human Closure | HC3 | HC3 lines 19–35; NR:95 | Closed 2026-08-08; current | Earlier DOM evidence gap superseded | TW:206 | Closure protected. |
| I11.R004 | I11 | New accepted composition result is silent. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:96 | Approved 2026-08-09; current | None | TW:189/206 lacks silence assertion | Automatable evidence remains. |
| I11.R005 | I11 | Ordinary rerender preserves committed composition selection. | Human CLOSED | Human Closure | HC1 | HC1 lines 9–15; NR:97 | Foundation Closure 2026-08-07; current | None controlling | TW:189 | Closure protected. |
| R01.R001 | R01 | Without JavaScript, static HTML exposes `Your result visualised` and both figure headings. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:98 | Approved 2026-08-09; current | None | CF/Page structure present; no-JS browser evidence pending | Browser/manual is primary. |
| R01.R002 | R01 | Without JavaScript, static HTML exposes the illustration limitation and composition ordered five-value list. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:99 | Approved 2026-08-09; current | None | CF list/limitation present | No-JS evidence pending. |
| R01.R003 | R01 | Without JavaScript, static HTML exposes static explanatory text. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:100 | Approved 2026-08-09; current | None | CF static summaries present | No-JS evidence pending. |
| R01.R004 | R01 | Without JavaScript, the annual table remains available. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:101 | Approved 2026-08-09; current | None | CW:344; AT:18–30 | No-JS evidence pending. |
| R01.R005 | R01 | SVG enhancement failure retains headings, limitation, list, static text, and table. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:102 | Approved 2026-08-09; current | None | Text/list/table are SVG siblings | Failure-mode browser/manual evidence pending. |
| R01.R006 | R01 | SVG unsupported behavior retains headings, limitation, list, static text, and table. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:103 | Approved 2026-08-09; current | None | Fallback structure appears independent of SVG | Unsupported-environment evidence pending. |
| R01.R007 | R01 | A failed chart-model build leaves six-result summary and table intact while showing the two frozen unavailable carriers. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:104 | Approved 2026-08-09; current | None | CF:77; CW:330–344; TW:172/TF:464 partial | Complete atomic assertions remain. |
| R01.R008 | R01 | Stale rendering uses the same stale last-valid result and creates no announcement. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:105 | Approved 2026-08-09; current | None | CW:328 creates `role="status"` | No-announcement clause currently fails. |
| R02.R001 | R02 | Invalid/incomplete draft preserves prior six-result summary. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:106 | Closed 2026-08-08; current | Earlier evidence state superseded | CW:330–337; TW:358 | Closure protected. |
| R02.R002 | R02 | Invalid/incomplete draft preserves prior last-valid currency. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:107 | Closed 2026-08-08; current | Earlier evidence state superseded | TW:400 | Closure protected. |
| R02.R003 | R02 | Invalid/incomplete draft preserves chart committed selection. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:108 | Closed 2026-08-08; current | Earlier evidence state superseded | TW:156 | Closure protected. |
| R02.R004 | R02 | Invalid/incomplete draft preserves the annual table. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:109 | Closed 2026-08-08; current | Earlier evidence state superseded | TW:358 | Closure protected. |
| R02.R005 | R02 | Invalid/incomplete draft preserves the stale label. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:110 | Closed 2026-08-08; current | Earlier evidence state superseded | CW:328; TW:358 | Closure protected. |
| L01.R001 | L01 | At 320 CSS px, charts cause no page-level horizontal overflow. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:111 | Approved 2026-08-09; current | None | CSS:46–48 | Actual viewport measurement pending. |
| L01.R002 | L01 | At 320 CSS px, composition endpoints are visible and not clipped. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:112 | Approved 2026-08-09; current | None | Responsive SVG exists | Actual clipping inspection pending. |
| L01.R003 | L01 | At 320 CSS px, annual endpoints are visible and not clipped. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:113 | Approved 2026-08-09; current | None | Responsive SVG exists | Actual clipping inspection pending. |
| L02.R001 | L02 | At 200% zoom, visual order remains frozen. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:114 | Approved 2026-08-09; current | None | Fixed DOM order/CSS grid | Real zoom inspection pending. |
| L02.R002 | L02 | At 200% zoom, controls remain available. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:115 | Approved 2026-08-09; current | None | Controls present | Real zoom operation pending. |
| L02.R003 | L02 | At 200% zoom, required text remains readable and accessible. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:116 | Approved 2026-08-09; current | None | Text carriers present | Clipping/overlap inspection pending. |
| L02.R004 | L02 | At 200% zoom, keyboard access remains usable. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:117 | Approved 2026-08-09; current | None | One Tab surface exists | Real zoom keyboard evidence pending. |
| L02.R005 | L02 | At 400% zoom, visual order remains frozen. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:118 | Approved 2026-08-09; current | None | Fixed DOM order/CSS grid | Real zoom inspection pending. |
| L02.R006 | L02 | At 400% zoom, controls remain available. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:119 | Approved 2026-08-09; current | None | Controls present | Real zoom operation pending. |
| L02.R007 | L02 | At 400% zoom, required text remains readable and accessible. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:120 | Approved 2026-08-09; current | None | Text carriers present | Clipping/overlap inspection pending. |
| L02.R008 | L02 | At 400% zoom, keyboard access remains usable. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:121 | Approved 2026-08-09; current | None | One Tab surface exists | Real zoom keyboard evidence pending. |
| L03.R001 | L03 | Assistive technology exposes one useful name/description per figure. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:122 | Approved 2026-08-09; current | None | CF ARIA/title/instruction present | Screen-reader speech evidence pending. |
| L03.R002 | L03 | Assistive technology makes full values reachable through keyboard selection. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:123 | Approved 2026-08-09; current | None | Keyboard/full-value carrier present | AT navigation evidence pending. |
| L03.R003 | L03 | Assistive technology produces no duplicate status speech. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:124 | Approved 2026-08-09; current | None | Source cannot prove spoken output | Manual AT evidence pending. |
| L03.R004 | L03 | Assistive technology retains meaningful list/table fallback. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:125 | Approved 2026-08-09; current | None | CF lists and AT table present | AT navigation evidence pending. |
| L04.R001 | L04 | Forced-colors mode retains non-colour meaning for chart values/states. | Not implemented | Current Human baseline | H0; earlier HC2 evidence | H0 baseline; HC2 lines 90–96; NR:126 | Earlier NI preserved by H0 | None | CSS lacks forced-colors treatment | Implementation precedes browser evidence. |
| L04.R002 | L04 | Forced-colors mode retains visible usable focus indication. | Not implemented | Current Human baseline | H0; earlier HC2 evidence | H0 baseline; HC2 lines 90–96; NR:127 | Earlier NI preserved by H0 | None | No forced-colors focus rule | Implementation precedes browser evidence. |
| L05.R001 | L05 | Reduced-motion preference requires no animation to understand or operate charts. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:128 | Approved 2026-08-09; current | None | No required animation exists | Real preference/browser evidence pending. |
| L06.R001 | L06 | Print retains page/figure titles. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:129 | Approved 2026-08-09; current | None | CSS:59 leaves titles | Print preview evidence pending. |
| L06.R002 | L06 | Print retains chart static summary and/or ordered list. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:130 | Approved 2026-08-09; current | None | CSS:59 leaves summary/list | Print preview evidence pending. |
| L06.R003 | L06 | Print retains selected-value context. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:131 | Approved 2026-08-09; current | None | `.chart-selected` remains | Print preview evidence pending. |
| L06.R004 | L06 | Print retains annual table. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:132 | Approved 2026-08-09; current | None | AT table remains | Print preview evidence pending. |
| L06.R005 | L06 | Print rendering retains readable chart fallback independent of interactivity. | Primary browser/manual pending | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:133 | Approved 2026-08-09; current | None | Static list/summary/table present | Print rendering evidence pending. |
| B02.R001 | B02 | Initial chart render does not increase financial-calculation call count. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:134 | Closed 2026-08-08; current | Earlier evidence state superseded | TW calculation spies | Closure protected. |
| B02.R002 | B02 | Ordinary chart rerender does not increase financial-calculation call count. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:135 | Closed 2026-08-08; current | Earlier evidence state superseded | TW:115 | Closure protected. |
| B02.R003 | B02 | Keyboard chart interaction does not increase financial-calculation call count. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:136 | Closed 2026-08-08; current | Earlier evidence state superseded | TW:141 and spies | Closure protected. |
| B02.R004 | B02 | Pointer/click/tap chart interaction does not increase financial-calculation call count. | Not implemented | Explicit Human correction | H0 + CR | H0 lines 32,122,268,317; NR:137 | Corrected 2026-08-09; current | IEI candidate superseded | List-button click is substitute evidence | Required plotting/hit-region paths are absent. |
| B02.R005 | B02 | Hover does not increase financial-calculation call count. | Not implemented | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:138 | Approved 2026-08-09; current | None | No hover production mechanism | Absence is not zero-call implementation evidence. |
| B02.R006 | B02 | Failed chart-model build does not increase financial-calculation call count. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:139 | Closed 2026-08-08; current | Earlier evidence state superseded | TW/TF failure path | Closure protected. |
| B04.R001 | B04 | Initial chart presence leaves the URL unchanged. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:140 | Approved 2026-08-09; current | None | No app history/location writes; exact assertion missing | Integration evidence remains. |
| B04.R002 | B04 | Render/rerender leaves the URL unchanged. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:141 | Approved 2026-08-09; current | None | React rerender path has no URL write | Integration evidence remains. |
| B04.R003 | B04 | Keyboard, pointer, and selection interaction leave the URL unchanged. | Implemented, evidence incomplete | Human-approved reality audit | H0 + RA | RA session line 7116; AF lines 1, 72, 218; H0 lines 130, 262–269; NR:142 | Approved 2026-08-09; current | None | No app URL write; interaction assertion missing | Integration evidence remains. |
| B05.R001 | B05 | The table displays `Year` in the frozen first position. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:143 | Closed 2026-08-08; current | Earlier evidence state superseded | AT:7–25; TW | Closure protected. |
| B05.R002 | B05 | The table displays `Opening balance` in frozen second position. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:144 | Closed 2026-08-08; current | Earlier evidence state superseded | AT:7–25; TW | Closure protected. |
| B05.R003 | B05 | The table displays `Contributions` in frozen third position. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:145 | Closed 2026-08-08; current | Earlier evidence state superseded | AT:7–25; TW | Closure protected. |
| B05.R004 | B05 | The table displays `Gross growth` in frozen fourth position. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:146 | Closed 2026-08-08; current | Earlier evidence state superseded | AT:7–25; TW | Closure protected. |
| B05.R005 | B05 | The table displays `Fees` in frozen fifth position. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:147 | Closed 2026-08-08; current | Earlier evidence state superseded | AT:7–25; TW | Closure protected. |
| B05.R006 | B05 | The table displays `Ending balance` in frozen sixth position. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:148 | Closed 2026-08-08; current | Earlier evidence state superseded | AT:7–25; TW | Closure protected. |
| B05.R007 | B05 | The table displays `Cumulative contributions` in frozen seventh position. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:149 | Closed 2026-08-08; current | Earlier evidence state superseded | AT:7–25; TW | Closure protected. |
| B05.R008 | B05 | The table displays `Cumulative gross growth` in frozen eighth position. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:150 | Closed 2026-08-08; current | Earlier evidence state superseded | AT:7–25; TW | Closure protected. |
| B05.R009 | B05 | The table displays `Cumulative fees` in frozen ninth position. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:151 | Closed 2026-08-08; current | Earlier evidence state superseded | AT:7–25; TW | Closure protected. |
| B05.R010 | B05 | The nine fields remain in exactly the frozen order. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:152 | Closed 2026-08-08; current | Earlier evidence state superseded | AT:7–25; TW | Closure protected. |
| B05.R011 | B05 | `startMonth` and `endMonth` are absent from the authoritative table. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:153 | Closed 2026-08-08; current | Earlier evidence state superseded | AT columns; TW | Closure protected. |
| B05.R012 | B05 | The existing HTML table remains authoritative; chart display does not replace it. | Human CLOSED | Human Closure | HC2 | HC2 lines 51–78; NR:154 | Closed 2026-08-08; current | Earlier evidence state superseded | CW:344; AT | Closure protected. |

## 6. Mechanical integrity checks

The creation gate and post-write validator must establish all of the following from the table above:

```text
Normative register IDs:             122
Ledger rows:                        122
Unique ledger IDs:                  122
Duplicate IDs:                        0
Missing IDs:                          0
Unknown IDs:                          0
UNRESOLVED rows:                      0

Human CLOSED:                        56
Implemented, evidence incomplete:    14
Not implemented:                     25
Primary browser/manual pending:      27
Total:                              122
Remaining:                           66
D:                                    0
```

Mandatory decision checks:

```text
I03.R006 = Not implemented
B02.R004 = Not implemented
I10.R003 = Not implemented
I10.R004 = Implemented, evidence incomplete
Human-CLOSED rows = 56 and none reopened
```

## 7. Protected Human decisions

All 56 `Human CLOSED` rows are controlling decisions. They may not be weakened, reinterpreted, or inferred away from code/test state. This protection includes, at minimum, all I02 requirements, W06, N05, A06, `I09.R001`, `I09.R003`, and `I09.R006`, plus every other row marked `Human CLOSED` above.

## 8. Supersession history

- `41 / 27 / 27 / 27` was an earlier historical classification and is superseded.
- `53 / 20 / 22 / 27` was a later historical classification and is superseded.
- `56 / 17 / 22 / 27` was the Human-declared working classification before exact current-reality correction and is superseded.
- `15 / 18 / 27` was the initial 60-ID reality-audit candidate partition and is superseded.
- `I03.R006` and `B02.R004` were initially treated as implemented using list-button interaction; the required plotting/hit-region paths were later shown to be absent.
- `I10.R003` was initially `Implemented, evidence incomplete`; the current product was later shown to have no genuine runtime locale-change mechanism.
- Human approved all three corrected requirements as `Not implemented`.
- `56 / 14 / 25 / 27` is the sole current authoritative classification baseline.

Historical totals are retained only for chronology and are not alternative current states.

## 9. Change control

Any future ledger change requires:

1. exact affected requirement IDs;
2. supporting evidence;
3. identification of each current status;
4. proposed replacement status;
5. conflict and aggregate impact;
6. explicit Human approval; and
7. an auditable update to this ledger.

This ledger must never be silently regenerated or reclassified from production code, test results, evidence class, family membership, aggregate totals, roadmap state, or perceived completion. The Atomic Readiness register remains authoritative for normative IDs and requirement identity, not current status.

## 10. Creation verification

This ledger was created under a recording-only authorization. No product, test, CSS, configuration, dependency, lockfile, frozen specification, supplement, or Atomic Readiness file was modified; the ledger was not staged, committed, tagged, pushed, submitted as a PR, or deployed.

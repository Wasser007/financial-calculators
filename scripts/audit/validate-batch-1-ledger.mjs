import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const LEDGER = resolve(HERE, "..", "..", "BATCH_1_50_CONTRACT_CANONICAL_ATOMIC_LEDGER.jsonl");
const EXPECTED_CONTRACTS = [
  "T01","T02","T03","T04","T05","T06","T07","T08","T09","T10","T11","T12","T13",
  "F01","F02","F03","F04","F05",
  "W01","W02","W03","W04","W05","W07","W08",
  "C01","C02","C03","C04",
  "A01","A02","A03","A04","A05","A07","A08",
  "N01","N02","N03","N04","N06","N07",
  "S01","S02","S03","S04","S05","S06","S07","B01",
];
const SCHEMA = [
  "contract_id","atomic_id","member_key","source_file","source_section","frozen_clause","atomic_requirement",
  "implementation_file","implementation_symbol","evidence_file","evidence_name","evidence_type","input_or_fixture",
  "exact_expected","actual_assertion","independent_oracle","status","gap_id","gap_reason","missing_positive",
  "missing_negative","missing_boundary","missing_priority","required_assertion","minimum_repair","allowed_files","repair_class",
];
const GAP_FIELDS = ["gap_reason","missing_positive","missing_negative","missing_boundary","missing_priority","required_assertion","minimum_repair","allowed_files","repair_class"];
const STATUS = ["PASS","FAIL","BLOCKED"];
const errors = [];
const warnings = [];

function sorted(values) { return [...values].sort((a,b)=>a.localeCompare(b, "en", { numeric:true })); }
function sameArray(a,b) { return a.length===b.length && a.every((v,i)=>v===b[i]); }
function nonEmpty(value) {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value).length > 0;
  return value !== null && value !== undefined;
}
function locate(canonical) {
  const candidates = [resolve(HERE, canonical), resolve(HERE, "..", canonical), join(HERE, basename(canonical)), resolve(process.cwd(), canonical)];
  return candidates.find(existsSync);
}
function exactMembers(contract, expected) {
  const actual = rows.filter(r=>r.contract_id===contract).map(r=>r.member_key);
  const duplicates = sorted(actual.filter((v,i)=>actual.indexOf(v)!==i));
  const missing = sorted(expected.filter(v=>!actual.includes(v)));
  const extra = sorted(actual.filter(v=>!expected.includes(v)));
  if (duplicates.length || missing.length || extra.length) errors.push(`${contract} member mismatch duplicates=${JSON.stringify(duplicates)} missing=${JSON.stringify(missing)} extra=${JSON.stringify(extra)}`);
  return { expected:expected.length, actual:actual.length, duplicates, missing, extra };
}

if (!existsSync(LEDGER)) throw new Error(`ledger missing: ${LEDGER}`);
const physical = readFileSync(LEDGER, "utf8").split(/\r?\n/);
if (physical.at(-1)==="") physical.pop();
const rows = [];
for (let i=0;i<physical.length;i++) {
  if (!physical[i].trim()) { errors.push(`line ${i+1}: blank physical line`); continue; }
  try { rows.push({...JSON.parse(physical[i]), _line:i+1}); }
  catch (error) { errors.push(`line ${i+1}: JSON parse error: ${error.message}`); }
}

const atomicSeen = new Map();
const ownership = new Map();
const contractSet = new Set();
for (const row of rows) {
  const keys = Object.keys(row).filter(k=>k!=="_line").sort();
  if (!sameArray(keys, [...SCHEMA].sort())) errors.push(`line ${row._line}: schema differs; keys=${JSON.stringify(keys)}`);
  for (const key of SCHEMA) if (!nonEmpty(row[key])) errors.push(`line ${row._line}: empty or missing ${key}`);
  const serialized = JSON.stringify(row);
  if (/\b(?:TBD|TODO|FIXME|AWAITING|later|unknown)\b/i.test(serialized) || /\.\.\.|…/.test(serialized)) errors.push(`line ${row._line}: placeholder or ellipsis text`);
  if (!STATUS.includes(row.status)) errors.push(`line ${row._line}: invalid status ${row.status}`);
  if (!/^[A-Z][0-9]{2}\.[0-9]{3}$/.test(row.atomic_id)) errors.push(`line ${row._line}: non-literal atomic_id ${row.atomic_id}`);
  if (atomicSeen.has(row.atomic_id)) errors.push(`line ${row._line}: duplicate atomic_id ${row.atomic_id}; first line ${atomicSeen.get(row.atomic_id)}`);
  atomicSeen.set(row.atomic_id,row._line);
  if (ownership.has(row.atomic_id) && ownership.get(row.atomic_id)!==row.contract_id) errors.push(`line ${row._line}: atomic_id has multiple contract owners`);
  ownership.set(row.atomic_id,row.contract_id);
  contractSet.add(row.contract_id);
  if (row.status === "PASS") {
    if (row.gap_id!=="not-required" || row.repair_class!=="none" || row.allowed_files!=="none") errors.push(`line ${row._line}: PASS gap/repair semantics are inconsistent`);
    for (const key of GAP_FIELDS.filter(k=>!['allowed_files','repair_class'].includes(k))) if (row[key]!=="not-required") errors.push(`line ${row._line}: PASS ${key} must be not-required`);
    const evidencePath=locate(row.evidence_file), implementationPath=locate(row.implementation_file), sourcePath=locate(row.source_file);
    if (!evidencePath) errors.push(`line ${row._line}: PASS evidence file not found: ${row.evidence_file}`);
    if (!implementationPath) errors.push(`line ${row._line}: PASS implementation file not found: ${row.implementation_file}`);
    if (!sourcePath) errors.push(`line ${row._line}: PASS source file not found: ${row.source_file}`);
    if (evidencePath && !readFileSync(evidencePath,"utf8").includes(row.evidence_name)) errors.push(`line ${row._line}: PASS evidence_name not locatable: ${row.evidence_name}`);
    for (const key of ["actual_assertion","independent_oracle"]) if (String(row[key]).length<12) errors.push(`line ${row._line}: PASS ${key} is not specific enough`);
    if (/does not|absent|no such|not independently/i.test(row.actual_assertion)) errors.push(`line ${row._line}: PASS actual_assertion admits missing evidence`);
  } else {
    if (row.gap_id!==row.atomic_id) errors.push(`line ${row._line}: non-PASS gap_id must equal atomic_id`);
    for (const key of GAP_FIELDS) if (["not-required","none"].includes(row[key])) errors.push(`line ${row._line}: non-PASS ${key} is incomplete`);
  }
}

const expectedSet = new Set(EXPECTED_CONTRACTS);
const missingContracts = sorted(EXPECTED_CONTRACTS.filter(c=>!contractSet.has(c)));
const unknownContracts = sorted([...contractSet].filter(c=>!expectedSet.has(c)));
if (missingContracts.length || unknownContracts.length) errors.push(`contract whitelist mismatch missing=${JSON.stringify(missingContracts)} unknown=${JSON.stringify(unknownContracts)}`);
for (const c of EXPECTED_CONTRACTS) if (!rows.some(r=>r.contract_id===c)) errors.push(`${c}: no atomic rows`);

const t07Expected = [
 "annual:all-equal:neutral:touches-zero","annual:all-equal:neutral:does-not-touch-zero",
 ...["up","down"].flatMap(e=>["crosses-zero","touches-zero","does-not-touch-zero"].map(z=>`annual:monotonic-or-flat:${e}:${z}`)),
 ...["starts-up-ends-down","starts-down-ends-up","changes-direction"].flatMap(p=>["up","down","neutral"].flatMap(e=>["crosses-zero","touches-zero","does-not-touch-zero"].map(z=>`annual:${p}:${e}:${z}`))),
];
const matrix = {};
matrix.T07=exactMembers("T07",t07Expected);
for (const witness of ["[1,3,2]","[2,3,1]","[2,1,3]","[3,1,2]"]) if (!rows.some(r=>r.contract_id==="T07"&&r.input_or_fixture===witness)) errors.push(`T07 missing specified witness ${witness}`);
matrix.N06=exactMembers("N06",Array.from({length:100},(_,i)=>`count-${i+1}`));
for(const row of rows.filter(r=>r.contract_id==="N06")) {
  if (row.input_or_fixture!==row.member_key.slice(6)) errors.push(`${row.atomic_id}: N06 literal input mismatch`);
  try { const value=JSON.parse(row.exact_expected); if(!Array.isArray(value)||!value.length||!value.every(Number.isInteger)) throw new Error("not literal integer array"); }
  catch { errors.push(`${row.atomic_id}: N06 exact_expected is not a literal integer JSON array`); }
}
matrix.A08=exactMembers("A08",["equal","up","down","up-down-up-end","down-up-down-end","changes","reversal-neutral","flat-ignored"]);
matrix.N01=exactMembers("N01",["all-zero","single-positive","all-positive","all-negative","touching-zero","crossing-zero"].flatMap(n=>[`${n}:domain`,...Array.from({length:5},(_,i)=>`${n}:tick-${i}`)]));
matrix.N03=exactMembers("N03",["no-suffix","K","M","B","T","K-to-M","M-to-B","B-to-T"]);
matrix.N04=exactMembers("N04",["negative","zero","negative-zero","half-up","omit-dot-zero","unicode-minus"]);
matrix.S03=exactMembers("S03",[...Array.from({length:100},(_,i)=>`annual-point-${i}`),...Array.from({length:5},(_,i)=>`annual-tick-${i}`),...Array.from({length:5},(_,i)=>`waterfall-tick-${i}`),"annual-points-unique","annual-ticks-unique","waterfall-ticks-unique"]);
matrix.B01=exactMembers("B01",["one-point","long-schedule","100-point"].flatMap(s=>["order","index","balances","zero-recomputation"].map(k=>`${s}:${k}`)));

const atomicCounts=Object.fromEntries(STATUS.map(s=>[s,rows.filter(r=>r.status===s).length]));
if (Object.values(atomicCounts).reduce((a,b)=>a+b,0)!==rows.length) errors.push("atomic status counts do not close");
const contractStatuses={};
for(const c of EXPECTED_CONTRACTS){ const rs=rows.filter(r=>r.contract_id===c); contractStatuses[c]=rs.some(r=>r.status==="BLOCKED")?"BLOCKED":rs.some(r=>r.status==="FAIL")?"FAIL":"PASS"; }
const contractCounts=Object.fromEntries(STATUS.map(s=>[s,Object.values(contractStatuses).filter(v=>v===s).length]));
if (Object.values(contractCounts).reduce((a,b)=>a+b,0)!==50) errors.push("contract status counts do not close to 50");
const failBlocked=sorted(rows.filter(r=>r.status!=="PASS").map(r=>r.atomic_id));
const gapIds=sorted(rows.filter(r=>r.gap_id!=="not-required").map(r=>r.gap_id));
const gapDuplicates=sorted(gapIds.filter((v,i)=>gapIds.indexOf(v)!==i));
const gapMissing=sorted(failBlocked.filter(id=>!gapIds.includes(id)));
const gapExtra=sorted(gapIds.filter(id=>!failBlocked.includes(id)));
if(gapDuplicates.length||gapMissing.length||gapExtra.length) errors.push(`gap closure failed duplicates=${JSON.stringify(gapDuplicates)} missing=${JSON.stringify(gapMissing)} extra=${JSON.stringify(gapExtra)}`);

const allowedNames=new Set(["BATCH_1_50_CONTRACT_CANONICAL_ATOMIC_LEDGER.jsonl","validate-batch-1-ledger.mjs","BATCH_1_50_CONTRACT_ATOMIC_EVIDENCE_BASELINE_AUDIT.md"]);
const suspicious=readdirSync(HERE).filter(n=>/batch-1.*(?:tmp|temp|generated)|(?:tmp|temp).*batch-1/i.test(n)&&!allowedNames.has(n));
if(suspicious.length) errors.push(`repository artifact directory contains suspicious temporary files: ${JSON.stringify(suspicious)}`);
const gitProbe=spawnSync("git",["rev-parse","--is-inside-work-tree"],{cwd:process.cwd(),encoding:"utf8"});
const gitEvidenceAvailable=gitProbe.status===0&&gitProbe.stdout.trim()==="true";

const result={
  validator:"batch-1-canonical-atomic-ledger-v2",
  ledger:LEDGER,
  rows:rows.length,
  schema:SCHEMA,
  expected:EXPECTED_CONTRACTS,
  actual:sorted(contractSet),
  missing:missingContracts,
  unknown:unknownContracts,
  unique_atomic_ids:atomicSeen.size,
  atomic_counts:atomicCounts,
  contract_counts:contractCounts,
  contract_statuses:contractStatuses,
  fail_or_blocked:failBlocked,
  gaps:{count:gapIds.length,duplicates:gapDuplicates,missing:gapMissing,extra:gapExtra,equal:sameArray(failBlocked,gapIds)},
  matrices:matrix,
  temporary_files:suspicious,
  artifact_sizes:{ledger:statSync(LEDGER).size,validator:statSync(fileURLToPath(import.meta.url)).size},
  warnings,
  errors,
  gates:{
    ATOMIC_LEDGER_COMPLETE:errors.length?"FAIL":"PASS",
    MECHANICAL_VALIDATION:errors.length?"FAIL":"PASS",
    GAP_SET_CLOSURE:(gapDuplicates.length||gapMissing.length||gapExtra.length)?"FAIL":"PASS",
    GIT_RAW_EVIDENCE_COMPLETE:gitEvidenceAvailable?"REQUIRES_REPORT_READBACK":"BLOCKED_NO_GIT_METADATA",
  },
  git_probe:{command:"git rev-parse --is-inside-work-tree",exit_code:gitProbe.status,stdout:gitProbe.stdout,stderr:gitProbe.stderr},
};
console.log(JSON.stringify(result,null,2));
if(errors.length){ console.error(`VALIDATION_FAILED: ${errors.length} error(s)`); process.exit(1); }
console.error("VALIDATION_OK");

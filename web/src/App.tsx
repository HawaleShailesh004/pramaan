import { useCallback, useEffect, useMemo, useState } from "react";
import { ProofMeter } from "./ProofMeter";
import { PramaanFailWell } from "./FailWell";
import { classifyPramaan, type PramaanFail } from "./fail";
import { COPY } from "./copy";
import { DEGREES, DEMO_CSV, NAD_CONTRAST, POLICY_DEFAULT, POLICY_TEMPLATES, STUDENTS, type StudentId } from "./personas";
import { loadPolicy, savePolicy, type StoredPolicy } from "./session";

const API = import.meta.env.VITE_PRAMAAN_API ?? "http://127.0.0.1:8790";

type Screen = "home" | "issuer" | "meera" | "recruiter" | "fake" | "demo" | "explorer";

const SCREENS: Screen[] = [
  "home",
  "issuer",
  "meera",
  "recruiter",
  "fake",
  "explorer",
  "demo",
];

type CastStep = {
  id: string;
  label: string;
  state: "pending" | "running" | "ok" | "fail";
  detail?: string;
};

function screenFromLocation(): Screen {
  const hash = (location.hash || "").replace(/^#\/?/, "");
  if (SCREENS.includes(hash as Screen)) return hash as Screen;
  return "home";
}

async function post(path: string, body: unknown) {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function fetchPolicy(
  minCgpaBps: number,
  degree: number,
  maxYear: number,
): Promise<string> {
  const res = await fetch(
    `${API}/v1/policy?minCgpaBps=${minCgpaBps}&degree=${degree}&maxYear=${maxYear}`,
  );
  if (!res.ok) throw new Error("policy fetch failed");
  const json = await res.json();
  return json.policyHash as string;
}

export function App() {
  const [screen, setScreen] = useState<Screen>(() => screenFromLocation());
  const [minCgpa, setMinCgpa] = useState(POLICY_DEFAULT.minCgpa);
  const [degree, setDegree] = useState(POLICY_DEFAULT.degree);
  const [maxYear, setMaxYear] = useState(POLICY_DEFAULT.maxYear);
  const [policyHash, setPolicyHash] = useState("");
  const [storedPolicy, setStoredPolicy] = useState<StoredPolicy | null>(() =>
    loadPolicy(),
  );
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState<PramaanFail | null>(null);
  const [status, setStatus] = useState("");
  const [slots, setSlots] = useState<{ meera?: string; kabir?: string; arya?: string }>({});
  const [issued, setIssued] = useState(false);
  const [csvText, setCsvText] = useState(DEMO_CSV);
  const [ledger, setLedger] = useState<Record<string, unknown> | null>(null);
  const [receipts, setReceipts] = useState<
    { txId: string; policyHash: string; persona: string; at: string }[]
  >([]);
  const [castSteps, setCastSteps] = useState<CastStep[]>([]);
  const [publicFacts, setPublicFacts] = useState<string[]>([
    "USAR root unpublished",
  ]);

  const minCgpaBps = Math.round(minCgpa * 100);

  const go = useCallback((s: Screen) => {
    setScreen(s);
    location.hash = s === "home" ? "" : `#${s}`;
  }, []);

  useEffect(() => {
    const onHash = () => setScreen(screenFromLocation());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const refreshPolicy = useCallback(async () => {
    try {
      const hash = await fetchPolicy(minCgpaBps, degree, maxYear);
      setPolicyHash(hash);
      const p: StoredPolicy = {
        minCgpa,
        minCgpaBps,
        degree,
        maxYear,
        policyHash: hash,
      };
      savePolicy(p);
      setStoredPolicy(p);
      try {
        const ledgerJson = await (await fetch(`${API}/v1/ledger`)).json();
        setLedger(ledgerJson);
        setPublicFacts([
          `network ${ledgerJson.network ?? "?"}`,
          `awards ${ledgerJson.awardsIssued ?? ledgerJson.firstFree ?? 0}`,
          `epoch ${ledgerJson.awardEpoch ?? "?"}`,
          `revoked ${ledgerJson.revokedCount ?? 0}`,
          `policy ${String(hash).slice(0, 12)}…`,
        ]);
      } catch {
        setPublicFacts([`policy ${String(hash).slice(0, 12)}…`]);
      }
    } catch {
      setPublicFacts(["API offline — run npm run api"]);
    }
  }, [minCgpa, minCgpaBps, degree, maxYear]);

  useEffect(() => {
    if (screen !== "explorer") return;
    void (async () => {
      try {
        const [l, r] = await Promise.all([
          fetch(`${API}/v1/ledger`).then((x) => x.json()),
          fetch(`${API}/v1/receipts`).then((x) => x.json()),
        ]);
        setLedger(l);
        setReceipts(r.receipts ?? []);
      } catch {
        setLedger(null);
      }
    })();
  }, [screen, busy]);

  useEffect(() => {
    void refreshPolicy();
  }, [refreshPolicy, screen]);

  const boundary = useMemo(
    () => (
      <div className="split">
        <section className="rail private">
          <h2>On this device</h2>
          <p>
            CGPA, papers, roll. The circuit sees them as witnesses. The ledger
            does not.
          </p>
          <span className="chip">witness</span>
          <span className="chip">Meera 7.4</span>
          <span className="chip">Kabir 6.2</span>
        </section>
        <section className="rail public">
          <h2>On the ledger</h2>
          <p>
            Pass/fail is a failed or succeeding proof. Policy hash is a public
            fact.
          </p>
          {publicFacts.map((f) => (
            <span className="chip" key={f}>
              {f}
            </span>
          ))}
        </section>
      </div>
    ),
    [publicFacts],
  );

  const siteHeader = (
    <header className="site-header">
      <div className="site-header-inner">
        <button type="button" className="brand" onClick={() => go("home")}>
          Pramaan
        </button>
        <nav className="site-nav" aria-label="Main">
          {(
            [
              ["issuer", "Awards"],
              ["meera", "My leaf"],
              ["recruiter", "Cutoff"],
              ["fake", "Fake uni"],
              ["explorer", "Explorer"],
              ["demo", "Demo"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={screen === id ? "active" : ""}
              onClick={() => go(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );

  async function importCsv() {
    setBusy(true);
    setFail(null);
    setStatus("NAD-shaped import — hash rows, never store PDF…");
    try {
      const json = await post("/v1/import", { csv: csvText });
      if (!json.ok) throw new Error(json.error || "import failed");
      setIssued(true);
      await refreshPolicy();
      setStatus(`Imported ${json.count} hashed awards. No marksheets on chain.`);
    } catch (e) {
      setFail(classifyPramaan(e instanceof Error ? e.message : "import failed"));
    } finally {
      setBusy(false);
    }
  }

  async function revokeKabir() {
    setBusy(true);
    setFail(null);
    try {
      const json = await post("/v1/revoke", { persona: "kabir" });
      if (!json.ok) throw new Error(json.error || "revoke failed");
      setStatus("Kabir leaf revoked — corrected transcript on registrar side.");
      await refreshPolicy();
    } catch (e) {
      setFail(classifyPramaan(e instanceof Error ? e.message : "revoke failed"));
    } finally {
      setBusy(false);
    }
  }

  function applyTemplate(t: (typeof POLICY_TEMPLATES)[number]) {
    setMinCgpa(t.minCgpa);
    setDegree(t.degree);
    setMaxYear(t.maxYear);
  }

  async function issue() {
    await importCsv();
  }

  async function prove(
    persona: StudentId,
    opts?: { minCgpaBps?: number; silent?: boolean },
  ) {
    const bps = opts?.minCgpaBps ?? minCgpaBps;
    if (!opts?.silent) {
      setBusy(true);
      setFail(null);
      setStatus("Generating proof. Your numbers never left this machine.");
    }
    try {
      const json = await post("/v1/prove", {
        persona,
        minCgpaBps: bps,
        degree,
        maxYear,
      });
      if (!json.ok) {
        if (!opts?.silent) {
          setFail(classifyPramaan(json.error || "failed"));
          setStatus("");
          if (persona === "meera") setSlots((s) => ({ ...s, meera: "fail" }));
          if (persona === "kabir") setSlots((s) => ({ ...s, kabir: "fail" }));
          if (persona === "arya") setSlots((s) => ({ ...s, arya: "fail" }));
        }
        return { ok: false as const, error: json.error as string };
      }
      if (!opts?.silent) {
        setStatus(
          persona === "meera"
            ? COPY.recruiter.meeraPass((bps / 100).toFixed(1))
            : `Met policy ${String(json.policyHash).slice(0, 12)}…`,
        );
        if (persona === "meera") setSlots((s) => ({ ...s, meera: "pass" }));
        if (persona === "kabir") setSlots((s) => ({ ...s, kabir: "pass" }));
        if (persona === "arya") setSlots((s) => ({ ...s, arya: "pass" }));
        await refreshPolicy();
      }
      return { ok: true as const, policyHash: json.policyHash as string };
    } catch (e) {
      if (!opts?.silent) {
        setFail(classifyPramaan(e instanceof Error ? e.message : "failed"));
      }
      return {
        ok: false as const,
        error: e instanceof Error ? e.message : "failed",
      };
    } finally {
      if (!opts?.silent) setBusy(false);
    }
  }

  function updateCast(id: string, patch: Partial<CastStep>) {
    setCastSteps((steps) =>
      steps.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    );
  }

  async function runDemoCast() {
    setBusy(true);
    setFail(null);
    setStatus("");
    setCastSteps([
      { id: "issue", label: "Import CSV cohort (3 students)", state: "running" },
      { id: "m70", label: "Slider 7.0 — Meera passes", state: "pending" },
      { id: "k70", label: "Slider 7.0 — Kabir fails", state: "pending" },
      { id: "m80", label: "Slider 8.0 — Meera fails, Arya passes", state: "pending" },
      { id: "revoke", label: "Revoke Kabir — proof blocked", state: "pending" },
      { id: "fake", label: "Fake university 9.9 fails", state: "pending" },
      { id: "epoch", label: "Rotate awardEpoch → 2027", state: "pending" },
    ]);
    try {
      updateCast("issue", { state: "running" });
      const imp = await post("/v1/import", { csv: csvText });
      if (!imp.ok) throw new Error(imp.error || "import failed");
      setIssued(true);
      updateCast("issue", { state: "ok", detail: `${imp.count} hashed leaves` });
      setMinCgpa(7);
      await refreshPolicy();

      updateCast("m70", { state: "running" });
      const m70 = await prove("meera", { minCgpaBps: 700, silent: true });
      updateCast("m70", {
        state: m70.ok ? "ok" : "fail",
        detail: m70.ok ? "gold chip" : m70.error,
      });

      updateCast("k70", { state: "running" });
      const k70 = await prove("kabir", { minCgpaBps: 700, silent: true });
      updateCast("k70", {
        state: k70.ok ? "fail" : "ok",
        detail: k70.ok ? "unexpected pass" : "below cutoff",
      });

      updateCast("m80", { state: "running" });
      setMinCgpa(8);
      const m80 = await prove("meera", { minCgpaBps: 800, silent: true });
      const a80 = await prove("arya", { minCgpaBps: 800, silent: true });
      updateCast("m80", {
        state: m80.ok ? "fail" : a80.ok ? "ok" : "fail",
        detail: m80.ok ? "unexpected meera pass" : a80.ok ? "arya gold at 8.0" : "both failed",
      });

      updateCast("revoke", { state: "running" });
      await post("/v1/revoke", { persona: "kabir" });
      const kRev = await prove("kabir", { minCgpaBps: 600, silent: true });
      updateCast("revoke", {
        state: kRev.ok ? "fail" : "ok",
        detail: kRev.ok ? "unexpected pass" : "revocation set blocks",
      });

      updateCast("fake", { state: "running" });
      const fk = await prove("fake", { minCgpaBps: 600, silent: true });
      updateCast("fake", {
        state: fk.ok ? "fail" : "ok",
        detail: fk.ok ? "unexpected pass" : "letterhead ≠ root",
      });

      updateCast("epoch", { state: "running" });
      await post("/v1/epoch", { epoch: 2027 });
      const mExp = await prove("meera", { minCgpaBps: 700, silent: true });
      updateCast("epoch", {
        state: mExp.ok ? "fail" : "ok",
        detail: mExp.ok ? "unexpected pass" : "2026 cohort expired",
      });

      setStatus("Cast complete. Try the slider yourself.");
    } catch (e) {
      setFail(classifyPramaan(e instanceof Error ? e.message : "cast failed"));
    } finally {
      setBusy(false);
    }
  }

  const policyBlock = (
    <div className="policy-hash">
      <span className="policy-hash-label">{COPY.recruiter.policyLabel}</span>
      <code className="policy-hash-value">
        {policyHash ? `0x${policyHash.slice(0, 16)}…` : "…"}
      </code>
    </div>
  );

  const sliderBlock = (
    <div className="cutoff-panel">
      <div className="cutoff-readout">
        <span className="cutoff-label">Minimum CGPA</span>
        <span className="cutoff-value">{minCgpa.toFixed(1)}</span>
      </div>
      <input
        type="range"
        className="cutoff-slider"
        min={6}
        max={9}
        step={0.1}
        value={minCgpa}
        onChange={(e) => setMinCgpa(Number(e.target.value))}
        aria-label="Minimum CGPA cutoff"
      />
      <div className="cutoff-ticks">
        <span>6.0</span>
        <span>7.0</span>
        <span>8.0</span>
        <span>9.0</span>
      </div>
      <div className="field">
        <label htmlFor="degree">Degree</label>
        <select
          id="degree"
          value={degree}
          onChange={(e) => setDegree(Number(e.target.value))}
        >
          {DEGREES.map((d) => (
            <option key={d.code} value={d.code}>
              {d.label}
            </option>
          ))}
        </select>
      </div>
      {policyBlock}
    </div>
  );

  if (screen === "home") {
    return (
      <div className="app-root">
        {siteHeader}
        <main className="shell shell-app">
          <p className="chip">{COPY.home.kicker}</p>
          <h1 className="display">{COPY.home.title}</h1>
          <p className="tagline">{COPY.home.tagline}</p>
          <p className="lede">{COPY.home.fileVsFact}</p>
          <div className="doors">
            <button type="button" className="door" onClick={() => go("issuer")}>
              <strong>Awards</strong>
              <small>USAR registrar publishes hashed leaves — not PDFs.</small>
            </button>
            <button type="button" className="door" onClick={() => go("meera")}>
              <strong>My leaf</strong>
              <small>Private CGPA on device. Public rail shows issuer root.</small>
            </button>
            <button
              type="button"
              className="door door-gold"
              onClick={() => go("recruiter")}
            >
              <strong>Cutoff</strong>
              <small>The slider is the product. Same leaf, different question.</small>
            </button>
            <button
              type="button"
              className="door door-danger"
              onClick={() => go("fake")}
            >
              <strong>Fake university</strong>
              <small>Letterhead is not a root.</small>
            </button>
          </div>
          <div className="row" style={{ marginTop: 24 }}>
            <button type="button" className="ghost" onClick={() => go("demo")}>
              One-click demo for judges
            </button>
            <button type="button" className="ghost" onClick={() => go("explorer")}>
              Public explorer
            </button>
          </div>
          <div className="contrast-table panel" style={{ marginTop: 32 }}>
            <h2>File vs fact</h2>
            <table>
              <thead>
                <tr>
                  <th>Job</th>
                  <th>NAD / PDF</th>
                  <th>Pramaan</th>
                </tr>
              </thead>
              <tbody>
                {NAD_CONTRAST.map((row) => (
                  <tr key={row.job}>
                    <td>{row.job}</td>
                    <td>{row.nad}</td>
                    <td>{row.pramaan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {boundary}
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      {siteHeader}
      <main className="shell shell-app">
        <button type="button" className="ghost back" onClick={() => go("home")}>
          ← Doors
        </button>

        {screen === "issuer" && (
          <>
            <div className="page-head">
              <p className="page-kicker">Issuer · USAR Registrar</p>
              <h1>{COPY.issuer.title}</h1>
              <p className="tagline">{COPY.issuer.lead}</p>
            </div>
            <div className="panel">
              <div className="cohort-cards">
                {(["meera", "kabir", "arya"] as const).map((id) => (
                  <div key={id} className="cohort-card">
                    <strong>{STUDENTS[id].name}</strong>
                    <span>
                      {STUDENTS[id].cgpa} {STUDENTS[id].degreeLabel}{" "}
                      {STUDENTS[id].year}
                    </span>
                    <small>{STUDENTS[id].cgpaBps} bps · {STUDENTS[id].blurb}</small>
                  </div>
                ))}
              </div>
              <div className="field">
                <label htmlFor="csv">NAD-shaped CSV (hash only)</label>
                <textarea
                  id="csv"
                  rows={5}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
              </div>
              <div className="row">
                <button type="button" className="primary" disabled={busy} onClick={importCsv}>
                  Import & publish
                </button>
                <button type="button" className="ghost" disabled={busy} onClick={revokeKabir}>
                  Revoke Kabir (correction)
                </button>
              </div>
              {issued && <p className="ok">{COPY.issuer.success}</p>}
            </div>
          </>
        )}

        {screen === "meera" && (
          <>
            <div className="page-head">
              <p className="page-kicker">Student · Meera</p>
              <h1>{COPY.meera.title}</h1>
              <p className="tagline">{COPY.meera.lead}</p>
            </div>
            <div className="leaf-card private-leaf">
              <div className="leaf-secret">
                <span className="leaf-label">CGPA (witness)</span>
                <span className="leaf-value">{STUDENTS.meera.cgpa}</span>
                <span className="leaf-meta">
                  {STUDENTS.meera.degreeLabel} · {STUDENTS.meera.year}
                </span>
              </div>
              <div className="leaf-public">
                <span className="leaf-label">Public rail</span>
                <span className="chip">issued by USAR root</span>
                {publicFacts.slice(-1).map((f) => (
                  <span className="chip muted" key={f}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            {storedPolicy?.policyHash ? (
              <p className="tagline">
                Recruiter policy{" "}
                <code>0x{storedPolicy.policyHash.slice(0, 12)}…</code> · cutoff{" "}
                {storedPolicy.minCgpa.toFixed(1)}
              </p>
            ) : (
              <p className="empty">{COPY.meera.noPolicy}</p>
            )}
            <button
              type="button"
              className="primary"
              disabled={busy || !storedPolicy?.policyHash}
              onClick={() => prove("meera")}
            >
              {COPY.meera.prove}
            </button>
          </>
        )}

        {screen === "recruiter" && (
          <>
            <div className="page-head">
              <p className="page-kicker">Recruiter · Placement cell</p>
              <h1>{COPY.recruiter.title}</h1>
              <p className="tagline">{COPY.recruiter.empty}</p>
              <p className="lede">{COPY.recruiter.lead}</p>
            </div>
            <div className="template-row">
              {POLICY_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="ghost"
                  onClick={() => applyTemplate(t)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {sliderBlock}
            <div className="result-slots">
              {(["meera", "kabir", "arya"] as const).map((id) => (
                <div key={id} className={`result-slot ${slots[id] ?? ""}`}>
                  <strong>
                    {STUDENTS[id].name} {STUDENTS[id].cgpa}
                  </strong>
                  <span>
                    {slots[id] === "pass"
                      ? "Meets policy"
                      : slots[id] === "fail"
                        ? "Below bar"
                        : "—"}
                  </span>
                </div>
              ))}
            </div>
            <div className="row">
              <button type="button" className="primary" disabled={busy} onClick={() => prove("meera")}>
                Prove Meera
              </button>
              <button type="button" className="ghost" disabled={busy} onClick={() => prove("kabir")}>
                Prove Kabir
              </button>
              <button type="button" className="ghost" disabled={busy} onClick={() => prove("arya")}>
                Prove Arya
              </button>
            </div>
          </>
        )}

        {screen === "fake" && (
          <>
            <div className="page-head">
              <p className="page-kicker">Fake issuer</p>
              <h1>{COPY.fake.title}</h1>
              <p className="tagline">{COPY.fake.lead}</p>
            </div>
            <div className="leaf-card fake-leaf">
              <span className="leaf-value">{STUDENTS.fake.cgpa}</span>
              <span className="leaf-meta">CGPA · never inserted into USAR tree</span>
            </div>
            {sliderBlock}
            <button
              type="button"
              className="danger"
              disabled={busy}
              onClick={() => prove("fake")}
            >
              {COPY.fake.cta}
            </button>
          </>
        )}

        {screen === "explorer" && (
          <>
            <div className="page-head">
              <p className="page-kicker">Public rail</p>
              <h1>Explorer</h1>
              <p className="tagline">
                Counts and policy hashes — accountability without harvesting CGPAs.
              </p>
            </div>
            <div className="panel">
              <h2>Ledger</h2>
              {ledger ? (
                <ul className="explorer-list">
                  <li>Contract: <code>{String(ledger.address)}</code></li>
                  <li>Network: {String(ledger.network)}</li>
                  <li>Awards issued: {String(ledger.awardsIssued ?? "?")}</li>
                  <li>Award epoch: {String(ledger.awardEpoch ?? "?")}</li>
                  <li>Revoked: {String(ledger.revokedCount ?? "?")}</li>
                  <li>Issuer id: <code>{String(ledger.issuerId).slice(0, 24)}…</code></li>
                </ul>
              ) : (
                <p className="empty">Start API to load ledger.</p>
              )}
            </div>
            <div className="panel" style={{ marginTop: 16 }}>
              <h2>Recruiter audit log</h2>
              {receipts.length === 0 ? (
                <p className="empty">No successful proofs yet.</p>
              ) : (
                <div className="receipt-list">
                  {receipts.slice(0, 12).map((r) => (
                    <div key={r.txId} className="receipt-row">
                      <strong>0x{r.policyHash.slice(0, 10)}…</strong>
                      <span>{r.at.slice(0, 19)}</span>
                      <small>{r.txId.slice(0, 18)}…</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {screen === "demo" && (
          <>
            <div className="page-head">
              <p className="page-kicker">Judges</p>
              <h1>{COPY.demo.title}</h1>
              <p className="tagline">{COPY.demo.lead}</p>
            </div>
            <div className="panel">
              <button
                type="button"
                className="primary"
                disabled={busy}
                onClick={runDemoCast}
              >
                Run full demo cast
              </button>
              {castSteps.length === 0 && !busy && (
                <p className="empty">
                  Needs API + proof-server on :8790 / :6301. About a minute of
                  proofs.
                </p>
              )}
              <div className="cast-log">
                {castSteps.map((s) => (
                  <div key={s.id} className={`cast-step ${s.state}`}>
                    <strong>{s.label}</strong>
                    <div className="tagline">
                      {s.state === "running"
                        ? "proving…"
                        : s.state === "pending"
                          ? "waiting"
                          : s.detail || s.state}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="row">
              <button type="button" className="ghost" onClick={() => go("recruiter")}>
                Try the slider
              </button>
            </div>
          </>
        )}

        <ProofMeter running={busy} />
        <PramaanFailWell kind={fail} />
        {status && !fail && <p className="ok">{status}</p>}
        {boundary}
      </main>
    </div>
  );
}

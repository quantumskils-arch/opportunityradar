"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@nextui-org/react";
import { motion } from "framer-motion";

type TenderRow = Record<string, unknown>;

const API_URL = "http://187.77.117.32:8000/api/tenders";

function resolveField(row: TenderRow, keys: string[]) {
  for (const key of keys) {
    if (key in row && row[key] != null && String(row[key]).trim() !== "") {
      return String(row[key]);
    }
  }
  return "-";
}

function classNameForCategory(cat: string) {
  if (/job/i.test(cat)) return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
  if (/grant|scholarship|fellowship/i.test(cat)) return "bg-violet-500/10 text-violet-300 border-violet-500/30";
  if (/tender|procurement|contract/i.test(cat)) return "bg-sky-500/10 text-sky-300 border-sky-500/30";
  return "bg-slate-700/10 text-slate-200 border-slate-700/30";
}

export default function JobVaultPreview() {
  const [tenders, setTenders] = useState<TenderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All");

  useEffect(() => {
    let active = true;
    async function fetchTenders() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const rows = Array.isArray(data.tenders) ? data.tenders : [];
        if (active) setTenders(rows);
      } catch (err) {
        if (active) setError("Could not load opportunities from the live API.");
        console.error("Tender fetch error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchTenders();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tenders.filter((row) => {
      const title = resolveField(row, ["title", "tender_title", "name", "headline"]).toLowerCase();
      const org = resolveField(row, ["organisation", "organization", "agency", "company", "issuer"]).toLowerCase();
      const cat = resolveField(row, ["category", "category_name", "type", "cat"]).toLowerCase();
      const country = resolveField(row, ["country", "location", "country_code"]).toLowerCase();
      const matchesQuery = q === "" || title.includes(q) || org.includes(q) || cat.includes(q);
      const matchesCountry = selectedCountry === "All" || country.includes(selectedCountry.toLowerCase());
      return matchesQuery && matchesCountry;
    });
  }, [query, selectedCountry, tenders]);

  const total = tenders.length;
  const countries = useMemo(() => {
    const set = new Set<string>();
    tenders.forEach((row) => {
      const country = resolveField(row, ["country", "location", "country_code"]);
      if (country && country !== "-") set.add(country);
    });
    return ["All", ...Array.from(set).slice(0, 6)];
  }, [tenders]);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    tenders.forEach((row) => {
      const cat = resolveField(row, ["category", "category_name", "type", "cat"]); 
      if (cat === "-") return;
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [tenders]);

  const subscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    window.setTimeout(() => setModalOpen(false), 2000);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen">
      <div className="bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),_transparent_40%),radial-gradient(circle_at_bottom_left,_rgba(56,189,248,0.12),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#08111f_100%)]">
        <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-slate-950/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                JV
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-emerald-400">Job Vault</p>
                <p className="text-lg font-semibold">OpportunityRadar Preview</p>
              </div>
            </a>
            <div className="flex flex-wrap items-center gap-3">
              <Button color="primary" onPress={() => setModalOpen(true)}>
                Get Resources
              </Button>
              <Button color="secondary" as="a" href="/frontend">
                Current Dashboard
              </Button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6 lg:max-w-2xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Live East Africa market intelligence
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
                The next-generation jobs & grants UI for OpportunityRadar.
              </h1>
              <p className="text-slate-300 text-lg leading-8">
                A polished, conversion-focused preview experience for tenders, jobs and grants across East Africa. Fast filtering, high-trust pricing, and a subscription CTA built to convert.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" color="primary" onPress={() => setModalOpen(true)}>
                  Start free trial
                </Button>
                <Button size="lg" color="secondary" variant="bordered" as="a" href="/frontend">
                  View current app
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live sources</p>
                  <p className="mt-3 text-3xl font-semibold text-emerald-400">{total}</p>
                  <p className="mt-2 text-sm text-slate-400">Filtered opportunities in real-time.</p>
                </div>
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Preview ideas</p>
                  <p className="mt-3 text-3xl font-semibold text-cyan-400">UI + Conversion</p>
                  <p className="mt-2 text-sm text-slate-400">Designed for paid leads and subscriptions.</p>
                </div>
                <div className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Built on</p>
                  <p className="mt-3 text-3xl font-semibold text-violet-300">Next.js</p>
                  <p className="mt-2 text-sm text-slate-400">No separate app required.</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Preview widget</p>
                  <h2 className="text-2xl font-semibold text-white">Opportunity Vault</h2>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-300">Live</span>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl bg-slate-950/85 border border-slate-800 p-5">
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Search</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search jobs, tenders, grants"
                      className="min-w-0 flex-1 rounded-2xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-sm text-slate-100 outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <Button color="primary" onPress={() => setQuery("")}>Clear</Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {countries.map((country) => (
                    <button
                      key={country}
                      onClick={() => setSelectedCountry(country)}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${selectedCountry === country ? "border-emerald-400 bg-emerald-500/10 text-emerald-200" : "border-slate-700 bg-slate-900/80 text-slate-300"}`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-20">
        <section className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-8 shadow-2xl shadow-black/30">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Featured Insight</p>
                  <h2 className="mt-3 text-3xl font-bold text-white">Fast, clean browsing for paid opportunity leads</h2>
                </div>
                <div className="rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300 border border-slate-800">{filtered.length} results</div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {categories.map(([name, count]) => (
                  <div key={name} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
                    <p className="text-sm text-slate-400">{name}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-black/30">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Live Opportunities</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Recent jobs, tenders & grants</h2>
                </div>
                <span className="rounded-full border border-slate-700/70 bg-slate-900/90 px-4 py-2 text-sm text-slate-300">Most recent first</span>
              </div>

              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 text-center text-slate-400">Loading live opportunities...</div>
                ) : error ? (
                  <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center text-red-200">{error}</div>
                ) : filtered.length === 0 ? (
                  <div className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-8 text-center text-slate-400">No opportunities match this search.</div>
                ) : (
                  filtered.slice(0, 12).map((row, index) => {
                    const title = resolveField(row, ["title", "tender_title", "name", "headline"]);
                    const organisation = resolveField(row, ["organisation", "organization", "agency", "company", "issuer"]);
                    const deadline = resolveField(row, ["deadline", "due_date", "close_date", "submission_deadline", "expiry_date"]);
                    const source = resolveField(row, ["source", "url", "link", "source_url", "reference"]);
                    const country = resolveField(row, ["country", "location", "country_code"]);
                    const cat = resolveField(row, ["category", "category_name", "type", "cat"]);
                    const sourceHref = source.startsWith("http") ? source : `https://${source}`;

                    return (
                      <motion.article key={index} whileHover={{ y: -4 }} className="rounded-3xl border border-slate-800/80 bg-slate-900/90 p-6 transition">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${classNameForCategory(cat)}`}>{cat}</span>
                              <span className="rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">{country}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-white">{title}</h3>
                            <p className="text-sm text-slate-400">{organisation}</p>
                          </div>
                          <div className="flex flex-col items-start gap-3 sm:items-end">
                            <span className="rounded-3xl bg-slate-900/80 px-4 py-2 text-sm text-slate-300 border border-slate-800/80">Deadline: {deadline}</span>
                            <a
                              href={sourceHref}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex rounded-3xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
                            >
                              View source
                            </a>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 shadow-2xl shadow-black/30">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Conversion engine</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Monetization-ready layout</h2>
              <p className="mt-4 text-slate-400 leading-relaxed">This preview demonstrates how OpportunityRadar can position subscriptions, pricing, and lead capture directly inside the product experience.</p>
              <div className="mt-8 space-y-4">
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Save items</p>
                  <p className="mt-2 text-sm text-slate-300">Users can save the best tenders, jobs and grants while browsing, then unlock full details with subscription access.</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Lead capture</p>
                  <p className="mt-2 text-sm text-slate-300">A modern modal signup flow collects email and name for follow-up daily alerts that convert better.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-emerald-500/10 via-slate-950/70 to-slate-900/90 p-6 shadow-2xl shadow-black/30">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Pricing concept</p>
              <div className="mt-5 space-y-4">
                <div className="rounded-3xl border border-slate-800/80 bg-slate-950/90 p-5">
                  <p className="text-sm text-slate-400">Starter</p>
                  <p className="mt-2 text-3xl font-bold text-white">$4/mo</p>
                  <p className="mt-2 text-sm text-slate-400">Essential job-only alerts for early adopters.</p>
                </div>
                <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5">
                  <p className="text-sm text-emerald-200">Premium</p>
                  <p className="mt-2 text-3xl font-bold text-white">$20/mo</p>
                  <p className="mt-2 text-sm text-slate-200">Full tenders, grants, jobs, and daily WhatsApp or email digest.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </main>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] border border-slate-800/90 bg-slate-950/95 p-8 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Start your trial</p>
                <h2 className="mt-3 text-3xl font-semibold text-white">Join OpportunityVault</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 transition hover:text-white">✕</button>
            </div>
            <p className="mt-4 text-slate-300">Enter your details and we’ll reserve a free preview of the conversion-first dashboard experience.</p>
            <form onSubmit={subscribe} className="mt-8 grid gap-4 sm:grid-cols-2">
              <input required type="text" placeholder="Full name" className="rounded-3xl border border-slate-800/90 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500/80" />
              <input required type="email" placeholder="Email address" className="rounded-3xl border border-slate-800/90 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500/80" />
              <textarea placeholder="What are you looking for?" className="sm:col-span-2 rounded-3xl border border-slate-800/90 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500/80 min-h-[120px]" />
              <button type="submit" className="sm:col-span-2 rounded-3xl bg-emerald-500 px-6 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-950 transition hover:bg-emerald-400">
                {submitted ? "Thanks, we’ll follow up soon" : "Reserve my free preview"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

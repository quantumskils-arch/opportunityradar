"use client";

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@nextui-org/react';
import { motion } from 'framer-motion';

type TenderRow = Record<string, unknown>;
const API_URL = 'http://187.77.117.32:8000/api/tenders';

function resolveField(row: TenderRow, keys: string[]) {
  for (const key of keys) {
    if (key in row && row[key] != null && String(row[key]).trim() !== '') {
      return String(row[key]);
    }
  }
  return '-';
}

export default function Dashboard() {
  const [tenders, setTenders] = useState<TenderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchTenders() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(API_URL, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const rows = Array.isArray(data.tenders) ? data.tenders : [];
        if (active) {
          setTenders(rows);
        }
      } catch (err) {
        if (active) {
          setError('Could not load tenders from the live API.');
          console.error('Tender fetch error:', err);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchTenders();
    return () => {
      active = false;
    };
  }, []);

  const totalTenders = tenders.length;
  const visibleTenders = useMemo(() => tenders.slice(0, 50), [tenders]);

  return (
    <div className="dark:bg-gray-950 min-h-screen text-gray-100">
      <header className="border-b border-gray-800 bg-gray-900/80 backdrop-blur sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-emerald-500">
              OpportunityRadar
            </motion.h1>
            <p className="mt-2 text-sm text-gray-400 max-w-2xl">
              Live tenders from the production PostgreSQL API. Fresh data, beautifully formatted for high-speed browsing.
            </p>
                      {/* LISTMONK SIGNUP OVERRIDE */}
          <div className="bg-gray-800/40 border border-gray-700/50 p-5 rounded-xl max-w-xl my-4 text-left shadow-lg backdrop-blur-sm">
            <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Get Daily Email Alerts at 6:00 AM EAT</h3>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const target = e.target as HTMLFormElement;
                const name = (target.elements.namedItem('subName') as HTMLInputElement).value;
                const email = (target.elements.namedItem('subEmail') as HTMLInputElement).value;
                try {
                  const res = await fetch('http://187.77.117', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, name, list_uuids: ["YOUR_LISTMONK_LIST_UUID_HERE"] })
                  });
                  if (res.ok) alert("Welcome! Check your inbox tomorrow morning for fresh opportunities.");
                } catch (err) {
                  alert("Network lag. Please try again shortly.");
                }
              }} 
              className="flex flex-col sm:flex-row gap-2"
            >
              <input 
                name="subName"
                type="text" 
                placeholder="Full Name" 
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder-gray-600 w-full"
                required
              />
              <input 
                name="subEmail"
                type="email" 
                placeholder="Corporate Email" 
                className="bg-gray-950 border border-gray-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder-gray-600 w-full"
                required
              />
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 font-bold text-gray-950 px-4 py-2 rounded-lg transition text-xs whitespace-nowrap shadow-md">
                Join Radar Daily
              </button>
            </form>
          </div>

          </div>
          <div className="flex gap-3">
            <Button color="primary" variant="shadow" onPress={() => window.location.reload()}>
              Refresh
            </Button>
            <Button color="success" variant="ghost" as="a" href={API_URL}>
              API Source
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6 mb-8">
          <section className="space-y-6">
            <div className="bg-gray-900 rounded-3xl border border-gray-800 p-8 shadow-xl shadow-black/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Live data</p>
                  <h2 className="mt-3 text-3xl font-bold text-white">Latest Tenders</h2>
                </div>
                <div className="rounded-3xl bg-slate-950/80 px-5 py-4 border border-slate-800">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Available</p>
                  <p className="mt-2 text-3xl font-semibold text-emerald-400">{totalTenders}</p>
                </div>
              </div>
              <p className="mt-5 text-gray-400 leading-relaxed">
                The table below pulls actual tender titles, organisations, deadlines, and source links directly from your live API.
              </p>
            </div>

            <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 shadow-xl shadow-black/20 overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-white">Tender table</h3>
                  <p className="text-sm text-gray-400">High-speed, responsive tender browsing.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">Live API</span>
                  <span className="rounded-full bg-slate-800 px-4 py-2 text-sm text-slate-300">Port 8000</span>
                </div>
              </div>

              {loading ? (
                <div className="rounded-3xl bg-slate-950 p-10 text-center text-slate-400">Loading tenders...</div>
              ) : error ? (
                <div className="rounded-3xl bg-rose-950 p-10 text-center text-rose-300">{error}</div>
              ) : visibleTenders.length === 0 ? (
                <div className="rounded-3xl bg-slate-950 p-10 text-center text-slate-400">No tender records available.</div>
              ) : (
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-4 pr-6">Title</th>
                        <th className="py-4 pr-6">Organisation</th>
                        <th className="py-4 pr-6">Deadline</th>
                        <th className="py-4 pr-6">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleTenders.map((row, index) => {
                        const title = resolveField(row, ['title', 'tender_title', 'name', 'headline']);
                        const organisation = resolveField(row, ['organisation', 'organization', 'agency', 'company', 'issuer']);
                        const deadline = resolveField(row, ['deadline', 'due_date', 'close_date', 'submission_deadline', 'expiry_date']);
                        const source = resolveField(row, ['source', 'url', 'link', 'source_url', 'reference']);
                        const sourceHref = source.startsWith('http') ? source : `https://${source}`;
                        const safeSource = source === '-' ? '-' : source;

                        return (
                          <tr key={index} className="border-b border-slate-800 transition hover:bg-slate-950/70">
                            <td className="py-4 pr-6 align-top text-gray-200 break-words max-w-[280px]">{title}</td>
                            <td className="py-4 pr-6 align-top text-slate-300">{organisation}</td>
                            <td className="py-4 pr-6 align-top text-slate-300">{deadline}</td>
                            <td className="py-4 pr-6 align-top text-slate-300">
                              {safeSource === '-' ? (
                                '-'
                              ) : (
                                <a
                                  href={sourceHref}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-400 hover:text-emerald-300 transition"
                                >
                                  View
                                </a>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-600">Showing up to 50 most recent tenders</p>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="bg-gray-900 rounded-3xl border border-gray-800 p-6 shadow-xl shadow-black/20">
              <h3 className="text-xl font-semibold text-white mb-3">Live API details</h3>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><strong className="text-slate-200">Endpoint:</strong> {API_URL}</li>
                <li><strong className="text-slate-200">Source:</strong> Real PostgreSQL tenders table</li>
                <li><strong className="text-slate-200">Host:</strong> 187.77.117.32</li>
                <li><strong className="text-slate-200">Port:</strong> 8000</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-emerald-600/10 to-slate-900 rounded-3xl border border-slate-800 p-6">
              <h3 className="text-xl font-semibold text-emerald-300 mb-3">High-speed scrolling</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                This layout is optimized for quick rendering and smooth table browsing across desktop and mobile.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

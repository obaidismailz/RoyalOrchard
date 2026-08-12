import React from 'react';
import { useAdmin } from './AdminContext';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { Trophy, X, Printer } from 'lucide-react';
import { getOverUnder } from './types';
import { handlePrintScorecard } from './utils/scorecardPrinter';

export const ScorecardModal: React.FC = () => {
  const {
    scorecardBooking,
    setScorecardBooking,
    scorecardData,
    setScorecardData,
    scorecardActiveTab,
    setScorecardActiveTab,
    handleSaveScorecard,
    courses
  } = useAdmin();

  if (!scorecardBooking || !scorecardData) return null;

  const numHoles = scorecardData.par.length;

  const getScoreClass = (score: number, par: number) => {
    if (!score) return "bg-[#142d1f]/80 border border-white/10 text-white/40 focus:bg-white/10 focus:border-[#c4864b]";
    const diff = score - par;
    if (diff <= -2) return "bg-white text-black font-bold border-white";
    if (diff === -1) return "bg-[#1e40af] border border-[#3b82f6]/40 text-white font-bold";
    if (diff === 0) return "bg-[#10b981] border border-[#34d399]/40 text-white font-bold";
    if (diff === 1) return "bg-[#f97316] border border-[#fb923c]/40 text-white font-bold";
    return "bg-[#7f1d1d] border border-[#ef4444]/40 text-white font-bold";
  };

  const onPrintScorecard = (tabToPrint?: 'scorecard' | 'result' | 'analysis' | 'all') => {
    handlePrintScorecard(scorecardBooking, scorecardData, scorecardActiveTab, tabToPrint);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-md"
          onClick={() => { setScorecardBooking(null); setScorecardData(null); }}
        />

        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{
            scale: 1, y: 0, opacity: 1,
            transition: { type: "spring", stiffness: 300, damping: 30 }
          }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative z-10 w-full max-w-5xl bg-[#0f281e] rounded-[2.5rem] shadow-[0_0_100px_rgba(196,134,75,0.3)] border border-white/10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Decorative Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#c4864b] to-transparent opacity-50" />

          {/* Modal Header */}
          <div className="p-8 pb-4 relative">
            <button
              onClick={() => { setScorecardBooking(null); setScorecardData(null); }}
              className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white flex items-center justify-center transition-all border border-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c4864b]/10 border border-[#c4864b]/20 mb-4">
              <Trophy className="w-3.5 h-3.5 text-[#c4864b]" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#dec099]">Project Milestone Tracking • ID #{scorecardBooking.id}</span>
            </div>

            <h2 className="font-serif text-4xl text-white mb-2 leading-tight">
              {scorecardBooking.courseType}
            </h2>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
              <div className="text-[#dec099]/60 text-sm font-medium tracking-wide">
                Date: {format(parseISO(scorecardBooking.date), 'MMMM dd, yyyy')} | Scheduled Slot: {scorecardBooking.time}
              </div>
              {/* Score Legends */}
              <div className="flex flex-wrap gap-4 text-xs select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-white text-black font-bold flex items-center justify-center text-[10px]">3</span>
                  <span className="text-white/60">Ahead (-2+)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-[#1e40af] text-white font-bold flex items-center justify-center text-[10px]">3</span>
                  <span className="text-white/60">Slightly Ahead (-1)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-[#10b981] text-white font-bold flex items-center justify-center text-[10px]">4</span>
                  <span className="text-white/60">On Track (E)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-[#f97316] text-white font-bold flex items-center justify-center text-[10px]">5</span>
                  <span className="text-white/60">Minor Delay (+1)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded bg-[#7f1d1d] text-white font-bold flex items-center justify-center text-[10px]">6</span>
                  <span className="text-white/60">Major Delay (+2+)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-8 pt-4 space-y-6 overflow-y-auto custom-scrollbar flex-1">
            {/* Tabs Selection Bar */}
            <div className="flex gap-2 border-b border-white/10 pb-4">
              {(['scorecard', 'result', 'analysis'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setScorecardActiveTab(tab)}
                  className={`px-6 py-2.5 uppercase tracking-[0.2em] text-[10px] font-black transition-all rounded-full border ${
                    scorecardActiveTab === tab
                      ? 'bg-[#c4864b] border-[#c4864b] text-[#0f281e]'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab === 'scorecard' ? 'Progress Checklist' : tab === 'result' ? 'Crew Performance' : 'Phase Analysis'}
                </button>
              ))}
            </div>

            {scorecardActiveTab === 'scorecard' && (
              <div className="overflow-x-auto w-full border border-white/10 rounded-2xl custom-scrollbar bg-[#142d1f]">
                <table className="min-w-full divide-y divide-white/10 text-center table-fixed text-xs text-white">
                  <thead className="bg-white text-[#1a3d28]">
                    <tr>
                      <th className="w-12 px-2 py-3 font-black uppercase tracking-wider pl-4 text-center">#</th>
                      <th className="w-40 px-4 py-3 text-left font-black uppercase tracking-wider">Phase</th>
                      {scorecardData.holeLabels.map((lbl: string, idx: number) => (
                        <th key={idx} className="w-14 px-1 py-3 font-bold">
                          <div className="flex flex-col items-center">
                            <span className="text-[9px] text-[#1a3d28]/60 font-bold block mb-1">P</span>
                            <input
                              type="text"
                              value={lbl}
                              onChange={(e) => {
                                  const val = e.target.value;
                                  setScorecardData((prev: any) => {
                                    if (!prev) return prev;
                                    const newLabels = [...prev.holeLabels];
                                    newLabels[idx] = val;
                                    return { ...prev, holeLabels: newLabels };
                                  });
                                }}
                              className="w-10 h-8 bg-transparent border border-[#c9a84c] rounded text-center text-[#1a3d28] focus:outline-none focus:border-[#1a3d28] text-[11px] font-bold"
                            />
                          </div>
                        </th>
                      ))}
                      <th className="w-16 px-2 py-3 font-black uppercase tracking-wider">Sub 1</th>
                      {scorecardData.par.length === 18 && (
                        <th className="w-16 px-2 py-3 font-black uppercase tracking-wider">Sub 2</th>
                      )}
                      <th className="w-16 px-2 py-3 font-black uppercase tracking-wider">Offset</th>
                      <th className="w-16 px-2 py-3 font-black uppercase tracking-wider">Gross Hrs</th>
                      <th className="w-16 px-2 py-3 font-black uppercase tracking-wider">Net Var</th>
                      <th className="w-20 px-2 py-3 font-black uppercase tracking-wider pr-4">+/- Est</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* Par Row */}
                    <tr className="bg-[#1a3d28] font-bold text-white border-b border-white/10">
                      <td className="px-2 py-3 text-left text-emerald-400 font-bold uppercase pl-4">-</td>
                      <td className="px-4 py-3 text-left text-emerald-400 font-bold uppercase">EST</td>
                      {scorecardData.par.map((p: number, idx: number) => (
                        <td key={idx} className="px-1 py-2">
                          <input
                            type="number"
                            value={p}
                            onChange={(e) => {
                              const val = Math.max(1, Number(e.target.value));
                              setScorecardData((prev: any) => {
                                if (!prev) return prev;
                                const newPar = [...prev.par];
                                newPar[idx] = val;
                                return { ...prev, par: newPar };
                              });
                            }}
                            className="w-10 h-8 bg-transparent border-none rounded text-center text-emerald-400 focus:outline-none focus:bg-white/5 font-bold text-sm"
                          />
                        </td>
                      ))}
                      <td className="px-2 py-2 text-emerald-400 text-sm font-bold">{scorecardData.par.slice(0, 9).reduce((a: number, b: number) => a + b, 0)}</td>
                      {scorecardData.par.length === 18 && (
                        <td className="px-2 py-2 text-emerald-400 text-sm font-bold">{scorecardData.par.slice(9, 18).reduce((a: number, b: number) => a + b, 0)}</td>
                      )}
                      <td className="px-2 py-2 text-white/40"></td>
                      <td className="px-2 py-2 text-emerald-400 text-sm font-bold">{scorecardData.par.reduce((a: number, b: number) => a + b, 0)}</td>
                      <td className="px-2 py-2 text-white/40"></td>
                      <td className="px-2 py-2 text-white/40 pr-4"></td>
                    </tr>

                    {/* Player Rows by Flight */}
                    {scorecardData.flights.map((flightPlayers: string[], fIdx: number) => (
                      <React.Fragment key={fIdx}>
                        <tr className="bg-[#c4864b]/20 font-bold text-[#dec099] border-t border-b border-white/10 text-xs">
                          <td colSpan={scorecardData.par.length + (scorecardData.par.length === 18 ? 8 : 7)} className="text-left px-4 py-2 uppercase tracking-widest font-black">
                            Crew Group {fIdx + 1}
                          </td>
                        </tr>
                        {flightPlayers.map((name: string, pIdx: number) => {
                          const playerScores = scorecardData.scores[name] || Array(scorecardData.par.length).fill(0);
                          const hcp = scorecardData.handicaps[name] !== undefined ? scorecardData.handicaps[name] : 18;
                          const outSum = playerScores.slice(0, 9).reduce((a: number, b: number) => a + b, 0);
                          const inSum = scorecardData.par.length === 18 ? playerScores.slice(9, 18).reduce((a: number, b: number) => a + b, 0) : 0;
                          const totalSum = playerScores.reduce((a: number, b: number) => a + b, 0);
                          const hasScores = playerScores.some((s: number) => s > 0);

                          const appliedHcp = hcp;
                          const netSum = hasScores ? (totalSum - appliedHcp) : 0;
                          const overUnder = getOverUnder(playerScores, scorecardData.par);

                          return (
                            <tr key={name} className="hover:bg-white/[0.02] border-b border-white/5 text-white">
                              <td className="px-2 py-3 text-center font-sans text-xs text-white/30 font-bold pl-4">
                                {pIdx + 1}
                              </td>
                              <td className="px-4 py-3 text-left font-serif text-sm text-white/90 font-medium whitespace-nowrap">
                                <input
                                  type="text"
                                  defaultValue={name}
                                  onBlur={(e) => {
                                    const newName = e.target.value.trim();
                                    if (!newName || newName === name) return;
                                    setScorecardData((prev: any) => {
                                      if (!prev) return prev;
                                      const newScores = { ...prev.scores };
                                      newScores[newName] = newScores[name];
                                      delete newScores[name];

                                      const newHandicaps = { ...prev.handicaps };
                                      newHandicaps[newName] = newHandicaps[name];
                                      delete newHandicaps[name];

                                      const newFlights = prev.flights.map((f: any) =>
                                        f.map((p: any) => p === name ? newName : p)
                                      );

                                      return {
                                        ...prev,
                                        scores: newScores,
                                        handicaps: newHandicaps,
                                        flights: newFlights
                                      };
                                    });
                                  }}
                                  className="bg-transparent border-none rounded px-1 py-1 text-xs text-white focus:outline-none focus:bg-white/5 w-32 font-sans font-bold"
                                />
                              </td>
                              {playerScores.map((score: number, idx: number) => {
                                const par = scorecardData.par[idx];
                                return (
                                  <td key={idx} className="px-1 py-2">
                                    <input
                                      type="number"
                                      min="0"
                                      value={score || ''}
                                      onChange={(e) => {
                                        const val = Math.max(0, Number(e.target.value));
                                        setScorecardData((prev: any) => {
                                          if (!prev) return prev;
                                          const newScores = { ...prev.scores };
                                          newScores[name] = [...newScores[name]];
                                          newScores[name][idx] = val;
                                          return { ...prev, scores: newScores };
                                        });
                                      }}
                                      placeholder=""
                                      className={`w-10 h-10 rounded text-center focus:outline-none transition-all no-spinner ${getScoreClass(score, par)}`}
                                    />
                                  </td>
                                );
                              })}
                              <td className="px-2 py-2 font-bold text-[#dec099] text-base">{hasScores ? outSum : ''}</td>
                              {scorecardData.par.length === 18 && (
                                <td className="px-2 py-2 font-bold text-[#dec099] text-base">{hasScores ? inSum : ''}</td>
                              )}
                              <td className="px-2 py-2">
                                <input
                                  type="number"
                                  min="0"
                                  value={hcp}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value));
                                    setScorecardData((prev: any) => {
                                      if (!prev) return prev;
                                      const newHandicaps = { ...prev.handicaps };
                                      newHandicaps[name] = val;
                                      return { ...prev, handicaps: newHandicaps };
                                    });
                                  }}
                                  className="w-12 h-8 bg-transparent border-none rounded text-center text-white/50 focus:outline-none focus:bg-white/5 font-bold text-xs"
                                />
                              </td>
                              <td className="px-2 py-2 font-bold text-[#dec099] text-base">{hasScores ? totalSum : ''}</td>
                              <td className="px-2 py-2 font-bold text-white text-base">{hasScores ? netSum : ''}</td>
                              <td className={`px-2 py-2 font-bold text-sm pr-4 ${overUnder.startsWith('-') ? 'text-emerald-400' : overUnder.startsWith('+') ? 'text-red-400' : 'text-white/60'}`}>
                                {overUnder}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {scorecardActiveTab === 'result' && (() => {
              const playerNames = scorecardData.flights && scorecardData.flights.length > 0
                ? scorecardData.flights.flat()
                : Object.keys(scorecardData.scores);

              const sortedPlayers = playerNames
                .map((name: string) => {
                  const scores = scorecardData.scores[name] || [];
                  const handicap = scorecardData.handicaps[name] !== undefined ? scorecardData.handicaps[name] : 18;
                  const gross = scores.reduce((a: number, b: number) => a + b, 0);
                  const hasScores = scores.some((s: number) => s > 0);
                  const net = hasScores ? (gross - handicap) : 999;
                  const overUnderStr = getOverUnder(scores, scorecardData.par);
                  
                  let flightIndex = -1;
                  if (scorecardData.flights) {
                    flightIndex = scorecardData.flights.findIndex((f: any) => f.includes(name));
                  }
                  const flightName = flightIndex !== -1 ? `Crew Group ${flightIndex + 1}` : '';

                  return { name, handicap, gross, net, hasScores, overUnderStr, flightName };
                })
                .filter((p: any) => p.hasScores)
                .sort((a: any, b: any) => {
                  if (a.net !== b.net) return a.net - b.net;
                  return a.gross - b.gross;
                });

              const averageNet = sortedPlayers.length > 0
                ? (sortedPlayers.reduce((sum: number, p: any) => sum + p.net, 0) / sortedPlayers.length).toFixed(1)
                : '-';
              const bestNetPlayer = sortedPlayers.length > 0 ? sortedPlayers[0] : null;
              const bestGrossPlayer = sortedPlayers.length > 0 ? [...sortedPlayers].sort((a: any, b: any) => a.gross - b.gross)[0] : null;

              let mostBirdiesPlayer = null;
              let bestCount = 0;
              let bestName = '-';
              playerNames.forEach((name: string) => {
                const scores = scorecardData.scores[name] || [];
                let count = 0;
                scores.forEach((s: number, idx: number) => {
                  const par = scorecardData.par[idx];
                  if (s > 0 && s < par) count++;
                });
                if (count > bestCount) {
                  bestCount = count;
                  bestName = name;
                }
              });
              if (bestCount > 0) mostBirdiesPlayer = { name: bestName, count: bestCount };

              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
                      <span className="text-[10px] uppercase tracking-widest text-[#dec099]/40 font-bold block mb-1">Best Net Variance</span>
                      <span className="text-3xl font-serif text-white block font-bold">{bestNetPlayer ? bestNetPlayer.net : '-'}</span>
                      <span className="text-[10px] text-[#dec099]/60 font-bold uppercase tracking-wider block mt-1">{bestNetPlayer ? bestNetPlayer.name : 'No Data'}</span>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
                      <span className="text-[10px] uppercase tracking-widest text-[#dec099]/40 font-bold block mb-1">Total Actual Hours</span>
                      <span className="text-3xl font-serif text-white block font-bold">{bestGrossPlayer ? bestGrossPlayer.gross : '-'}</span>
                      <span className="text-[10px] text-[#dec099]/60 font-bold uppercase tracking-wider block mt-1">{bestGrossPlayer ? bestGrossPlayer.name : 'No Data'}</span>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
                      <span className="text-[10px] uppercase tracking-widest text-[#dec099]/40 font-bold block mb-1">Top Milestone Wins</span>
                      <span className="text-3xl font-serif text-white block font-bold">{mostBirdiesPlayer ? mostBirdiesPlayer.count : '-'}</span>
                      <span className="text-[10px] text-[#dec099]/60 font-bold uppercase tracking-wider block mt-1">{mostBirdiesPlayer ? mostBirdiesPlayer.name : 'No Data'}</span>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-center">
                      <span className="text-[10px] uppercase tracking-widest text-[#dec099]/40 font-bold block mb-1">Average Net Variance</span>
                      <span className="text-3xl font-serif text-white block font-bold">{averageNet}</span>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider block mt-1">Crew Average</span>
                    </div>
                  </div>

                  <div className="border border-white/10 rounded-2xl bg-[#142d1f] overflow-hidden">
                    {sortedPlayers.length === 0 ? (
                      <div className="text-center py-12 text-white/40 text-sm">No scoring data entered yet.</div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {sortedPlayers.map((player: any, index: number) => {
                          const rank = index + 1;
                          const rankStr = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`;
                          const rowClass = rank === 1 ? 'bg-gradient-to-r from-[#c4864b]/10 to-transparent border-l-4 border-[#c4864b]' :
                                         rank === 2 ? 'border-l-4 border-slate-400' :
                                         rank === 3 ? 'border-l-4 border-amber-700' : '';
                          return (
                            <div key={player.name} className={`flex items-center justify-between p-4 ${rowClass}`}>
                              <div className="flex items-center gap-4">
                                <div className={`font-serif text-xl font-black ${rank === 1 ? 'text-[#c4864b]' : 'text-white/40'} w-12`}>
                                  {rankStr.toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-white font-bold text-sm">
                                    {player.name}
                                    {player.flightName && (
                                      <span className="ml-2 text-[9px] uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/40">{player.flightName}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-[#c4864b] font-serif text-xl font-bold w-12 text-right">
                                  {player.overUnderStr}
                                </div>
                                <div className="text-[10px] font-bold uppercase tracking-widest border border-white/10 rounded bg-white/5 px-3 py-1 text-white/60">
                                  Hours: {player.gross} | Var: {player.net} (Offset: {player.handicap})
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {scorecardActiveTab === 'analysis' && (() => {
              const playerNames = scorecardData.flights && scorecardData.flights.length > 0
                ? scorecardData.flights.flat()
                : Object.keys(scorecardData.scores);

              let hardestHole: any = null;
              let easiestHole: any = null;
              let maxDiff = -Infinity;
              let minDiff = Infinity;
              let totalAvgScore = 0;
              let hasAnyScores = false;

              const holeStats = scorecardData.par.map((parVal: number, idx: number) => {
                let sum = 0;
                let count = 0;
                playerNames.forEach((name: string) => {
                  const scores = scorecardData.scores[name] || [];
                  const s = scores[idx];
                  if (s > 0) {
                    sum += s;
                    count++;
                  }
                });
                const avg = count > 0 ? sum / count : 0;
                const diff = count > 0 ? avg - parVal : 0;
                const diffStr = count > 0 ? (diff > 0 ? `+${diff.toFixed(1)}` : diff === 0 ? 'E' : `${diff.toFixed(1)}`) : '-';
                const diffClass = count > 0 ? (diff > 0 ? 'text-red-400' : diff === 0 ? 'text-white/60' : 'text-emerald-400') : 'text-white/40';

                if (count > 0) {
                  hasAnyScores = true;
                  totalAvgScore += avg;
                  if (diff > maxDiff) {
                    maxDiff = diff;
                    hardestHole = {
                      holeNum: scorecardData.holeLabels[idx] || String(idx + 1),
                      avg: avg.toFixed(1),
                      par: parVal,
                      diffStr: diff > 0 ? `+${diff.toFixed(1)}` : diff === 0 ? 'E' : `${diff.toFixed(1)}`
                    };
                  }
                  if (diff < minDiff) {
                    minDiff = diff;
                    easiestHole = {
                      holeNum: scorecardData.holeLabels[idx] || String(idx + 1),
                      avg: avg.toFixed(1),
                      par: parVal,
                      diffStr: diff > 0 ? `+${diff.toFixed(1)}` : diff === 0 ? 'E' : `${diff.toFixed(1)}`
                    };
                  }
                }

                return {
                  holeNum: scorecardData.holeLabels[idx] || String(idx + 1),
                  par: parVal,
                  avg: count > 0 ? avg.toFixed(1) : '-',
                  diffStr,
                  diffClass
                };
              });

              const coursePar = scorecardData.par.reduce((a: number, b: number) => a + b, 0);

              return (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Hardest Hole Card */}
                    <div className="bg-white/[0.03] border border-red-500/20 rounded-2xl p-4 text-center">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-bold block mb-1">Most Delayed Phase</span>
                      <span className="text-3xl font-serif text-red-400 block font-bold">
                        {hasAnyScores && hardestHole ? `P${hardestHole.holeNum}` : '-'}
                      </span>
                      <span className="text-[10px] text-white/40 font-serif italic block mt-1">
                        {hasAnyScores && hardestHole 
                          ? `Avg: ${hardestHole.avg}h · Est: ${hardestHole.par}h · Var: ${hardestHole.diffStr}`
                          : 'No scoring data'}
                      </span>
                    </div>

                    {/* Easiest Hole Card */}
                    <div className="bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-4 text-center">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold block mb-1">Most Efficient Phase</span>
                      <span className="text-3xl font-serif text-emerald-400 block font-bold">
                        {hasAnyScores && easiestHole ? `P${easiestHole.holeNum}` : '-'}
                      </span>
                      <span className="text-[10px] text-white/40 font-serif italic block mt-1">
                        {hasAnyScores && easiestHole 
                          ? `Avg: ${easiestHole.avg}h · Est: ${easiestHole.par}h · Var: ${easiestHole.diffStr}`
                          : 'No scoring data'}
                      </span>
                    </div>

                    {/* Field Total Avg Card */}
                    <div className="bg-white/[0.03] border border-[#c4864b]/20 rounded-2xl p-4 text-center">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#dec099]/60 font-bold block mb-1">Overall Avg Hours</span>
                      <span className="text-3xl font-serif text-[#dec099] block font-bold">
                        {hasAnyScores ? totalAvgScore.toFixed(1) : '-'}
                      </span>
                      <span className="text-[10px] text-white/40 font-serif italic block mt-1">
                        {`vs Total Est Hours ${coursePar}`}
                      </span>
                    </div>
                  </div>

                  {/* 9-Hole Cards Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-9 gap-3">
                    {holeStats.map((stat: any, idx: number) => (
                      <div key={idx} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center">
                        <div className="text-xs font-serif text-[#dec099] font-bold">Phase {stat.holeNum}</div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Est {stat.par}</div>
                        <div className="text-sm font-serif text-white font-bold">Avg: {stat.avg}</div>
                        <div className={`text-xs font-serif font-black mt-1 ${stat.diffClass}`}>{stat.diffStr}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Modal Footer */}
          <div className="p-8 pt-4 border-t border-white/10 flex justify-between gap-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onPrintScorecard()}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold transition-all"
              >
                <Printer className="w-4 h-4" /> Print Current
              </button>
              <button
                type="button"
                onClick={() => onPrintScorecard('all')}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold transition-all"
              >
                <Printer className="w-4 h-4" /> Print All (3-in-1 PDF)
              </button>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setScorecardBooking(null); setScorecardData(null); }}
                className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveScorecard}
                className="bg-[#c4864b] hover:bg-[#dec099] text-[#0f281e] px-8 py-3 rounded-full uppercase tracking-widest text-[10px] font-bold transition-all shadow-[0_4px_20px_rgba(196,134,75,0.3)]"
              >
                Save Details
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

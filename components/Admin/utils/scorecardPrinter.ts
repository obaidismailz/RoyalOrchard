import { format, parseISO } from 'date-fns';
import { Booking, getOverUnder } from '../types';

export const handlePrintScorecard = (
  scorecardBooking: Booking,
  scorecardData: any,
  scorecardActiveTab: 'scorecard' | 'result' | 'analysis',
  tabToPrint?: 'scorecard' | 'result' | 'analysis' | 'all'
) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const numHoles = scorecardData.par.length;
  const courseName = scorecardBooking.courseType;
  const dateStr = format(parseISO(scorecardBooking.date), 'MMMM dd, yyyy');
  const timeStr = scorecardBooking.time;
  const activeTab = tabToPrint || scorecardActiveTab;

  const getScorecardHtml = () => {
    let rowsHtml = '';
    const parOut = scorecardData.par.slice(0, 9).reduce((a: number, b: number) => a + b, 0);
    const parIn = numHoles === 18 ? scorecardData.par.slice(9, 18).reduce((a: number, b: number) => a + b, 0) : 0;
    const parTotal = scorecardData.par.reduce((a: number, b: number) => a + b, 0);

    rowsHtml += `
      <tr class="par-row">
        <td></td>
        <td class="font-bold" style="text-align: left; padding-left: 10px;">EST</td>
        ${scorecardData.par.map((p: number) => `<td>${p}</td>`).join('')}
        <td>${parOut}</td>
        ${numHoles === 18 ? `<td>${parIn}</td>` : ''}
        <td></td>
        <td>${parTotal}</td>
        <td></td>
        <td></td>
      </tr>
    `;

    scorecardData.flights.forEach((flightPlayers: string[], fIdx: number) => {
      const totalCols = numHoles + (numHoles === 18 ? 8 : 7);
      rowsHtml += `
        <tr class="flight-header-row">
          <td colspan="${totalCols}" style="text-align: left; padding-left: 10px; background-color: #f5f2ea; font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 1px; color: #1a3d28; font-weight: bold; border-top: 1px solid #c9a84c; border-bottom: 1px solid #c9a84c;">
            CREW UNIT ${fIdx + 1}
          </td>
        </tr>
      `;

      flightPlayers.forEach((name: string, pIdx: number) => {
        const playerScores = scorecardData.scores[name] || Array(numHoles).fill(0);
        const hcp = scorecardData.handicaps[name] !== undefined ? scorecardData.handicaps[name] : 18;
        const hasScores = playerScores.some((s: number) => s > 0);

        const outSum = playerScores.slice(0, 9).reduce((a: number, b: number) => a + b, 0);
        const inVal = numHoles === 18 ? playerScores.slice(9, 18).reduce((a: number, b: number) => a + b, 0) : 0;
        const grossSum = playerScores.reduce((a: number, b: number) => a + b, 0);
        const netSum = hasScores ? (grossSum - hcp) : 0;
        const overUnder = getOverUnder(playerScores, scorecardData.par);

        rowsHtml += `
          <tr>
            <td>${pIdx + 1}</td>
            <td class="name-cell">${name}</td>
            ${playerScores.map((s: number, idx: number) => {
              const par = scorecardData.par[idx];
              const diff = s - par;
              let cls = '';
              if (s > 0) {
                if (diff <= -2) cls = 'eagle';
                else if (diff === -1) cls = 'birdie';
                else if (diff === 0) cls = 'par';
                else if (diff === 1) cls = 'bog1';
                else cls = 'bog2';
              }
              return `<td><span class="si ${cls}">${s > 0 ? s : ''}</span></td>`;
            }).join('')}
            <td>${hasScores ? outSum : ''}</td>
            ${numHoles === 18 ? `<td>${hasScores ? inVal : ''}</td>` : ''}
            <td>${hcp}</td>
            <td>${hasScores ? grossSum : ''}</td>
            <td>${hasScores ? netSum : ''}</td>
            <td class="vc ${overUnder.startsWith('-') ? 'under' : overUnder.startsWith('+') ? 'over' : 'even'}">${overUnder}</td>
          </tr>
        `;
      });
    });

    return `
      <div style="font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 3px; color: #c9a84c; margin-bottom: 10px; text-transform: uppercase;">
        PROJECT PROGRESS CHECKLIST
      </div>
      <div class="legends-container">
        <div class="legend-item"><span class="si-box eagle">-2</span> Ahead</div>
        <div class="legend-item"><span class="si-box birdie">-1</span> Slightly Ahead</div>
        <div class="legend-item"><span class="si-box par">E</span> On Track</div>
        <div class="legend-item"><span class="si-box bog1">+1</span> Minor Delay</div>
        <div class="legend-item"><span class="si-box bog2">+2</span> Major Delay</div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="text-align: left; padding-left: 10px;">PHASE</th>
            ${scorecardData.holeLabels.map((lbl: string) => `<th>${lbl}</th>`).join('')}
            <th>SUB 1</th>
            ${numHoles === 18 ? '<th>SUB 2</th>' : ''}
            <th>OFFSET</th>
            <th>GROSS HRS</th>
            <th>NET VAR</th>
            <th>+/- EST</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    `;
  };

  const getResultHtml = () => {
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
        const flightName = flightIndex !== -1 ? `Crew Unit ${flightIndex + 1}` : '';

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

    let leaderboardHtml = sortedPlayers.map((player: any, index: number) => {
      const rank = index + 1;
      const rankStr = rank === 1 ? '1st' : rank === 2 ? '2nd' : rank === 3 ? '3rd' : `${rank}th`;
      const rowClass = rank === 1 ? 'r1' : rank === 2 ? 'r2' : rank === 3 ? 'r3' : '';
      return `
        <div class="lb-row ${rowClass}">
          <div class="lb-rank">${rankStr.toUpperCase()}</div>
          <div class="lb-name">
            ${player.name}
            ${player.flightName ? `<span class="lb-grp">${player.flightName}</span>` : ''}
          </div>
          <div class="lb-val">${player.overUnderStr}</div>
          <div class="lb-badge">GROSS ${player.gross}h / NET ${player.net}h (OFFSET ${player.handicap}h)</div>
        </div>
      `;
    }).join('');

    if (sortedPlayers.length === 0) {
      leaderboardHtml = `<div style="text-align: center; padding: 40px; color: #888;">No scoring data entered yet.</div>`;
    }

    return `
      <div style="font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 3px; color: #c9a84c; margin-bottom: 10px; text-transform: uppercase;">
        CREW PERFORMANCE SUMMARY
      </div>
      <div class="sum-grid">
        <div class="scard">
          <div class="sl">Best Net Hours</div>
          <div class="sv">${bestNetPlayer ? bestNetPlayer.net : '-'}</div>
          <div class="ss">${bestNetPlayer ? bestNetPlayer.name : 'No Data'}</div>
        </div>
        <div class="scard">
          <div class="sl">Best Gross Hours</div>
          <div class="sv">${bestGrossPlayer ? bestGrossPlayer.gross : '-'}</div>
          <div class="ss">${bestGrossPlayer ? bestGrossPlayer.name : 'No Data'}</div>
        </div>
        <div class="scard">
          <div class="sl">Most Ahead Tasks</div>
          <div class="sv">${mostBirdiesPlayer ? mostBirdiesPlayer.count : '-'}</div>
          <div class="ss">${mostBirdiesPlayer ? mostBirdiesPlayer.name : 'No Data'}</div>
        </div>
        <div class="scard">
          <div class="sl">Average Net Var</div>
          <div class="sv">${averageNet}</div>
          <div class="ss">Overall Average</div>
        </div>
      </div>
      <h3 style="font-family: 'Playfair Display', serif; font-size: 20px; color: #1a3d28; margin-bottom: 15px; font-style: italic;">Crew Performance Standings</h3>
      <div class="lb-container">
        ${leaderboardHtml}
      </div>
    `;
  };

  const getAnalysisHtml = () => {
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
      const diffClass = count > 0 ? (diff > 0 ? 'over' : diff === 0 ? 'even' : 'under') : 'even';

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

    return `
      <div style="font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 3px; color: #c9a84c; margin-bottom: 10px; text-transform: uppercase;">
        PROJECT PHASE ANALYSIS
      </div>
      <div class="sum-grid">
        <div class="hascard hardest">
          <div class="sl">Most Delayed Phase</div>
          <div class="sv">${hasAnyScores && hardestHole ? `P${hardestHole.holeNum}` : '-'}</div>
          <div class="ss">${hasAnyScores && hardestHole ? `Avg ${hardestHole.avg} · Est ${hardestHole.par} · ${hardestHole.diffStr}` : 'No scoring data'}</div>
        </div>
        <div class="hascard easiest">
          <div class="sl">Most Efficient Phase</div>
          <div class="sv">${hasAnyScores && easiestHole ? `P${easiestHole.holeNum}` : '-'}</div>
          <div class="ss">${hasAnyScores && easiestHole ? `Avg ${easiestHole.avg} · Est ${easiestHole.par} · ${easiestHole.diffStr}` : 'No scoring data'}</div>
        </div>
        <div class="hascard total">
          <div class="sl">Overall Stage Average</div>
          <div class="sv">${hasAnyScores ? totalAvgScore.toFixed(1) : '-'}</div>
          <div class="ss">vs Est Hours ${coursePar}</div>
        </div>
      </div>
      <div class="ha-grid">
        ${holeStats.map((stat: any) => `
          <div class="hbox">
            <div class="hn">Phase ${stat.holeNum}</div>
            <div class="hp">Est ${stat.par}</div>
            <div class="ha">Avg ${stat.avg} hrs</div>
            <div class="hd ${stat.diffClass}">${stat.diffStr}</div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const lbStyles = `
    .lb-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      margin-top: 15px;
    }
    .lb-row {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid #eee;
      background: #fff;
    }
    .lb-row:last-child {
      border-bottom: none;
    }
    .lb-row.r1 {
      background: #fdf9ee;
      border-left: 4px solid #c9a84c;
    }
    .lb-row.r2 {
      border-left: 4px solid #c0c0c0;
    }
    .lb-row.r3 {
      border-left: 4px solid #cd7f32;
    }
    .lb-rank {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      color: #888;
      width: 50px;
    }
    .lb-row.r1 .lb-rank {
      color: #c9a84c;
    }
    .lb-name {
      flex: 1;
      font-size: 16px;
      font-weight: bold;
      color: #1a3d28;
    }
    .lb-grp {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      background: #eee;
      padding: 2px 6px;
      border-radius: 3px;
      color: #666;
      margin-left: 10px;
    }
    .lb-val {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 24px;
      color: #c9a84c;
      width: 60px;
      text-align: right;
    }
    .lb-badge {
      font-size: 10px;
      font-weight: bold;
      letter-spacing: 1px;
      background: #f5f2ea;
      color: #1a3d28;
      padding: 6px 12px;
      border-radius: 4px;
      margin-left: 20px;
    }
  `;

  const haStyles = `
    .hascard {
      background: #fff;
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .hascard.hardest { border-top: 4px solid #d32f2f; }
    .hascard.easiest { border-top: 4px solid #388e3c; }
    .hascard.total { border-top: 4px solid #c9a84c; }

    .hascard .sl {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 10px;
      letter-spacing: 2px;
      margin-bottom: 5px;
      text-transform: uppercase;
    }
    .hascard.hardest .sl { color: #e05c5c; }
    .hascard.easiest .sl { color: #2e7d32; }
    .hascard.total .sl { color: #a08030; }

    .hascard .sv {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 36px;
      font-weight: bold;
    }
    .hascard.hardest .sv { color: #b71c1c; }
    .hascard.easiest .sv { color: #2e7d32; }
    .hascard.total .sv { color: #1a3d28; }

    .hascard .ss {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
      font-family: 'Cormorant Garamond', serif;
      font-style: italic;
    }

    .ha-grid {
      display: grid;
      grid-template-columns: repeat(9, 1fr);
      gap: 8px;
      margin-top: 15px;
    }
    .hbox {
      background: #fdfcf7;
      border: 1px solid #c9a84c;
      border-radius: 6px;
      padding: 14px 8px;
      text-align: center;
    }
    .hbox .hn {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 16px;
      color: #a08030;
      font-weight: bold;
    }
    .hbox .hp {
      font-size: 10px;
      color: #888;
      margin-bottom: 6px;
      letter-spacing: 1px;
    }
    .hbox .ha {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 14px;
      color: #1a3d28;
      font-weight: bold;
    }
    .hbox .hd {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 12px;
      margin-top: 4px;
      font-weight: bold;
    }
    .hbox .hd.over { color: #b71c1c; }
    .hbox .hd.under { color: #2e7d32; }
    .hbox .hd.even { color: #888; }
  `;

  let contentHtml = '';
  let extraStyles = '';

  if (activeTab === 'scorecard') {
    contentHtml = getScorecardHtml();
  } else if (activeTab === 'result') {
    contentHtml = getResultHtml();
    extraStyles = lbStyles;
  } else if (activeTab === 'analysis') {
    contentHtml = getAnalysisHtml();
    extraStyles = haStyles;
  } else if (activeTab === 'all') {
    contentHtml = `
      ${getScorecardHtml()}
      <div class="page-break"></div>
      <div style="margin-top: 40px;">
        ${getResultHtml()}
      </div>
      <div class="page-break"></div>
      <div style="margin-top: 40px;">
        ${getAnalysisHtml()}
      </div>
    `;
    extraStyles = lbStyles + haStyles;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${activeTab === 'scorecard' ? 'Progress Checklist' : activeTab === 'result' ? 'Crew Standings' : activeTab === 'analysis' ? 'Phase Analysis' : 'Complete Progress Report'} - ${scorecardBooking.customerName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400&family=Cormorant+Garamond:wght@300;400;600&family=Bebas+Neue&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Cormorant Garamond', serif;
            color: #222;
            background: #fff;
            padding: 20px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #c9a84c;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .title {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-style: italic;
            color: #1a3d28;
          }
          .meta {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 14px;
            letter-spacing: 2px;
            color: #555;
          }
          .legends-container {
            display: flex;
            gap: 20px;
            justify-content: center;
            margin-bottom: 20px;
            font-family: 'Cormorant Garamond', serif;
            font-size: 13px;
          }
          .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .si-box {
            display: inline-block;
            width: 22px;
            height: 22px;
            line-height: 22px;
            text-align: center;
            border-radius: 4px;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 12px;
            font-weight: bold;
          }
          .si-box.eagle { background: #ffffff !important; border: 1px solid #cccccc; color: #000000; }
          .si-box.birdie { background: #1e40af !important; border: 1px solid #1e40af; color: #ffffff; }
          .si-box.par { background: #10b981 !important; border: 1px solid #10b981; color: #ffffff; }
          .si-box.bog1 { background: #f97316 !important; border: 1px solid #f97316; color: #ffffff; }
          .si-box.bog2 { background: #7f1d1d !important; border: 1px solid #7f1d1d; color: #ffffff; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
            font-size: 14px;
          }
          th {
            background-color: #f5f2ea;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 12px;
            letter-spacing: 1px;
          }
          .par-row {
            background-color: #f0ead0;
            font-weight: bold;
          }
          .name-cell {
            text-align: left;
            padding-left: 10px;
            font-weight: bold;
          }
          .si {
            display: inline-block;
            width: 28px;
            height: 24px;
            line-height: 24px;
            border-radius: 4px;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 13px;
          }
          .si.eagle { background: #ffffff !important; border: 1px solid #cccccc; color: #000000; font-weight: bold; }
          .si.birdie { background: #1e40af !important; border: 1px solid #1e40af; color: #ffffff; font-weight: bold; }
          .si.par { background: #10b981 !important; border: 1px solid #10b981; color: #ffffff; font-weight: bold; }
          .si.bog1 { background: #f97316 !important; border: 1px solid #f97316; color: #ffffff; font-weight: bold; }
          .si.bog2 { background: #7f1d1d !important; border: 1px solid #7f1d1d; color: #ffffff; font-weight: bold; }
          .vc.under { color: #2e7d32; font-weight: bold; }
          .vc.over { color: #b71c1c; font-weight: bold; }
          .vc.even { color: #555; }
          @media print {
            .page-break {
              page-break-before: always;
               break-before: page;
            }
          }
          ${extraStyles}
        </style>
      </head>
      <body>
        <div class="header">
          <div style="display: flex; align-items: center; gap: 15px;">
            <img src="/log.png" alt="Logo" style="height: 60px; width: auto;" />
            <div>
              <div class="title">Ponos Home Improvement, LTD</div>
              <div style="font-family: 'Bebas Neue', sans-serif; font-size: 10px; letter-spacing: 3px; color: #c9a84c;">
                ${activeTab === 'scorecard' ? 'PROJECT PROGRESS CHECKLIST' : activeTab === 'result' ? 'CREW PERFORMANCE SUMMARY' : activeTab === 'analysis' ? 'PROJECT PHASE ANALYSIS' : 'COMPLETE PROGRESS REPORT'}
              </div>
            </div>
          </div>
          <div class="meta" style="text-align: right;">
            <div>Project Type: ${courseName}</div>
            <div>Date: ${dateStr} | Scheduled Slot: ${timeStr}</div>
            ${scorecardBooking.isPaid === 1 ? '<div style="color: #2e7d32; font-weight: bold; letter-spacing: 1px; font-size: 11px; margin-top: 3px;">[ PAID ]</div>' : ''}
          </div>
        </div>
        ${contentHtml}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

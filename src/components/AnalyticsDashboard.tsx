"use client";

import React, { useState, useMemo } from "react";
import { BoardState, TaskCard } from "@/types";
import { BarChart2, CheckCircle, Clock, Users, Flame, Info, AlertTriangle } from "lucide-react";

interface AnalyticsDashboardProps {
  state: BoardState;
}

export default function AnalyticsDashboard({ state }: AnalyticsDashboardProps) {
  const [hoveredData, setHoveredData] = useState<{
    chart: string;
    label: string;
    value: string;
    x: number;
    y: number;
  } | null>(null);

  // Helper: check if column is DONE
  const isDoneColumn = (columnId: string): boolean => {
    if (columnId === "col-done") return true;
    const title = state.columns[columnId]?.title || "";
    return title.toUpperCase() === "DONE";
  };

  // Helper: check if column is IN PROGRESS
  const isInProgressColumn = (columnId: string): boolean => {
    if (columnId === "col-progress") return true;
    const title = state.columns[columnId]?.title || "";
    const upper = title.toUpperCase();
    return upper.includes("PROGRESS") || upper.includes("DOING");
  };

  // 1. Gather all active / completed cards
  const cardsList = useMemo(() => {
    return Object.values(state.cards);
  }, [state.cards]);

  const totalCards = cardsList.length;

  const completedCards = useMemo(() => {
    return cardsList.filter((card) => isDoneColumn(card.columnId));
  }, [cardsList, state.columns]);

  const activeCards = totalCards - completedCards.length;

  // Helper: Find when card transitioned to DONE
  const getCompletionTime = (card: TaskCard): number | null => {
    const history = card.statusHistory || [];
    const doneTransitions = history.filter((h) => isDoneColumn(h.columnId));
    if (doneTransitions.length > 0) {
      // Get the latest done transition
      return doneTransitions[doneTransitions.length - 1].timestamp;
    }
    // Fallback if card is currently in done but has no transitions recorded
    if (isDoneColumn(card.columnId)) {
      return card.createdAt;
    }
    return null;
  };

  // Helper: Find when card transitioned to IN PROGRESS
  const getInProgressTime = (card: TaskCard): number | null => {
    const history = card.statusHistory || [];
    const progressTransitions = history.filter((h) => isInProgressColumn(h.columnId));
    if (progressTransitions.length > 0) {
      // Get the first in-progress transition
      return progressTransitions[0].timestamp;
    }
    return null;
  };

  // 2. Metrics: Lead Time and Cycle Time
  const { avgLeadTimeDays, avgCycleTimeDays } = useMemo(() => {
    let totalLeadTime = 0;
    let leadCount = 0;
    let totalCycleTime = 0;
    let cycleCount = 0;

    completedCards.forEach((card) => {
      const completionTime = getCompletionTime(card);
      if (completionTime) {
        // Lead Time: completionTime - createdAt
        const lead = completionTime - card.createdAt;
        if (lead >= 0) {
          totalLeadTime += lead;
          leadCount++;
        }

        // Cycle Time: completionTime - first in progress time
        const ipTime = getInProgressTime(card);
        if (ipTime) {
          const cycle = completionTime - ipTime;
          if (cycle >= 0) {
            totalCycleTime += cycle;
            cycleCount++;
          }
        }
      }
    });

    const msToDays = 1000 * 60 * 60 * 24;
    return {
      avgLeadTimeDays: leadCount > 0 ? (totalLeadTime / leadCount) / msToDays : 0,
      avgCycleTimeDays: cycleCount > 0 ? (totalCycleTime / cycleCount) / msToDays : 0,
    };
  }, [completedCards]);

  // 3. Metrics: Current Weekly Velocity
  // Group completed cards by rolling 7-day intervals (past 4 weeks + current week)
  const velocityData = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const intervals = [
      { label: "W-4", start: now - 35 * oneDay, end: now - 28 * oneDay },
      { label: "W-3", start: now - 28 * oneDay, end: now - 21 * oneDay },
      { label: "W-2", start: now - 21 * oneDay, end: now - 14 * oneDay },
      { label: "W-1", start: now - 14 * oneDay, end: now - 7 * oneDay },
      { label: "CURR", start: now - 7 * oneDay, end: now },
    ];

    return intervals.map((interval) => {
      let points = 0;
      let count = 0;

      completedCards.forEach((card) => {
        const compTime = getCompletionTime(card);
        if (compTime && compTime >= interval.start && compTime < interval.end) {
          points += card.storyPoints || 0;
          count += 1;
        }
      });

      return {
        label: interval.label,
        storyPoints: points,
        cardCount: count,
      };
    });
  }, [completedCards]);

  const currentVelocity = velocityData[velocityData.length - 1].storyPoints;

  // 4. Metrics: Burndown Data (Last 15 days)
  const burndownData = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const days = Array.from({ length: 15 }, (_, i) => {
      const date = new Date(now - (14 - i) * oneDay);
      date.setHours(23, 59, 59, 999);
      return date.getTime();
    });

    // Determine card status at any given timestamp
    const getCardStatusAt = (card: TaskCard, timestamp: number): string | null => {
      if (card.createdAt > timestamp) return null; // Not created yet
      const history = card.statusHistory || [];
      const pastTransitions = history.filter((h) => h.timestamp <= timestamp);
      if (pastTransitions.length > 0) {
        return pastTransitions[pastTransitions.length - 1].columnId;
      }
      return history[0]?.columnId || card.columnId;
    };

    let maxPoints = 0;
    const actualPointsHistory = days.map((timestamp) => {
      let remainingPoints = 0;
      cardsList.forEach((card) => {
        const colId = getCardStatusAt(card, timestamp);
        if (colId !== null && !isDoneColumn(colId)) {
          remainingPoints += card.storyPoints || 0;
        }
      });
      return remainingPoints;
    });

    // Total story points ever created up to now
    cardsList.forEach((c) => {
      maxPoints += c.storyPoints || 0;
    });

    const startPoints = actualPointsHistory[0] || maxPoints;
    const step = startPoints / 14;

    return days.map((timestamp, index) => {
      const ideal = Math.max(0, startPoints - index * step);
      const formattedDate = new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return {
        date: formattedDate,
        actual: actualPointsHistory[index],
        ideal: parseFloat(ideal.toFixed(1)),
      };
    });
  }, [cardsList, state.columns]);

  // 5. Distribution Metrics
  // Column distribution
  const columnDistribution = useMemo(() => {
    const dist: { [key: string]: number } = {};
    state.columnOrder.forEach((colId) => {
      dist[state.columns[colId]?.title || colId] = 0;
    });

    cardsList.forEach((card) => {
      const colTitle = state.columns[card.columnId]?.title || card.columnId;
      dist[colTitle] = (dist[colTitle] || 0) + 1;
    });

    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [cardsList, state.columns, state.columnOrder]);

  // Priority distribution
  const priorityDistribution = useMemo(() => {
    const dist = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    cardsList.forEach((card) => {
      if (card.priority in dist) {
        dist[card.priority as keyof typeof dist]++;
      }
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [cardsList]);

  // Assignee distribution
  const assigneeDistribution = useMemo(() => {
    const dist: { [key: string]: number } = {};
    cardsList.forEach((card) => {
      const ass = card.assignee ? card.assignee.trim() : "Unassigned";
      dist[ass] = (dist[ass] || 0) + 1;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [cardsList]);

  // SVG Chart Dimensions
  const chartWidth = 500;
  const chartHeight = 220;
  const chartPadding = 40;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-100 font-mono bg-brand-bg select-none relative">
      {/* Tooltip Overlay */}
      {hoveredData && (
        <div
          className="absolute z-50 bg-brand-card/95 border border-brand-accent p-2.5 rounded-xs text-[11px] text-slate-200 pointer-events-none shadow-lg shadow-brand-accent/15 max-w-[200px] font-mono backdrop-blur-md"
          style={{ left: `${hoveredData.x}px`, top: `${hoveredData.y}px` }}
        >
          <div className="text-[10px] text-brand-accent font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="w-1 h-2 bg-brand-accent inline-block"></span>
            {hoveredData.chart}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-450">{hoveredData.label}:</span>
            <span className="font-bold text-slate-100">{hoveredData.value}</span>
          </div>
        </div>
      )}

      {/* Grid of KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Active Cards */}
        <div className="tacticool-card p-4 bg-brand-card/90 rounded-xs flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-accent transition-all">
          <div className="absolute top-0 right-0 p-2 text-brand-accent/10 group-hover:text-brand-accent/20 transition-colors">
            <Flame size={48} className="rotate-12" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase block">
              ACTIVE OPERATIONS
            </span>
            <span className="text-3xl font-bold tracking-tight text-slate-100 block mt-1">
              {activeCards}
            </span>
          </div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-1">
            UNFINISHED SQUAD TASKS
          </div>
        </div>

        {/* KPI: Completed Cards */}
        <div className="tacticool-card p-4 bg-brand-card/90 rounded-xs flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-accent transition-all">
          <div className="absolute top-0 right-0 p-2 text-brand-accent/10 group-hover:text-brand-accent/20 transition-colors">
            <CheckCircle size={48} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase block">
              COMPLETED ACTIONS
            </span>
            <span className="text-3xl font-bold tracking-tight text-brand-accent block mt-1">
              {completedCards.length}
            </span>
          </div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-1">
            SUCCESSFULLY DEPLOYED ({totalCards > 0 ? Math.round((completedCards.length / totalCards) * 100) : 0}%)
          </div>
        </div>

        {/* KPI: Velocity */}
        <div className="tacticool-card p-4 bg-brand-card/90 rounded-xs flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-accent transition-all">
          <div className="absolute top-0 right-0 p-2 text-brand-accent/10 group-hover:text-brand-accent/20 transition-colors">
            <BarChart2 size={48} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase block">
              WEEKLY VELOCITY
            </span>
            <span className="text-3xl font-bold tracking-tight text-slate-100 block mt-1">
              {currentVelocity}
            </span>
          </div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-1">
            STORY POINTS COMPLETED
          </div>
        </div>

        {/* KPI: Cycle/Lead Time */}
        <div className="tacticool-card p-4 bg-brand-card/90 rounded-xs flex flex-col justify-between h-28 relative overflow-hidden group hover:border-brand-accent transition-all">
          <div className="absolute top-0 right-0 p-2 text-brand-accent/10 group-hover:text-brand-accent/20 transition-colors">
            <Clock size={48} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 tracking-widest uppercase block">
              LEAD / CYCLE TIME
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-100 block mt-2">
              {avgLeadTimeDays.toFixed(1)}d <span className="text-slate-500 text-xs font-normal">/</span> {avgCycleTimeDays.toFixed(1)}d
            </span>
          </div>
          <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-1">
            AVG DEPLOY TIME IN DAYS
          </div>
        </div>
      </div>

      {totalCards === 0 ? (
        <div className="tacticool-card bg-brand-card/40 p-8 flex flex-col items-center justify-center gap-4 text-center rounded-xs min-h-[400px]">
          <AlertTriangle className="text-brand-accent animate-pulse" size={40} />
          <div>
            <h3 className="text-md font-bold uppercase tracking-wider text-slate-200">
              NO OPERATIONS LOGGED
            </h3>
            <p className="text-xs text-slate-500 mt-2 max-w-md uppercase tracking-widest leading-relaxed">
              Create mission cards on the Kanban board and move them across columns to begin collecting tactical execution metrics.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Burndown Chart */}
            <div className="tacticool-card p-5 bg-brand-card rounded-xs relative">
              <div className="flex items-center justify-between mb-4 border-b border-brand-accent/15 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                  <Flame size={14} className="text-brand-accent" />
                  BURNDOWN METRIC (STORY POINTS)
                </span>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1">
                  <Info size={10} /> LAST 15 DAYS
                </span>
              </div>
              <div className="w-full flex justify-center">
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="overflow-visible"
                >
                  <defs>
                    <linearGradient id="actualGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity="0.25"/>
                      <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = chartPadding + (i * (chartHeight - 2 * chartPadding)) / 4;
                    return (
                      <line
                        key={i}
                        x1={chartPadding}
                        y1={y}
                        x2={chartWidth - chartPadding}
                        y2={y}
                        stroke="var(--brand-accent)"
                        strokeOpacity="0.12"
                        strokeDasharray="2 2"
                      />
                    );
                  })}

                  {/* Render Ideal Burndown Line */}
                  {(() => {
                    const points = burndownData.map((d, index) => {
                      const x =
                        chartPadding +
                        (index * (chartWidth - 2 * chartPadding)) / (burndownData.length - 1);
                      const maxVal = Math.max(...burndownData.map((x) => x.actual), 1);
                      const y =
                        chartHeight -
                        chartPadding -
                        (d.ideal / maxVal) * (chartHeight - 2 * chartPadding);
                      return `${x},${y}`;
                    });
                    return (
                      <polyline
                        fill="none"
                        stroke="rgba(148, 163, 184, 0.3)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        points={points.join(" ")}
                      />
                    );
                  })()}

                  {/* Render Actual Burndown Area (Glow) */}
                  {(() => {
                    const points = burndownData.map((d, index) => {
                      const x =
                        chartPadding +
                        (index * (chartWidth - 2 * chartPadding)) / (burndownData.length - 1);
                      const maxVal = Math.max(...burndownData.map((x) => x.actual), 1);
                      const y =
                        chartHeight -
                        chartPadding -
                        (d.actual / maxVal) * (chartHeight - 2 * chartPadding);
                      return `${x},${y}`;
                    });
                    
                    const startX = chartPadding;
                    const endX = chartWidth - chartPadding;
                    const baselineY = chartHeight - chartPadding;
                    const areaPoints = `${startX},${baselineY} ${points.join(" ")} ${endX},${baselineY}`;

                    return (
                      <polygon
                        fill="url(#actualGlow)"
                        points={areaPoints}
                      />
                    );
                  })()}

                  {/* Render Actual Burndown Line */}
                  {(() => {
                    const points = burndownData.map((d, index) => {
                      const x =
                        chartPadding +
                        (index * (chartWidth - 2 * chartPadding)) / (burndownData.length - 1);
                      const maxVal = Math.max(...burndownData.map((x) => x.actual), 1);
                      const y =
                        chartHeight -
                        chartPadding -
                        (d.actual / maxVal) * (chartHeight - 2 * chartPadding);
                      return `${x},${y}`;
                    });
                    return (
                      <polyline
                        fill="none"
                        stroke="var(--brand-accent)"
                        strokeWidth="2.5"
                        points={points.join(" ")}
                      />
                    );
                  })()}

                  {/* Hotspots for tooltips */}
                  {burndownData.map((d, index) => {
                    const x =
                      chartPadding +
                      (index * (chartWidth - 2 * chartPadding)) / (burndownData.length - 1);
                    const maxVal = Math.max(...burndownData.map((x) => x.actual), 1);
                    const y =
                      chartHeight -
                      chartPadding -
                      (d.actual / maxVal) * (chartHeight - 2 * chartPadding);

                    return (
                      <g key={index}>
                        {/* Dot anchor */}
                        <circle
                          cx={x}
                          cy={y}
                          r="4"
                          fill="var(--brand-accent)"
                          stroke="var(--brand-card)"
                          strokeWidth="1.5"
                          className="hover:fill-white transition-colors duration-100 cursor-pointer"
                          onMouseMove={(e) => {
                            const svgRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                            const container = e.currentTarget.closest(".relative");
                            const containerRect = container?.getBoundingClientRect();
                            if (svgRect && containerRect && container) {
                              setHoveredData({
                                chart: "BURNDOWN TRAJECTORY",
                                label: d.date,
                                value: `Actual: ${d.actual} SP / Ideal: ${d.ideal} SP`,
                                x: svgRect.left - containerRect.left + container.scrollLeft + x - 80,
                                y: svgRect.top - containerRect.top + container.scrollTop + y - 60,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredData(null)}
                        />
                      </g>
                    );
                  })}

                  {/* X Axis Labels */}
                  {burndownData.filter((_, i) => i % 3 === 0 || i === burndownData.length - 1).map((d, index, arr) => {
                    const originalIndex = burndownData.findIndex((x) => x.date === d.date);
                    const x =
                      chartPadding +
                      (originalIndex * (chartWidth - 2 * chartPadding)) / (burndownData.length - 1);
                    return (
                      <text
                        key={index}
                        x={x}
                        y={chartHeight - chartPadding + 18}
                        className="text-[8px] fill-slate-400 font-mono text-anchor-middle"
                        textAnchor="middle"
                      >
                        {d.date}
                      </text>
                    );
                  })}
                </svg>
              </div>
              <div className="flex items-center justify-center gap-4 text-[9px] mt-2 font-mono uppercase text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 border-t border-dashed border-slate-500"></span> IDEAL TRAJECTORY
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-3 h-0.5 bg-brand-accent"></span> ACTUAL REMAINING
                </div>
              </div>
            </div>

            {/* Velocity Chart */}
            <div className="tacticool-card p-5 bg-brand-card rounded-xs relative">
              <div className="flex items-center justify-between mb-4 border-b border-brand-accent/15 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-200 flex items-center gap-1.5">
                  <BarChart2 size={14} className="text-brand-accent" />
                  WEEKLY TEAM VELOCITY
                </span>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest flex items-center gap-1">
                  <Info size={10} /> ROLLING 7-DAY INTERVALS
                </span>
              </div>
              <div className="w-full flex justify-center">
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="overflow-visible"
                >
                  <defs>
                    <linearGradient id="barGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  {Array.from({ length: 5 }).map((_, i) => {
                    const y = chartPadding + (i * (chartHeight - 2 * chartPadding)) / 4;
                    return (
                      <line
                        key={i}
                        x1={chartPadding}
                        y1={y}
                        x2={chartWidth - chartPadding}
                        y2={y}
                        stroke="var(--brand-accent)"
                        strokeOpacity="0.12"
                        strokeDasharray="2 2"
                      />
                    );
                  })}

                  {/* Render Bars */}
                  {velocityData.map((d, index) => {
                    const maxVal = Math.max(...velocityData.map((x) => x.storyPoints), 1);
                    const barWidth = 32;
                    const spacing = (chartWidth - 2 * chartPadding) / velocityData.length;
                    const x = chartPadding + index * spacing + spacing / 2 - barWidth / 2;
                    const barHeight = (d.storyPoints / maxVal) * (chartHeight - 2 * chartPadding);
                    const y = chartHeight - chartPadding - barHeight;

                    return (
                      <g key={index}>
                        {/* Bar */}
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={Math.max(barHeight, 2)}
                          fill="url(#barGlow)"
                          stroke="var(--brand-accent)"
                          strokeWidth="1.5"
                          className="hover:opacity-80 transition-opacity duration-100 cursor-pointer"
                          onMouseMove={(e) => {
                            const svgRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
                            const container = e.currentTarget.closest(".relative");
                            const containerRect = container?.getBoundingClientRect();
                            if (svgRect && containerRect && container) {
                              setHoveredData({
                                chart: "WEEKLY COMPLETED",
                                label: d.label,
                                value: `${d.storyPoints} Story Points (${d.cardCount} Cards)`,
                                x: svgRect.left - containerRect.left + container.scrollLeft + x - 40,
                                y: svgRect.top - containerRect.top + container.scrollTop + y - 60,
                              });
                            }
                          }}
                          onMouseLeave={() => setHoveredData(null)}
                        />
                        {/* Value Text on Top */}
                        <text
                          x={x + barWidth / 2}
                          y={y - 6}
                          textAnchor="middle"
                          className="text-[9px] fill-slate-200 font-mono font-bold"
                        >
                          {d.storyPoints}
                        </text>
                        {/* Label */}
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight - chartPadding + 16}
                          textAnchor="middle"
                          className="text-[9px] fill-slate-400 font-mono"
                        >
                          {d.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </div>

          {/* Breakdown Distributions Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column Distribution */}
            <div className="tacticool-card p-5 bg-brand-card rounded-xs">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-200 block mb-4 border-b border-brand-accent/15 pb-2">
                COLUMN WORKLOAD
              </span>
              <div className="space-y-3 font-mono text-[11px]">
                {columnDistribution.map((item, index) => {
                  const max = Math.max(...columnDistribution.map((c) => c.value), 1);
                  const pct = Math.round((item.value / max) * 100);

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between uppercase">
                        <span className="text-slate-300 font-bold">{item.name}</span>
                        <span className="text-brand-accent font-bold">{item.value} cards</span>
                      </div>
                      <div className="h-2 bg-brand-bg/85 border border-brand-accent/15 rounded-xs overflow-hidden">
                        <div
                          className="h-full bg-brand-accent shadow-sm shadow-brand-accent/30"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="tacticool-card p-5 bg-brand-card rounded-xs">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-200 block mb-4 border-b border-brand-accent/15 pb-2">
                PRIORITY DISTRIBUTION
              </span>
              <div className="space-y-3 font-mono text-[11px]">
                {priorityDistribution.map((item, index) => {
                  const max = Math.max(...priorityDistribution.map((p) => p.value), 1);
                  const pct = Math.round((item.value / max) * 100);
                  const colors = {
                    HIGH: "bg-brand-destructive",
                    MEDIUM: "bg-amber-500",
                    LOW: "bg-emerald-500",
                  };
                  const colorClass = colors[item.name as keyof typeof colors] || "bg-brand-accent";

                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between uppercase">
                        <span className="text-slate-300 font-bold">{item.name}</span>
                        <span className="text-slate-100 font-bold">{item.value} cards</span>
                      </div>
                      <div className="h-2 bg-brand-bg/85 border border-brand-accent/15 rounded-xs overflow-hidden">
                        <div
                          className={`h-full ${colorClass}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Assignee Distribution */}
            <div className="tacticool-card p-5 bg-brand-card rounded-xs">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-200 block mb-4 border-b border-brand-accent/15 pb-2">
                ASSIGNEE BREAKDOWN
              </span>
              <div className="space-y-3 font-mono text-[11px] max-h-[180px] overflow-y-auto pr-1">
                {assigneeDistribution.length === 0 ? (
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest text-center py-6">
                    No assignees recorded
                  </div>
                ) : (
                  assigneeDistribution.map((item, index) => {
                    const max = Math.max(...assigneeDistribution.map((a) => a.value), 1);
                    const pct = Math.round((item.value / max) * 100);

                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between uppercase">
                          <span className="text-slate-300 font-bold truncate max-w-[150px]">
                            {item.name}
                          </span>
                          <span className="text-slate-100 font-bold">{item.value} cards</span>
                        </div>
                        <div className="h-2 bg-brand-bg/85 border border-brand-accent/15 rounded-xs overflow-hidden">
                          <div
                            className="h-full bg-cyan-500 shadow-sm shadow-cyan-500/30"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

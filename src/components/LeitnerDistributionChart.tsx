import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BarChart3, TrendingUp } from 'lucide-react';
import { ReframeCard } from '../types/reframe';
import { LEITNER_INTERVALS } from '../utils/leitnerStorage';
import { useTheme, AppTheme } from '../context/ThemeContext';

interface LeitnerDistributionChartProps {
  cards: ReframeCard[];
}

interface BoxDatum {
  box: number;
  label: string;
  shortLabel: string;
  stage: string;
  intervalDays: number;
  count: number;
  dueCount: number;
  percentage: number;
}

interface ChartThemeTokens {
  barColors: [string, string, string, string, string];
  barHoverStroke: string;
  gridColor: string;
  axisColor: string;
  tickTextColor: string;
  subTextColor: string;
  valueTextColor: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  tooltipMuted: string;
  fontFamily: string;
  monoFontFamily: string;
  barRadius: number;
  barStrokeWidth: number;
  barStrokeColor: string;
}

const BOX_STAGES: Record<number, { stage: string; shortLabel: string }> = {
  1: { stage: 'Daily Recall', shortLabel: '1d cadence' },
  2: { stage: 'Early Encoding', shortLabel: '2d cadence' },
  3: { stage: 'Consolidating', shortLabel: '4d cadence' },
  4: { stage: 'Long-Term', shortLabel: '7d cadence' },
  5: { stage: 'Mastered', shortLabel: '14d cadence' },
};

function getChartThemeTokens(theme: AppTheme): ChartThemeTokens {
  switch (theme) {
    case 'skeuomorphic':
      return {
        barColors: ['#8C1D18', '#B45D1E', '#B38628', '#3E6B52', '#164A37'],
        barHoverStroke: '#1F140E',
        gridColor: '#C8B896',
        axisColor: '#8C6A3E',
        tickTextColor: '#1F140E',
        subTextColor: '#5A3D28',
        valueTextColor: '#1F140E',
        tooltipBg: '#2B1910',
        tooltipBorder: '#C89E3A',
        tooltipText: '#F5ECD8',
        tooltipMuted: '#E8C978',
        fontFamily: 'var(--font-sans)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 4,
        barStrokeWidth: 1,
        barStrokeColor: 'rgba(31, 20, 14, 0.25)',
      };
    case 'cyberpunk':
      return {
        barColors: ['#FF2A85', '#D946EF', '#8B5CF6', '#0EA5E9', '#00F0FF'],
        barHoverStroke: '#FFFFFF',
        gridColor: 'rgba(0, 240, 255, 0.16)',
        axisColor: 'rgba(0, 240, 255, 0.45)',
        tickTextColor: '#E6F4FF',
        subTextColor: '#94A3B8',
        valueTextColor: '#00F0FF',
        tooltipBg: '#060714',
        tooltipBorder: '#00F0FF',
        tooltipText: '#E6F4FF',
        tooltipMuted: '#FF4DA6',
        fontFamily: 'var(--font-cyber)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 2,
        barStrokeWidth: 1,
        barStrokeColor: 'rgba(255, 255, 255, 0.22)',
      };
    case 'material':
      return {
        barColors: ['#D32F2F', '#F57C00', '#1976D2', '#0288D1', '#00897B'],
        barHoverStroke: '#0F172A',
        gridColor: '#E2E8F0',
        axisColor: '#94A3B8',
        tickTextColor: '#111827',
        subTextColor: '#475569',
        valueTextColor: '#111827',
        tooltipBg: '#0F172A',
        tooltipBorder: '#1565C0',
        tooltipText: '#FFFFFF',
        tooltipMuted: '#93C5FD',
        fontFamily: 'var(--font-material)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 6,
        barStrokeWidth: 0,
        barStrokeColor: 'transparent',
      };
    case 'editorial':
      return {
        barColors: ['#9B2226', '#BB3E03', '#CA6702', '#2B5B4E', '#1E4D40'],
        barHoverStroke: '#1D1814',
        gridColor: '#D5CCB8',
        axisColor: '#1D1814',
        tickTextColor: '#1D1814',
        subTextColor: '#574D42',
        valueTextColor: '#1D1814',
        tooltipBg: '#1D1814',
        tooltipBorder: '#9B2226',
        tooltipText: '#FAF5EA',
        tooltipMuted: '#E9D8A6',
        fontFamily: 'var(--font-editorial-body)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 0,
        barStrokeWidth: 1,
        barStrokeColor: '#1D1814',
      };
    case 'slate':
      return {
        barColors: ['#F43F5E', '#F59E0B', '#38BDF8', '#14B8A6', '#2DD4BF'],
        barHoverStroke: '#F8FAFC',
        gridColor: 'rgba(148, 163, 184, 0.16)',
        axisColor: '#475569',
        tickTextColor: '#F1F5F9',
        subTextColor: '#94A3B8',
        valueTextColor: '#2DD4BF',
        tooltipBg: '#0B1220',
        tooltipBorder: '#2DD4BF',
        tooltipText: '#F1F5F9',
        tooltipMuted: '#5EEAD4',
        fontFamily: 'var(--font-sans)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 6,
        barStrokeWidth: 0,
        barStrokeColor: 'transparent',
      };
    case 'clay':
      return {
        barColors: ['#FB7185', '#FBBF24', '#818CF8', '#6366F1', '#34D399'],
        barHoverStroke: '#1E2547',
        gridColor: '#DCE3F5',
        axisColor: '#9AA4C7',
        tickTextColor: '#1E2547',
        subTextColor: '#647094',
        valueTextColor: '#4338CA',
        tooltipBg: '#1E2547',
        tooltipBorder: '#818CF8',
        tooltipText: '#FFFFFF',
        tooltipMuted: '#C7D2FE',
        fontFamily: 'var(--font-sans)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 10,
        barStrokeWidth: 0,
        barStrokeColor: 'transparent',
      };
    case 'saas':
      return {
        barColors: ['#E11D48', '#F59E0B', '#6366F1', '#4F46E5', '#10B981'],
        barHoverStroke: '#0F172A',
        gridColor: '#E2E8F0',
        axisColor: '#CBD5E1',
        tickTextColor: '#0F172A',
        subTextColor: '#64748B',
        valueTextColor: '#0F172A',
        tooltipBg: '#0F172A',
        tooltipBorder: '#4F46E5',
        tooltipText: '#FFFFFF',
        tooltipMuted: '#A5B4FC',
        fontFamily: 'var(--font-sans)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 6,
        barStrokeWidth: 0,
        barStrokeColor: 'transparent',
      };
    case 'nordic':
      return {
        barColors: ['#B86B55', '#C79258', '#8FA495', '#688976', '#425F4E'],
        barHoverStroke: '#242E28',
        gridColor: '#E4DFD4',
        axisColor: '#C8C2B4',
        tickTextColor: '#242E28',
        subTextColor: '#5C6962',
        valueTextColor: '#2D4739',
        tooltipBg: '#242E28',
        tooltipBorder: '#8FA495',
        tooltipText: '#FDFBF7',
        tooltipMuted: '#B8CBBF',
        fontFamily: 'var(--font-sans)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 8,
        barStrokeWidth: 0,
        barStrokeColor: 'transparent',
      };
    case 'neobrutalism':
      return {
        barColors: ['#FB7185', '#FACC15', '#38BDF8', '#A78BFA', '#4ADE80'],
        barHoverStroke: '#000000',
        gridColor: '#D4D4D8',
        axisColor: '#000000',
        tickTextColor: '#000000',
        subTextColor: '#27272A',
        valueTextColor: '#000000',
        tooltipBg: '#000000',
        tooltipBorder: '#FFE500',
        tooltipText: '#FFFFFF',
        tooltipMuted: '#FFE500',
        fontFamily: 'var(--font-sans)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 0,
        barStrokeWidth: 2,
        barStrokeColor: '#000000',
      };
    case 'obsidian':
      return {
        barColors: ['#9E4747', '#A67C37', '#C5A059', '#D4AF37', '#E5C77B'],
        barHoverStroke: '#F5F0E6',
        gridColor: '#221E17',
        axisColor: '#3A3224',
        tickTextColor: '#F5F0E6',
        subTextColor: '#A39E93',
        valueTextColor: '#E5C77B',
        tooltipBg: '#121216',
        tooltipBorder: '#D4AF37',
        tooltipText: '#F5F0E6',
        tooltipMuted: '#D4AF37',
        fontFamily: 'var(--font-sans)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 2,
        barStrokeWidth: 1,
        barStrokeColor: 'rgba(212, 175, 55, 0.35)',
      };
    case 'glassmorphism':
      return {
        barColors: ['#FB7185', '#FBBF24', '#60A5FA', '#38BDF8', '#34D399'],
        barHoverStroke: '#FFFFFF',
        gridColor: 'rgba(255, 255, 255, 0.12)',
        axisColor: 'rgba(255, 255, 255, 0.25)',
        tickTextColor: '#F8FAFC',
        subTextColor: '#CBD5E1',
        valueTextColor: '#7DD3FC',
        tooltipBg: 'rgba(15, 23, 42, 0.94)',
        tooltipBorder: 'rgba(56, 189, 248, 0.6)',
        tooltipText: '#F8FAFC',
        tooltipMuted: '#7DD3FC',
        fontFamily: 'var(--font-sans)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 8,
        barStrokeWidth: 1,
        barStrokeColor: 'rgba(255, 255, 255, 0.2)',
      };
    case 'terminal':
    default:
      return {
        barColors: ['#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#FBBF24'],
        barHoverStroke: '#FFFFFF',
        gridColor: '#27272A',
        axisColor: '#52525B',
        tickTextColor: '#E4E4E7',
        subTextColor: '#A1A1AA',
        valueTextColor: '#FBBF24',
        tooltipBg: '#09090B',
        tooltipBorder: '#52525B',
        tooltipText: '#F4F4F5',
        tooltipMuted: '#FBBF24',
        fontFamily: 'var(--font-mono)',
        monoFontFamily: 'var(--font-mono)',
        barRadius: 2,
        barStrokeWidth: 0,
        barStrokeColor: 'transparent',
      };
  }
}

export const LeitnerDistributionChart: React.FC<LeitnerDistributionChartProps> = ({ cards }) => {
  const {
    theme,
    isSkeuomorphic,
    isCyberpunk,
    isMaterial,
    isEditorial,
    isSlate,
    isClay,
    isSaas,
    isNordic,
    isBrutal,
    isObsidian,
    isGlass,
  } = useTheme();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [chartWidth, setChartWidth] = useState<number>(640);
  const [hoveredBox, setHoveredBox] = useState<BoxDatum | null>(null);

  const tokens = useMemo(() => getChartThemeTokens(theme), [theme]);

  const { data, totalCards, dueTotal, masteredCount, masteryRate, weightedProgress } = useMemo(() => {
    const now = Date.now();
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const dues: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    cards.forEach((card) => {
      const box = Math.min(5, Math.max(1, card.box || 1));
      counts[box] = (counts[box] || 0) + 1;
      const isDue = !card.lastReviewedAt || card.timesReviewed === 0 || new Date(card.nextDueAt).getTime() <= now;
      if (isDue) {
        dues[box] = (dues[box] || 0) + 1;
      }
    });

    const total = cards.length;
    const boxData: BoxDatum[] = [1, 2, 3, 4, 5].map((box) => ({
      box,
      label: `Box ${box}`,
      shortLabel: BOX_STAGES[box].shortLabel,
      stage: BOX_STAGES[box].stage,
      intervalDays: LEITNER_INTERVALS[box] || 1,
      count: counts[box] || 0,
      dueCount: dues[box] || 0,
      percentage: total > 0 ? Math.round(((counts[box] || 0) / total) * 100) : 0,
    }));

    const mastered = (counts[4] || 0) + (counts[5] || 0);
    const totalDue = Object.values(dues).reduce((acc, v) => acc + v, 0);
    // Weighted retention index: Box 1 = 0%, Box 2 = 25%, Box 3 = 50%, Box 4 = 75%, Box 5 = 100%
    const scoreSum = boxData.reduce((acc, d) => acc + d.count * ((d.box - 1) / 4), 0);
    const weightedPct = total > 0 ? Math.round((scoreSum / total) * 100) : 0;

    return {
      data: boxData,
      totalCards: total,
      dueTotal: totalDue,
      masteredCount: mastered,
      masteryRate: total > 0 ? Math.round((mastered / total) * 100) : 0,
      weightedProgress: weightedPct,
    };
  }, [cards]);

  // Observe container width for crisp responsive D3 rendering
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const w = Math.floor(el.getBoundingClientRect().width);
      if (w > 180) {
        setChartWidth(w);
      }
    };

    updateWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => updateWidth());
      observer.observe(el);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Render D3 bar chart
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const width = chartWidth;
    const height = width < 480 ? 250 : 280;
    const margin = {
      top: 28,
      right: 18,
      bottom: 56,
      left: 38,
    };
    const innerWidth = Math.max(120, width - margin.left - margin.right);
    const innerHeight = Math.max(100, height - margin.top - margin.bottom);

    const svg = d3
      .select(svgEl)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const maxCount = d3.max(data, (d) => d.count) ?? 0;
    const yDomainMax = Math.max(4, Math.ceil(maxCount * 1.18));

    const xScale = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.label))
      .range([0, innerWidth])
      .padding(width < 460 ? 0.28 : 0.34);

    const yScale = d3
      .scaleLinear()
      .domain([0, yDomainMax])
      .nice()
      .range([innerHeight, 0]);

    const yTickValues = yScale.ticks(Math.min(5, yDomainMax)).filter((t) => Number.isInteger(t));

    // Horizontal gridlines
    const gridGroup = g.append('g').attr('class', 'd3-grid');
    gridGroup
      .selectAll('line')
      .data(yTickValues)
      .join('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', (d) => yScale(d))
      .attr('y2', (d) => yScale(d))
      .attr('stroke', tokens.gridColor)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', isBrutal || isEditorial ? 'none' : '3,3');

    // Y axis
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(yTickValues)
      .tickFormat((d) => `${d}`)
      .tickSize(0)
      .tickPadding(10);

    const yAxisGroup = g.append('g').call(yAxis);
    yAxisGroup.select('.domain').attr('stroke', tokens.axisColor).attr('stroke-opacity', 0.45);
    yAxisGroup
      .selectAll('text')
      .attr('fill', tokens.subTextColor)
      .style('font-family', tokens.monoFontFamily)
      .style('font-size', '11px')
      .style('font-variant-numeric', 'tabular-nums');

    // Baseline X axis
    g.append('line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', innerHeight)
      .attr('y2', innerHeight)
      .attr('stroke', tokens.axisColor)
      .attr('stroke-width', isBrutal ? 2 : 1.25);

    // Bars group
    const barsGroup = g.append('g').attr('class', 'd3-bars');

    const barGroups = barsGroup
      .selectAll<SVGGElement, BoxDatum>('g.bar-item')
      .data(data, (d) => d.box)
      .join('g')
      .attr('class', 'bar-item')
      .style('cursor', 'pointer');

    const bandwidth = xScale.bandwidth();
    const rx = Math.min(tokens.barRadius, bandwidth / 2);

    // Subtle full-height backdrop slot per bar for desk-slot / HUD clarity
    barGroups
      .append('rect')
      .attr('x', (d) => xScale(d.label) ?? 0)
      .attr('y', 0)
      .attr('width', bandwidth)
      .attr('height', innerHeight)
      .attr('rx', rx)
      .attr('fill', tokens.gridColor)
      .attr('fill-opacity', isSkeuomorphic || isEditorial ? 0.18 : 0.1);

    // Animated bars
    const bars = barGroups
      .append('rect')
      .attr('x', (d) => xScale(d.label) ?? 0)
      .attr('width', bandwidth)
      .attr('y', innerHeight)
      .attr('height', 0)
      .attr('rx', rx)
      .attr('fill', (d) => tokens.barColors[d.box - 1])
      .attr('stroke', tokens.barStrokeColor)
      .attr('stroke-width', tokens.barStrokeWidth);

    const supportsTransition =
      typeof d3.transition === 'function' && typeof bars.transition === 'function';

    if (supportsTransition) {
      bars
        .transition(d3.transition().duration(480).ease(d3.easeCubicOut))
        .attr('y', (d) => yScale(d.count))
        .attr('height', (d) => Math.max(d.count > 0 ? 4 : 0, innerHeight - yScale(d.count)));
    } else {
      bars
        .attr('y', (d) => yScale(d.count))
        .attr('height', (d) => Math.max(d.count > 0 ? 4 : 0, innerHeight - yScale(d.count)));
    }

    // Value count + percentage labels above bars
    const valueLabels = barGroups
      .append('text')
      .attr('x', (d) => (xScale(d.label) ?? 0) + bandwidth / 2)
      .attr('y', innerHeight - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', tokens.valueTextColor)
      .style('font-family', tokens.monoFontFamily)
      .style('font-size', width < 460 ? '10px' : '11.5px')
      .style('font-weight', '700')
      .style('font-variant-numeric', 'tabular-nums')
      .style('opacity', 0)
      .text((d) => (width < 420 ? `${d.count}` : `${d.count} (${d.percentage}%)`));

    if (supportsTransition && typeof valueLabels.transition === 'function') {
      valueLabels
        .transition(d3.transition().duration(480).ease(d3.easeCubicOut))
        .attr('y', (d) => Math.max(12, yScale(d.count) - 7))
        .style('opacity', 1);
    } else {
      valueLabels
        .attr('y', (d) => Math.max(12, yScale(d.count) - 7))
        .style('opacity', 1);
    }

    // X-axis Box label & cadence sublabel
    barGroups
      .append('text')
      .attr('x', (d) => (xScale(d.label) ?? 0) + bandwidth / 2)
      .attr('y', innerHeight + 19)
      .attr('text-anchor', 'middle')
      .attr('fill', tokens.tickTextColor)
      .style('font-family', tokens.fontFamily)
      .style('font-size', width < 440 ? '11px' : '12px')
      .style('font-weight', '700')
      .text((d) => d.label.toUpperCase());

    barGroups
      .append('text')
      .attr('x', (d) => (xScale(d.label) ?? 0) + bandwidth / 2)
      .attr('y', innerHeight + 36)
      .attr('text-anchor', 'middle')
      .attr('fill', tokens.subTextColor)
      .style('font-family', tokens.monoFontFamily)
      .style('font-size', '10px')
      .text((d) => (width < 460 ? `${d.intervalDays}d` : d.stage));

    // Interactive hover highlighting
    barGroups
      .on('mouseenter', function (_event, d) {
        const targetBar = d3.select(this).select('rect:nth-child(2)');
        if (supportsTransition && typeof targetBar.transition === 'function') {
          targetBar
            .transition(d3.transition().duration(140))
            .attr('stroke', tokens.barHoverStroke)
            .attr('stroke-width', Math.max(2, tokens.barStrokeWidth + 1))
            .style('filter', 'brightness(1.08)');
        } else {
          targetBar
            .attr('stroke', tokens.barHoverStroke)
            .attr('stroke-width', Math.max(2, tokens.barStrokeWidth + 1))
            .style('filter', 'brightness(1.08)');
        }
        setHoveredBox(d);
      })
      .on('mouseleave', function () {
        const targetBar = d3.select(this).select('rect:nth-child(2)');
        if (supportsTransition && typeof targetBar.transition === 'function') {
          targetBar
            .transition(d3.transition().duration(140))
            .attr('stroke', tokens.barStrokeColor)
            .attr('stroke-width', tokens.barStrokeWidth)
            .style('filter', 'none');
        } else {
          targetBar
            .attr('stroke', tokens.barStrokeColor)
            .attr('stroke-width', tokens.barStrokeWidth)
            .style('filter', 'none');
        }
        setHoveredBox(null);
      });
  }, [data, chartWidth, tokens, isBrutal, isEditorial, isSkeuomorphic]);

  const cardSurfaceClass = isSkeuomorphic
    ? 'skeuo-paper-elevated border-2 border-[#6B4A2B] rounded-lg p-6 space-y-5 text-[#1F140E]'
    : isCyberpunk
    ? 'cyber-card-elevated border border-cyan-400/35 border-t-2 border-t-[#00F0FF] rounded-sm p-6 space-y-5'
    : isMaterial
    ? 'material-card-elevated rounded-xl p-6 space-y-5 border-t-4 border-[#1565C0]'
    : isEditorial
    ? 'border-2 border-[#1D1814] editorial-card-elevated rounded-none p-6 space-y-5'
    : isSlate
    ? 'border border-slate-700/80 slate-card-elevated rounded-lg p-6 space-y-5'
    : isClay
    ? 'border border-white/95 clay-card-elevated rounded-3xl p-6 space-y-5'
    : isSaas
    ? 'border border-slate-200 saas-card rounded-xl p-6 space-y-5'
    : isNordic
    ? 'border border-[#DDD7C8] nordic-card rounded-2xl p-6 space-y-5'
    : isBrutal
    ? 'border-2 border-black bg-white p-5 brutal-shadow space-y-5'
    : isObsidian
    ? 'border border-[#D4AF37]/30 obsidian-surface p-6 space-y-5'
    : isGlass
    ? 'border border-white/20 glass-panel rounded-2xl p-6 space-y-5'
    : 'border border-zinc-800 bg-zinc-950 p-5 rounded-lg space-y-5';

  const wellClass = isSkeuomorphic
    ? 'skeuo-well rounded-md p-3.5'
    : isCyberpunk
    ? 'cyber-well rounded-sm p-3.5'
    : isMaterial
    ? 'bg-[#E4E9F2] border border-[#CBD5E1] rounded-lg p-3.5'
    : isEditorial
    ? 'bg-[#EAE1D0] border border-[#1D1814]/35 rounded-none p-3.5'
    : isSlate
    ? 'bg-[#0B1220] border border-slate-800 rounded-md p-3.5'
    : isClay
    ? 'clay-well rounded-2xl p-3.5'
    : isSaas
    ? 'bg-slate-50 border border-slate-200 rounded-lg p-3.5'
    : isNordic
    ? 'bg-[#F6F3EC] border border-[#E4DFD4] rounded-xl p-3.5'
    : isBrutal
    ? 'bg-[#FFFDF5] border-2 border-black p-3'
    : isObsidian
    ? 'bg-[#0B0B0E] border border-[#2A241A] p-3.5'
    : isGlass
    ? 'bg-white/[0.04] border border-white/12 rounded-xl p-3.5'
    : 'bg-zinc-900/70 border border-zinc-800 rounded p-3';

  const chartPlotWellClass = isSkeuomorphic
    ? 'skeuo-well rounded-md p-3 sm:p-4'
    : isCyberpunk
    ? 'cyber-well rounded-sm p-3 sm:p-4'
    : isMaterial
    ? 'bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 sm:p-4'
    : isEditorial
    ? 'bg-[#FFFDF7] border border-[#C9BFA9] rounded-none p-3 sm:p-4'
    : isSlate
    ? 'bg-[#0B1220] border border-slate-800 rounded-md p-3 sm:p-4'
    : isClay
    ? 'clay-well rounded-2xl p-3 sm:p-4'
    : isSaas
    ? 'bg-slate-50/70 border border-slate-200 rounded-lg p-3 sm:p-4'
    : isNordic
    ? 'bg-[#FDFBF7] border border-[#E4DFD4] rounded-xl p-3 sm:p-4'
    : isBrutal
    ? 'bg-[#FFFDF5] border-2 border-black p-3 sm:p-4'
    : isObsidian
    ? 'bg-[#09090C] border border-[#2A241A] p-3 sm:p-4'
    : isGlass
    ? 'bg-slate-950/35 border border-white/12 rounded-xl p-3 sm:p-4'
    : 'bg-zinc-900/50 border border-zinc-800 rounded p-3 sm:p-4';

  const headerTitleClass = isSkeuomorphic
    ? 'flex items-center gap-2 text-[#8C1D18] text-xs font-mono uppercase tracking-wider font-bold'
    : isCyberpunk
    ? 'flex items-center gap-2 text-[#00F0FF] font-cyber text-xs uppercase tracking-[0.12em] font-bold'
    : isMaterial
    ? 'flex items-center gap-2 text-[#1565C0] text-xs uppercase tracking-wider font-bold'
    : isEditorial
    ? 'flex items-center gap-2 text-[#9B2226] text-xs font-mono uppercase tracking-wider font-semibold'
    : isSlate
    ? 'flex items-center gap-2 text-teal-300 text-xs uppercase tracking-wider font-semibold'
    : isClay
    ? 'flex items-center gap-2 text-indigo-600 text-xs uppercase tracking-wider font-semibold'
    : isSaas
    ? 'flex items-center gap-2 text-indigo-700 text-xs uppercase tracking-wider font-semibold'
    : isNordic
    ? 'flex items-center gap-2 text-[#3B5948] text-xs uppercase tracking-wider font-semibold'
    : isBrutal
    ? 'flex items-center gap-2 text-black text-sm font-black'
    : isObsidian
    ? 'flex items-center gap-2 text-[#E5C77B] text-xs uppercase tracking-[0.16em] font-semibold'
    : isGlass
    ? 'flex items-center gap-2 text-sky-300 text-xs uppercase tracking-wider font-semibold'
    : 'flex items-center gap-2 text-zinc-200 text-sm font-bold';

  const headingPrimaryClass = isSkeuomorphic
    ? 'font-editorial-display text-xl font-bold text-[#1F140E] tracking-tight'
    : isCyberpunk
    ? 'font-cyber text-lg font-bold text-[#E6F4FF] tracking-wider uppercase'
    : isMaterial
    ? 'text-lg font-bold text-[#111827] tracking-tight'
    : isEditorial
    ? 'font-editorial-display text-xl font-bold text-[#1D1814] tracking-tight'
    : isSlate
    ? 'text-lg font-bold text-slate-100 tracking-tight'
    : isClay
    ? 'text-lg font-bold text-[#1E2547] tracking-tight'
    : isSaas
    ? 'text-lg font-bold text-slate-900 tracking-tight'
    : isNordic
    ? 'text-lg font-bold text-[#242E28] tracking-tight'
    : isBrutal
    ? 'text-base font-black text-black tracking-tight'
    : isObsidian
    ? 'font-luxury text-xl font-semibold text-[#F5F0E6] tracking-wide'
    : isGlass
    ? 'text-lg font-bold text-white tracking-tight'
    : 'text-sm font-bold text-zinc-100 tracking-wider';

  const mutedTextClass = isSkeuomorphic
    ? 'text-xs text-[#4A3326]'
    : isCyberpunk
    ? 'text-xs text-slate-300'
    : isMaterial
    ? 'text-xs text-[#475569]'
    : isEditorial
    ? 'text-xs text-[#574D42]'
    : isSlate
    ? 'text-xs text-slate-400'
    : isClay
    ? 'text-xs text-[#4B5478]'
    : isSaas
    ? 'text-xs text-slate-600'
    : isNordic
    ? 'text-xs text-[#4E5A53]'
    : isBrutal
    ? 'text-xs text-zinc-800 font-medium'
    : isObsidian
    ? 'text-xs text-[#A39E93]'
    : isGlass
    ? 'text-xs text-slate-300'
    : 'text-xs text-zinc-400';

  const statValueClass = isSkeuomorphic
    ? 'text-xl font-mono font-bold text-[#1F140E] tabular-nums'
    : isCyberpunk
    ? 'text-xl font-mono font-bold text-[#00F0FF] tabular-nums'
    : isMaterial
    ? 'text-xl font-mono font-bold text-[#1565C0] tabular-nums'
    : isEditorial
    ? 'text-xl font-mono font-bold text-[#1D1814] tabular-nums'
    : isSlate
    ? 'text-xl font-mono font-bold text-teal-300 tabular-nums'
    : isClay
    ? 'text-xl font-mono font-bold text-indigo-700 tabular-nums'
    : isSaas
    ? 'text-xl font-mono font-bold text-indigo-600 tabular-nums'
    : isNordic
    ? 'text-xl font-mono font-bold text-[#2D4739] tabular-nums'
    : isBrutal
    ? 'text-xl font-mono font-black text-black tabular-nums'
    : isObsidian
    ? 'text-xl font-mono font-semibold text-[#E5C77B] tabular-nums'
    : isGlass
    ? 'text-xl font-mono font-bold text-sky-300 tabular-nums'
    : 'text-xl font-mono font-bold text-amber-400 tabular-nums';

  const statLabelClass = isSkeuomorphic
    ? 'text-[10px] font-mono uppercase tracking-wider text-[#5A3D28] font-semibold'
    : isCyberpunk
    ? 'text-[10px] font-cyber uppercase tracking-wider text-cyan-200/75 font-semibold'
    : isEditorial
    ? 'text-[10px] font-mono uppercase tracking-wider text-[#574D42] font-semibold'
    : isBrutal
    ? 'text-[10px] font-black uppercase tracking-wider text-black'
    : isObsidian
    ? 'text-[10px] uppercase tracking-[0.14em] text-[#A39E93] font-medium'
    : 'text-[10px] font-mono uppercase tracking-wider opacity-75 font-semibold';

  return (
    <section className={cardSurfaceClass} aria-label="Leitner Box Retention Distribution">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className={headerTitleClass}>
            <BarChart3 className="w-4 h-4" />
            <span>SPACED REPETITION TELEMETRY · D3.JS RETENTION OVERVIEW</span>
          </div>
          <h3 className={`${headingPrimaryClass} mt-1`}>
            Leitner Box Distribution &amp; Retention Progress
          </h3>
          <p className={`${mutedTextClass} mt-1`}>
            Live card distribution across the 5 spaced-repetition boxes—from daily recall (Box 1) to consolidated 14-day mastery (Box 5).
          </p>
        </div>

        {/* Weighted Retention Index Badge / Readout */}
        <div className={`${wellClass} shrink-0 flex items-center gap-3`}>
          <TrendingUp
            className="w-4 h-4 shrink-0"
            style={{ color: tokens.barColors[4] }}
          />
          <div>
            <div className={statLabelClass}>RETENTION INDEX</div>
            <div className={statValueClass}>{weightedProgress}%</div>
          </div>
        </div>
      </div>

      {/* 4 Compact Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={wellClass}>
          <div className={statLabelClass}>TOTAL DECK</div>
          <div className={statValueClass}>{totalCards}</div>
          <div className={mutedTextClass}>Active reframe cards</div>
        </div>
        <div className={wellClass}>
          <div className={statLabelClass}>DUE FOR REVIEW</div>
          <div className={statValueClass}>{dueTotal}</div>
          <div className={mutedTextClass}>Ready in practice queue</div>
        </div>
        <div className={wellClass}>
          <div className={statLabelClass}>BOX 4–5 CONSOLIDATED</div>
          <div className={statValueClass}>
            {masteredCount} <span className="text-xs font-semibold opacity-75">({masteryRate}%)</span>
          </div>
          <div className={mutedTextClass}>7d–14d long-term memory</div>
        </div>
        <div className={wellClass}>
          <div className={statLabelClass}>BOX 5 MASTERED</div>
          <div className={statValueClass}>{data[4]?.count ?? 0}</div>
          <div className={mutedTextClass}>Peak 14-day cadence</div>
        </div>
      </div>

      {/* D3 Bar Chart Plot Area */}
      <div className={chartPlotWellClass}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 px-1">
          <span
            className="text-[11px] font-mono uppercase tracking-wider font-semibold"
            style={{ color: tokens.subTextColor }}
          >
            CARDS PER LEITNER BOX (BOX 1 → BOX 5)
          </span>
          <span
            className="text-[11px] font-mono tabular-nums"
            style={{
              color: hoveredBox ? tokens.valueTextColor : tokens.subTextColor,
              fontWeight: hoveredBox ? 700 : 500,
            }}
          >
            {hoveredBox
              ? `${hoveredBox.label.toUpperCase()} (${hoveredBox.stage} · ${hoveredBox.intervalDays}d): ${hoveredBox.count} cards (${hoveredBox.percentage}%), ${hoveredBox.dueCount} due`
              : 'Hover a bar to inspect box cadence & due cards'}
          </span>
        </div>

        <div ref={containerRef} className="w-full overflow-hidden">
          <svg
            ref={svgRef}
            role="img"
            aria-label="Bar chart showing the number of cards in each of the 5 Leitner boxes"
            className="w-full block select-none"
          />
        </div>
      </div>

      {/* Color-keyed 5-Box Stage Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {data.map((item) => (
          <div
            key={item.box}
            className={`${wellClass} py-2.5 px-3 flex items-center justify-between gap-2 transition-all`}
            style={{
              borderColor:
                hoveredBox?.box === item.box ? tokens.barColors[item.box - 1] : undefined,
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 shrink-0 inline-block"
                style={{
                  backgroundColor: tokens.barColors[item.box - 1],
                  borderRadius: isBrutal || isEditorial ? '0px' : '2px',
                }}
              />
              <div className="min-w-0">
                <div
                  className="text-[11px] font-bold truncate"
                  style={{ color: tokens.tickTextColor }}
                >
                  {item.label}
                </div>
                <div
                  className="text-[10px] font-mono truncate"
                  style={{ color: tokens.subTextColor }}
                >
                  {item.intervalDays}d · {item.dueCount} due
                </div>
              </div>
            </div>
            <span
              className="text-xs font-mono font-bold tabular-nums shrink-0"
              style={{ color: tokens.valueTextColor }}
            >
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

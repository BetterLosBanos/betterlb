import { useMemo, useState } from 'react';

import {
  ChevronDown,
  ChevronUp,
  LucideIcon,
  Tag,
  Undo2,
  ZoomIn,
} from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
} from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';

import { formatPesoAdaptive } from '@/lib/format';

// --- Types ---

// Consolidated type: recursive details allow us to avoid 'any' casting
export interface ChartDataPoint {
  name: string;
  value: number;
  details?: ChartDataPoint[];
  color?: string;
  percent?: number;
}

interface FinancialPieChartProps {
  title: string;
  icon: LucideIcon;
  data: ChartDataPoint[];
  colors: string[];
}

// Recharts passes these props to custom labels
interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  x: number;
  name: string;
  value: number;
  fill: string;
}

// --- Custom Tooltip ---

const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const isDetail = !data.payload.details; // Detail items don't have sub-details

    return (
      <div className='border-kapwa-border-weak bg-kapwa-bg-surface z-50 rounded-lg border p-3 text-sm shadow-xl'>
        <div className='mb-1 flex items-center gap-2'>
          <span
            className='h-2 w-2 rounded-full'
            style={{ backgroundColor: data.payload.fill }}
          />
          <p className='text-kapwa-text-strong font-semibold'>{data.name}</p>
        </div>
        <p className='pl-4 font-mono font-medium text-kapwa-text-success'>
          {formatPesoAdaptive(data.value as number).fullString}
        </p>
        <p className='text-kapwa-text-disabled mt-1 pl-4 text-xs'>
          {((data.payload.percent || 0) * 100).toFixed(1)}% of total
        </p>
        {!isDetail && data.payload.details?.length > 0 && (
          <p className='mt-2 flex items-center gap-1 pl-4 text-[10px] font-medium text-kapwa-text-brand'>
            <ZoomIn className='h-3 w-3' /> Click to view breakdown
          </p>
        )}
      </div>
    );
  }
  return null;
};

// --- Spider Label Render Function ---

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  x,
  name,
  value,
  fill,
}: CustomLabelProps) => {
  // Hide label if slice is less than 3% to prevent clutter
  if (percent < 0.03) return null;

  // Determine text alignment based on position
  const textAnchor = x > cx ? 'start' : 'end';

  // Calculate connector line coordinates
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 1.25;
  const lx = cx + radius * Math.cos(-midAngle * RADIAN);
  const ly = cy + radius * Math.sin(-midAngle * RADIAN);

  const startRadius = outerRadius;
  const startX = cx + startRadius * Math.cos(-midAngle * RADIAN);
  const startY = cy + startRadius * Math.sin(-midAngle * RADIAN);

  const midRadius = outerRadius * 1.1;
  const midX = cx + midRadius * Math.cos(-midAngle * RADIAN);
  const midY = cy + midRadius * Math.sin(-midAngle * RADIAN);

  return (
    <g style={{ pointerEvents: 'none' }}>
      <path
        d={`M${startX},${startY} L${midX},${midY} L${lx},${ly}`}
        stroke={fill}
        strokeWidth={1}
        fill='none'
        opacity={0.4}
      />
      <text
        x={lx}
        y={ly}
        textAnchor={textAnchor}
        dy={-5}
        className='fill-[var(--color-kapwa-text-strong)] text-[10px] font-medium md:text-xs'
      >
        {name}
      </text>
      <text
        x={lx}
        y={ly}
        textAnchor={textAnchor}
        dy={10}
        className='fill-[var(--color-kapwa-text-support)] text-[10px]'
      >
        {formatPesoAdaptive(value).fullString} ({(percent * 100).toFixed(0)}%)
      </text>
    </g>
  );
};

// --- Main Component ---

export default function FinancialPieChart({
  title,
  icon: Icon,
  data,
  colors,
}: FinancialPieChartProps) {
  // State
  const [drillDownItem, setDrillDownItem] = useState<ChartDataPoint | null>(
    null
  );
  const [showBreakdownList, setShowBreakdownList] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  // Derived Data: Switch between Parents (Overview) and Children (Details)
  const activeData = useMemo(() => {
    if (drillDownItem && drillDownItem.details) {
      return drillDownItem.details.filter(d => d.value > 0);
    }
    return data.filter(d => d.value > 0);
  }, [drillDownItem, data]);

  // Handlers
  const onSliceClick = (entry: ChartDataPoint) => {
    if (!drillDownItem && entry.details && entry.details.length > 0) {
      setDrillDownItem(entry);
    }
  };

  const resetView = () => setDrillDownItem(null);

  const getFillColor = (index: number) => colors[index % colors.length];

  return (
    <Card className='border-kapwa-border-weak relative flex h-full flex-col overflow-hidden shadow-sm transition-all'>
      {/* --- Card Header --- */}
      <CardHeader className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex min-h-[60px] flex-row items-center justify-between border-b px-6 py-4'>
        <div className='flex items-center gap-3'>
          <div className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-lg border p-2 shadow-sm'>
            <Icon className='text-kapwa-text-support h-4 w-4' />
          </div>
          <div className='flex flex-col'>
            <span className='text-kapwa-text-strong leading-none font-semibold'>
              {drillDownItem ? drillDownItem.name : title}
            </span>
            {drillDownItem && (
              <span className='animate-in fade-in text-kapwa-text-disabled mt-1 text-[10px] font-medium tracking-wide uppercase'>
                Breakdown View
              </span>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {drillDownItem && (
            <button
              onClick={resetView}
              className='animate-in fade-in slide-in-from-right-2 border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support hover:bg-kapwa-bg-surface-raised mr-2 flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium'
            >
              <Undo2 className='h-3 w-3' /> Back
            </button>
          )}

          <button
            onClick={() => setShowLabels(!showLabels)}
            title='Toggle Labels'
            className={`rounded-md p-1.5 transition-colors ${
              showLabels
                ? 'bg-kapwa-bg-brand-weak text-kapwa-text-brand'
                : 'hover:bg-kapwa-bg-surface-raised text-kapwa-text-disabled'
            }`}
          >
            <Tag className='h-3.5 w-3.5' />
          </button>

          <button
            onClick={() => setShowBreakdownList(!showBreakdownList)}
            className='text-kapwa-text-disabled hover:text-kapwa-text-strong p-1 transition-colors'
            title='Toggle List'
          >
            {showBreakdownList ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </button>
        </div>
      </CardHeader>

      {/* --- Card Content --- */}
      <CardContent className='flex flex-1 flex-col p-6'>
        {/* Chart Container */}
        <div className='group relative h-[280px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart margin={{ top: 20, right: 40, left: 40, bottom: 20 }}>
              <Pie
                data={activeData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                cornerRadius={4}
                stroke='none'
                label={showLabels ? renderCustomizedLabel : undefined}
                labelLine={false}
                onClick={onSliceClick}
                minAngle={2}
                className={!drillDownItem ? 'cursor-pointer' : 'cursor-default'}
              >
                {activeData.map((entry, index) => {
                  const hasDetails = !drillDownItem && entry.details?.length;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={getFillColor(index)}
                      className={`transition-all duration-300 outline-none ${
                        hasDetails ? 'hover:opacity-80' : ''
                      }`}
                      style={{
                        cursor: hasDetails ? 'pointer' : 'default',
                      }}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'transparent' }}
                wrapperStyle={{ zIndex: 100 }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Overlay Button / Text */}
          <div className='pointer-events-none absolute inset-0 z-0 flex items-center justify-center'>
            {drillDownItem ? (
              <button
                onClick={resetView}
                className='group bg-kapwa-bg-surface-raised/0 hover:bg-kapwa-bg-surface-raised pointer-events-auto flex h-24 w-24 flex-col items-center justify-center rounded-full transition-colors'
              >
                <Undo2 className='text-kapwa-text-disabled group-hover:text-kapwa-text-support mb-1 h-5 w-5' />
                <span className='text-kapwa-text-disabled group-hover:text-kapwa-text-strong text-[10px] font-semibold tracking-widest uppercase'>
                  Return
                </span>
              </button>
            ) : (
              <div className='flex flex-col items-center justify-center'>
                <span className='text-kapwa-text-disabled text-[10px] font-medium tracking-widest uppercase'>
                  Total
                </span>
                <span className='text-kapwa-text-support mt-1 text-xs font-bold'>
                  {
                    formatPesoAdaptive(
                      activeData.reduce((acc, curr) => acc + curr.value, 0)
                    ).fullString
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown List */}
        {showBreakdownList && (
          <div className='animate-in fade-in slide-in-from-top-2 border-kapwa-border-weak mt-4 max-h-[200px] space-y-2 overflow-y-auto border-t pt-4 pr-2'>
            {activeData.map((item, index) => {
              const total = activeData.reduce(
                (acc, curr) => acc + curr.value,
                0
              );
              const percent = total > 0 ? (item.value / total) * 100 : 0;

              // Check if drill-down is possible
              // Because we defined details recursively, we don't need 'as any' anymore
              const canDrill =
                !drillDownItem && item.details && item.details.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => canDrill && onSliceClick(item)}
                  className={`group flex items-center justify-between rounded-md p-1.5 text-sm transition-colors ${
                    canDrill
                      ? 'hover:bg-kapwa-bg-surface-raised cursor-pointer'
                      : 'cursor-default'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <span
                      className='h-2.5 w-2.5 shrink-0 rounded-full'
                      style={{ backgroundColor: getFillColor(index) }}
                    />
                    <span
                      className={`text-kapwa-text-support transition-colors ${
                        canDrill
                          ? 'group-hover:font-medium group-hover:text-kapwa-text-success'
                          : ''
                      }`}
                    >
                      {item.name}
                    </span>
                    {canDrill && (
                      <ZoomIn className='text-kapwa-text-support h-3 w-3 group-hover:text-kapwa-text-success' />
                    )}
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='text-kapwa-text-strong font-medium'>
                      {formatPesoAdaptive(item.value).fullString}
                    </span>
                    <span className='text-kapwa-text-disabled w-10 text-right text-xs'>
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

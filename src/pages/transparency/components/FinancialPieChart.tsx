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

import { formatMillions } from '@/lib/format';

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
      <div className='z-50 rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-xl'>
        <div className='mb-1 flex items-center gap-2'>
          <span
            className='h-2 w-2 rounded-full'
            style={{ backgroundColor: data.payload.fill }}
          />
          <p className='font-semibold text-slate-800'>{data.name}</p>
        </div>
        <p className='pl-4 font-mono font-medium text-emerald-600'>
          {formatMillions(data.value as number)}
        </p>
        <p className='mt-1 pl-4 text-xs text-slate-500'>
          {((data.payload.percent || 0) * 100).toFixed(1)}% of total
        </p>
        {!isDetail && data.payload.details?.length > 0 && (
          <p className='mt-2 flex items-center gap-1 pl-4 text-[10px] font-medium text-indigo-500'>
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
        className='fill-slate-700 text-[10px] font-medium md:text-xs'
      >
        {name}
      </text>
      <text
        x={lx}
        y={ly}
        textAnchor={textAnchor}
        dy={10}
        className='fill-slate-500 text-[10px]'
      >
        {formatMillions(value)} ({(percent * 100).toFixed(0)}%)
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
    <Card className='relative flex h-full flex-col overflow-hidden border-slate-200 shadow-sm transition-all'>
      {/* --- Card Header --- */}
      <CardHeader className='flex min-h-[60px] flex-row items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4'>
        <div className='flex items-center gap-3'>
          <div className='rounded-lg border border-slate-200 bg-white p-2 shadow-sm'>
            <Icon className='h-4 w-4 text-slate-600' />
          </div>
          <div className='flex flex-col'>
            <span className='leading-none font-semibold text-slate-800'>
              {drillDownItem ? drillDownItem.name : title}
            </span>
            {drillDownItem && (
              <span className='animate-in fade-in mt-1 text-[10px] font-medium tracking-wide text-slate-500 uppercase'>
                Breakdown View
              </span>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {drillDownItem && (
            <button
              onClick={resetView}
              className='animate-in fade-in slide-in-from-right-2 mr-2 flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50'
            >
              <Undo2 className='h-3 w-3' /> Back
            </button>
          )}

          <button
            onClick={() => setShowLabels(!showLabels)}
            title='Toggle Labels'
            className={`rounded-md p-1.5 transition-colors ${
              showLabels
                ? 'bg-slate-200 text-slate-800'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Tag className='h-3.5 w-3.5' />
          </button>

          <button
            onClick={() => setShowBreakdownList(!showBreakdownList)}
            className='p-1 text-slate-400 transition-colors hover:text-slate-800'
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
                className='group pointer-events-auto flex h-24 w-24 flex-col items-center justify-center rounded-full bg-slate-50/0 transition-colors hover:bg-slate-50'
              >
                <Undo2 className='mb-1 h-5 w-5 text-slate-400 group-hover:text-slate-700' />
                <span className='text-[10px] font-semibold tracking-widest text-slate-500 uppercase group-hover:text-slate-800'>
                  Return
                </span>
              </button>
            ) : (
              <div className='flex flex-col items-center justify-center'>
                <span className='text-[10px] font-medium tracking-widest text-slate-400 uppercase'>
                  Total
                </span>
                <span className='mt-1 text-xs font-bold text-slate-700'>
                  {formatMillions(
                    activeData.reduce((acc, curr) => acc + curr.value, 0)
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Breakdown List */}
        {showBreakdownList && (
          <div className='animate-in fade-in slide-in-from-top-2 mt-4 max-h-[200px] space-y-2 overflow-y-auto border-t border-slate-100 pt-4 pr-2'>
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
                      ? 'cursor-pointer hover:bg-slate-50'
                      : 'cursor-default'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <span
                      className='h-2.5 w-2.5 flex-shrink-0 rounded-full'
                      style={{ backgroundColor: getFillColor(index) }}
                    />
                    <span
                      className={`text-slate-600 transition-colors ${
                        canDrill
                          ? 'group-hover:font-medium group-hover:text-emerald-700'
                          : ''
                      }`}
                    >
                      {item.name}
                    </span>
                    {canDrill && (
                      <ZoomIn className='h-3 w-3 text-slate-300 group-hover:text-emerald-500' />
                    )}
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='font-medium text-slate-900'>
                      {formatMillions(item.value)}
                    </span>
                    <span className='w-10 text-right text-xs text-slate-400'>
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

import { useState, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import {
  LucideIcon,
  ChevronDown,
  ChevronUp,
  Tag,
  Undo2,
  ZoomIn,
} from 'lucide-react';
import { formatMillions } from '@/utils/format';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

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
      <div className='bg-white border border-slate-200 p-3 rounded-lg shadow-xl text-sm z-50'>
        <div className='flex items-center gap-2 mb-1'>
          <span
            className='w-2 h-2 rounded-full'
            style={{ backgroundColor: data.payload.fill }}
          />
          <p className='font-semibold text-slate-800'>{data.name}</p>
        </div>
        <p className='font-mono text-emerald-600 font-medium pl-4'>
          {formatMillions(data.value as number)}
        </p>
        <p className='text-xs text-slate-500 mt-1 pl-4'>
          {((data.payload.percent || 0) * 100).toFixed(1)}% of total
        </p>
        {!isDetail && data.payload.details?.length > 0 && (
          <p className='text-[10px] text-indigo-500 font-medium mt-2 pl-4 flex items-center gap-1'>
            <ZoomIn className='w-3 h-3' /> Click to view breakdown
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
        className='text-[10px] md:text-xs font-medium fill-slate-700'
      >
        {name}
      </text>
      <text
        x={lx}
        y={ly}
        textAnchor={textAnchor}
        dy={10}
        className='text-[10px] fill-slate-500'
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
    <Card className='border-slate-200 shadow-sm flex flex-col h-full relative overflow-hidden transition-all'>
      {/* --- Card Header --- */}
      <CardHeader className='flex flex-row justify-between items-center py-4 px-6 border-b border-slate-100 bg-slate-50/50 min-h-[60px]'>
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-white border border-slate-200 rounded-lg shadow-sm'>
            <Icon className='w-4 h-4 text-slate-600' />
          </div>
          <div className='flex flex-col'>
            <span className='font-semibold text-slate-800 leading-none'>
              {drillDownItem ? drillDownItem.name : title}
            </span>
            {drillDownItem && (
              <span className='text-[10px] text-slate-500 uppercase tracking-wide font-medium mt-1 animate-in fade-in'>
                Breakdown View
              </span>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {drillDownItem && (
            <button
              onClick={resetView}
              className='flex items-center gap-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded-md hover:bg-slate-50 mr-2 animate-in fade-in slide-in-from-right-2'
            >
              <Undo2 className='w-3 h-3' /> Back
            </button>
          )}

          <button
            onClick={() => setShowLabels(!showLabels)}
            title='Toggle Labels'
            className={`p-1.5 rounded-md transition-colors ${
              showLabels
                ? 'bg-slate-200 text-slate-800'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
          >
            <Tag className='w-3.5 h-3.5' />
          </button>

          <button
            onClick={() => setShowBreakdownList(!showBreakdownList)}
            className='text-slate-400 hover:text-slate-800 transition-colors p-1'
            title='Toggle List'
          >
            {showBreakdownList ? (
              <ChevronUp className='w-4 h-4' />
            ) : (
              <ChevronDown className='w-4 h-4' />
            )}
          </button>
        </div>
      </CardHeader>

      {/* --- Card Content --- */}
      <CardContent className='p-6 flex-1 flex flex-col'>
        {/* Chart Container */}
        <div className='h-[280px] w-full relative group'>
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
          <div className='absolute inset-0 flex items-center justify-center pointer-events-none z-0'>
            {drillDownItem ? (
              <button
                onClick={resetView}
                className='pointer-events-auto flex flex-col items-center justify-center w-24 h-24 rounded-full bg-slate-50/0 hover:bg-slate-50 transition-colors group'
              >
                <Undo2 className='w-5 h-5 text-slate-400 group-hover:text-slate-700 mb-1' />
                <span className='text-[10px] font-semibold text-slate-500 group-hover:text-slate-800 uppercase tracking-widest'>
                  Return
                </span>
              </button>
            ) : (
              <div className='flex flex-col items-center justify-center'>
                <span className='text-[10px] font-medium text-slate-400 uppercase tracking-widest'>
                  Total
                </span>
                <span className='text-xs font-bold text-slate-700 mt-1'>
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
          <div className='mt-4 border-t border-slate-100 pt-4 space-y-2 max-h-[200px] overflow-y-auto pr-2 animate-in fade-in slide-in-from-top-2'>
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
                  className={`flex items-center justify-between text-sm group rounded-md p-1.5 transition-colors ${
                    canDrill
                      ? 'cursor-pointer hover:bg-slate-50'
                      : 'cursor-default'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    <span
                      className='w-2.5 h-2.5 rounded-full flex-shrink-0'
                      style={{ backgroundColor: getFillColor(index) }}
                    />
                    <span
                      className={`text-slate-600 transition-colors ${
                        canDrill
                          ? 'group-hover:text-emerald-700 group-hover:font-medium'
                          : ''
                      }`}
                    >
                      {item.name}
                    </span>
                    {canDrill && (
                      <ZoomIn className='w-3 h-3 text-slate-300 group-hover:text-emerald-500' />
                    )}
                  </div>
                  <div className='flex items-center gap-3'>
                    <span className='text-slate-900 font-medium'>
                      {formatMillions(item.value)}
                    </span>
                    <span className='text-xs text-slate-400 w-10 text-right'>
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

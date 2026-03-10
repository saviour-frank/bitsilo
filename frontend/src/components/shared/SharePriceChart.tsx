import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_SHARE_PRICE_HISTORY_90D } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Range = '7d' | '30d' | '90d';

const RANGE_CONFIG: Record<Range, { days: number; interval: number }> = {
  '7d': { days: 7, interval: 1 },
  '30d': { days: 30, interval: 6 },
  '90d': { days: 90, interval: 14 },
};

interface SharePriceChartProps {
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-surface-3 px-3 py-2 shadow-elevated">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono text-sm font-semibold text-foreground">
        ₿{payload[0].value.toFixed(6)}
      </p>
    </div>
  );
};

export function SharePriceChart({ className }: SharePriceChartProps) {
  const [range, setRange] = useState<Range>('30d');
  const allData = MOCK_SHARE_PRICE_HISTORY_90D;

  const { data, config } = useMemo(() => {
    const cfg = RANGE_CONFIG[range];
    return { data: allData.slice(-cfg.days), config: cfg };
  }, [range, allData]);

  const minPrice = Math.min(...data.map(d => d.price));
  const maxPrice = Math.max(...data.map(d => d.price));
  const padding = (maxPrice - minPrice) * 0.2;
  const pctChange = ((data[data.length - 1].price / data[0].price - 1) * 100).toFixed(3);

  return (
    <div className={className}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Share Price — {range}
        </h3>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-success">+{pctChange}%</span>
          <div className="flex rounded-full bg-surface-3 p-0.5">
            {(['7d', '30d', '90d'] as Range[]).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150',
                  range === r
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={range}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="sharePriceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(33, 93%, 54%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(33, 93%, 54%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: 'hsl(240, 5%, 55%)' }}
                axisLine={false}
                tickLine={false}
                interval={config.interval}
              />
              <YAxis
                domain={[minPrice - padding, maxPrice + padding]}
                tick={{ fontSize: 10, fill: 'hsl(240, 5%, 55%)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v.toFixed(4)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(33, 93%, 54%)"
                strokeWidth={2}
                fill="url(#sharePriceGradient)"
                dot={false}
                activeDot={{ r: 4, fill: 'hsl(33, 93%, 54%)', stroke: 'hsl(240, 6%, 10%)', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  REQUEST_STATUS_LABELS,
  WASTE_TYPE_LABELS,
  type RequestStatus,
  type WasteType
} from "@/lib/schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CompletionRateAnalytics, MonthlyTrend, WasteTypeAnalytics } from "@/lib/admin";

type StatusDistributionEntry = {
  status: RequestStatus;
  count: number;
};

type AnalyticsChartsProps = {
  statusDistribution: StatusDistributionEntry[];
  wasteTypes: WasteTypeAnalytics[];
  monthlyTrends: MonthlyTrend[];
  completionRate: CompletionRateAnalytics;
};

const chartPalette = {
  primary: "hsl(158 64% 28%)",
  secondary: "hsl(45 88% 62%)",
  accent: "hsl(196 56% 52%)",
  danger: "hsl(0 72% 51%)",
  muted: "hsl(155 8% 48%)"
};

const wasteTypeColors: Record<WasteType, string> = {
  HOUSEHOLD: chartPalette.primary,
  RECYCLABLE: chartPalette.accent,
  ORGANIC: chartPalette.secondary
};

const statusColors: Record<RequestStatus, string> = {
  PENDING: chartPalette.secondary,
  ASSIGNED: chartPalette.accent,
  SCHEDULED: chartPalette.primary,
  IN_PROGRESS: chartPalette.muted,
  COLLECTED: chartPalette.danger
};

export function AnalyticsCharts({
  statusDistribution,
  wasteTypes,
  monthlyTrends,
  completionRate
}: AnalyticsChartsProps) {
  const statusData = statusDistribution.map((entry) => ({
    status: REQUEST_STATUS_LABELS[entry.status],
    count: entry.count,
    fill: statusColors[entry.status]
  }));
  const wasteTypeData = wasteTypes.map((entry) => ({
    wasteType: WASTE_TYPE_LABELS[entry.wasteType],
    count: entry.count,
    percentage: entry.percentage,
    fill: wasteTypeColors[entry.wasteType]
  }));
  const hasWasteTypeData = wasteTypes.some((entry) => entry.count > 0);
  const completionData = [
    {
      label: "Completed",
      value: completionRate.completedRequests,
      fill: chartPalette.primary
    },
    {
      label: "Outstanding",
      value: completionRate.outstandingRequests,
      fill: chartPalette.secondary
    }
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={10} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke={chartPalette.primary}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="collected"
                    name="Collected"
                    stroke={chartPalette.accent}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="pending"
                    name="Pending"
                    stroke={chartPalette.secondary}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Rate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    dataKey="value"
                    nameKey="label"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={4}
                  >
                    {completionData.map((entry) => (
                      <Cell key={entry.label} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{completionRate.completedRequests}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-medium">{completionRate.outstandingRequests}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">{completionRate.completionRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={10} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={10} />
                  <Tooltip />
                  <Bar dataKey="count" name="Requests" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waste Type Mix</CardTitle>
          </CardHeader>
          <CardContent>
            {hasWasteTypeData ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wasteTypeData}
                      dataKey="count"
                      nameKey="wasteType"
                      innerRadius={56}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {wasteTypeData.map((entry) => (
                        <Cell key={entry.wasteType} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                No request data for the selected filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

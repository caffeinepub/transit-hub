import {
  BarChart3,
  ChevronRight,
  FileText,
  IndianRupee,
  MapPin,
  Receipt,
  TicketCheck,
  Train,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dashboardData, formatMonthLabel } from "../data/dashboardData";

const CHART_COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
  "#06b6d4",
  "#3b82f6",
  "#84cc16",
];

type NavItem = "overview" | "clients" | "routes" | "finance";

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState<NavItem>("overview");

  const trendData = dashboardData.monthlyTrend.map((d) => ({
    ...d,
    label: formatMonthLabel(d.month),
    revenueLakh: Number.parseFloat((d.revenue / 100000).toFixed(2)),
  }));

  const maxRoute = dashboardData.topRoutes[0].count;

  const navItems: { id: NavItem; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <BarChart3 size={18} /> },
    { id: "clients", label: "Clients", icon: <Users size={18} /> },
    { id: "routes", label: "Routes", icon: <MapPin size={18} /> },
    { id: "finance", label: "Finance", icon: <IndianRupee size={18} /> },
  ];

  const quotaColors = ["#6366f1", "#f59e0b", "#f43f5e"];
  const quotaTotal = dashboardData.quotaUsed.reduce((a, b) => a + b.value, 0);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
        <div className="px-6 py-6 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Train size={16} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">
                TrainBook
              </p>
              <p className="text-slate-400 text-xs">Analytics</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
              {activeNav === item.id && (
                <ChevronRight size={14} className="ml-auto" />
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-slate-700">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-3">
            Data Summary
          </p>
          <div className="space-y-2">
            {[
              { label: "Period", value: "Apr '25 – Mar '26" },
              { label: "Clients", value: "10" },
              { label: "Routes", value: "12" },
              { label: "Coach Types", value: "8" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-slate-400 text-xs">{item.label}</span>
                <span className="text-slate-200 text-xs font-medium">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Train Booking Analytics Dashboard
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              April 2025 – March 2026 &nbsp;·&nbsp; 15,541 Bookings
            </p>
          </div>
          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold px-3 py-1.5 rounded-full">
            Apr 2025 – Mar 2026
          </span>
        </header>

        <div className="px-8 py-6 space-y-6">
          {/* KPI Cards */}
          <section data-ocid="kpi.section">
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <KpiCard
                label="Total Bookings"
                value="15,541"
                icon={<TicketCheck size={20} />}
                accent="border-indigo-500"
                iconBg="bg-indigo-50 text-indigo-600"
                sub="FY 2025-26"
              />
              <KpiCard
                label="Total Revenue"
                value="₹2.42 Cr"
                icon={<IndianRupee size={20} />}
                accent="border-emerald-500"
                iconBg="bg-emerald-50 text-emerald-600"
                sub="+8.2% YoY"
              />
              <KpiCard
                label="Total Profit"
                value="₹25.1 L"
                icon={<TrendingUp size={20} />}
                accent="border-amber-500"
                iconBg="bg-amber-50 text-amber-600"
                sub="10.4% margin"
              />
              <KpiCard
                label="Cancellation Rate"
                value="3.6%"
                icon={<XCircle size={20} />}
                accent="border-rose-500"
                iconBg="bg-rose-50 text-rose-600"
                sub="558 cancelled"
              />
              <KpiCard
                label="Avg Ticket Price"
                value="₹1,558"
                icon={<Receipt size={20} />}
                accent="border-violet-500"
                iconBg="bg-violet-50 text-violet-600"
                sub="Per booking"
              />
            </div>
          </section>

          {/* Monthly Trend */}
          <section data-ocid="trend.section">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="mb-4">
                <h2 className="text-base font-semibold text-slate-800">
                  Monthly Booking & Revenue Trend
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Bookings count vs Revenue (₹ Lakhs)
                </p>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart
                  data={trendData}
                  margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${v}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(value: number, name: string) =>
                      name === "Revenue (₹L)"
                        ? [`₹${value}L`, name]
                        : [value.toLocaleString(), name]
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenueLakh"
                    name="Revenue (₹L)"
                    fill="#e0e7ff"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={0.5}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="bookings"
                    name="Bookings"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#10b981" }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Clients + Coach Types */}
          <section
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            data-ocid="clients.section"
          >
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-1">
                Top Clients by Bookings
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Top 10 corporate accounts
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  layout="vertical"
                  data={dashboardData.topClients}
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={130}
                    tick={{ fontSize: 10, fill: "#475569" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [v.toLocaleString(), "Bookings"]}
                  />
                  <Bar dataKey="bookings" radius={[0, 4, 4, 0]}>
                    {dashboardData.topClients.map((client, i) => (
                      <Cell
                        key={client.name}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-1">
                Coach Type Distribution
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Bookings by coach class
              </p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={220}>
                  <PieChart>
                    <Pie
                      data={dashboardData.coachTypes}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dashboardData.coachTypes.map((coach, i) => (
                        <Cell
                          key={coach.name}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [
                        v.toLocaleString(),
                        "Bookings",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-1.5">
                  {dashboardData.coachTypes.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          background: CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-xs text-slate-600 flex-1 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Quota + Booking Status */}
          <section
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            data-ocid="quota.section"
          >
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-1">
                Quota Used
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                General vs Tatkal breakdown
              </p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={180}>
                  <PieChart>
                    <Pie
                      data={dashboardData.quotaUsed}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {dashboardData.quotaUsed.map((quota, i) => (
                        <Cell key={quota.name} fill={quotaColors[i]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [v.toLocaleString(), "Tickets"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {dashboardData.quotaUsed.map((item, i) => {
                    const pct = ((item.value / quotaTotal) * 100).toFixed(1);
                    return (
                      <div key={item.name}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium text-slate-700">
                            {item.name}
                          </span>
                          <span className="text-xs text-slate-500">{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: quotaColors[i],
                            }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {item.value.toLocaleString()} tickets
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 mb-1">
                Booking Status
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Invoice status distribution
              </p>
              <div className="flex items-center justify-around">
                <ResponsiveContainer width="55%" height={200}>
                  <PieChart>
                    <Pie
                      data={dashboardData.bookingStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f43f5e" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [
                        v.toLocaleString(),
                        "Bookings",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span className="text-xs text-slate-600">
                        Invoice Created
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">14,983</p>
                    <p className="text-xs text-slate-500">96.4%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-3 h-3 rounded-full bg-rose-500" />
                      <span className="text-xs text-slate-600">Cancelled</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">558</p>
                    <p className="text-xs text-slate-500">3.6%</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Top Routes Table */}
          <section data-ocid="routes.section">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">
                    Top Routes
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Most booked city pairs
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  Top 12
                </span>
              </div>
              <div className="overflow-hidden rounded-lg border border-slate-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-10">
                        #
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-24">
                        Bookings
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboardData.topRoutes.map((r, i) => {
                      const pct = (r.count / maxRoute) * 100;
                      return (
                        <tr
                          key={r.route}
                          data-ocid={`routes.item.${i + 1}`}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}
                            >
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-medium">
                            {r.route}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">
                            {r.count}
                          </td>
                          <td className="px-4 py-3 w-48">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-400"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Bill Status */}
          <section data-ocid="billing.section">
            <h2 className="text-base font-semibold text-slate-800 mb-3">
              Billing Status
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {(
                [
                  {
                    label: "Unbilled",
                    value: 9931,
                    color: "border-amber-500",
                    bg: "bg-amber-50",
                    text: "text-amber-700",
                    icon: <FileText size={20} />,
                  },
                  {
                    label: "Billed",
                    value: 5497,
                    color: "border-emerald-500",
                    bg: "bg-emerald-50",
                    text: "text-emerald-700",
                    icon: <TicketCheck size={20} />,
                  },
                  {
                    label: "Pending Verification",
                    value: 113,
                    color: "border-violet-500",
                    bg: "bg-violet-50",
                    text: "text-violet-700",
                    icon: <Receipt size={20} />,
                  },
                ] as const
              ).map((item, i) => (
                <div
                  key={item.label}
                  data-ocid={`billing.item.${i + 1}`}
                  className={`bg-white rounded-xl border border-slate-200 border-l-4 ${item.color} p-5 shadow-sm`}
                >
                  <div
                    className={`w-10 h-10 ${item.bg} ${item.text} rounded-lg flex items-center justify-center mb-3`}
                  >
                    {item.icon}
                  </div>
                  <p className="text-2xl font-bold text-slate-800">
                    {item.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          <footer className="text-center py-4 text-xs text-slate-400">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:underline"
            >
              caffeine.ai
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  accent,
  iconBg,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
  sub?: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 border-l-4 ${accent} p-5 shadow-sm`}
    >
      <div
        className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center mb-3`}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}

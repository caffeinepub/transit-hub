export const dashboardData = {
  kpis: {
    totalBookings: 15541,
    totalRevenue: 24218319,
    totalProfit: 2514590,
    cancellationRate: 3.6,
    cancelledCount: 558,
    activeCount: 14983,
    avgTicketPrice: 1558,
  },
  monthlyTrend: [
    { month: "2025-04", bookings: 1146, revenue: 1855103 },
    { month: "2025-05", bookings: 1089, revenue: 1853594 },
    { month: "2025-06", bookings: 1102, revenue: 1737115 },
    { month: "2025-07", bookings: 1366, revenue: 1954807 },
    { month: "2025-08", bookings: 1139, revenue: 1790474 },
    { month: "2025-09", bookings: 1442, revenue: 2150694 },
    { month: "2025-10", bookings: 1251, revenue: 1802763 },
    { month: "2025-11", bookings: 1498, revenue: 2245743 },
    { month: "2025-12", bookings: 1453, revenue: 2424241 },
    { month: "2026-01", bookings: 1557, revenue: 2358239 },
    { month: "2026-02", bookings: 1350, revenue: 2027270 },
    { month: "2026-03", bookings: 1148, revenue: 2018277 },
  ],
  topClients: [
    { name: "TCS", bookings: 8582, revenue: 13295046 },
    { name: "Innovatiview India Limited", bookings: 2536, revenue: 3831795 },
    { name: "Oxyzo Financial Services", bookings: 1675, revenue: 2585636 },
    { name: "OFB TECH PRIVATE LIMITED", bookings: 1072, revenue: 1599764 },
    { name: "HINIROG HEALTHTECH", bookings: 367, revenue: 474297 },
    { name: "CENTRICITY FINANCIAL", bookings: 243, revenue: 488296 },
    { name: "Gold Plus Glass Industry", bookings: 209, revenue: 308500 },
    { name: "Stellaris Specialities", bookings: 121, revenue: 237036 },
    { name: "APPLIED ELECTRO MAGNETICS", bookings: 86, revenue: 153773 },
    { name: "OMAT WEST LIMITED", bookings: 86, revenue: 148199 },
  ],
  coachTypes: [
    { name: "Third AC (3A)", value: 6900 },
    { name: "Chair Car (CC)", value: 4794 },
    { name: "Second AC (2A)", value: 2052 },
    { name: "Executive Class (EC)", value: 783 },
    { name: "Third AC Economy (3E)", value: 466 },
    { name: "Sleeper (SL)", value: 300 },
    { name: "First AC (1A)", value: 161 },
    { name: "Second Sitting (2S)", value: 73 },
  ],
  bookingStatus: [
    { name: "Invoice Created", value: 14983 },
    { name: "Invoice Cancelled", value: 558 },
  ],
  quotaUsed: [
    { name: "General", value: 9621 },
    { name: "Tatkal", value: 4778 },
    { name: "Premium Tatkal", value: 1142 },
  ],
  topRoutes: [
    { route: "Ahmedabad Jn → Surat", count: 147 },
    { route: "New Delhi → Chandigarh", count: 133 },
    { route: "Chandigarh → New Delhi", count: 127 },
    { route: "Surat → Ahmedabad Jn", count: 114 },
    { route: "New Delhi → Jaipur", count: 91 },
    { route: "Patna Jn → Gaya Jn", count: 87 },
    { route: "Prayagraj → New Delhi", count: 86 },
    { route: "New Delhi → Prayagraj", count: 74 },
    { route: "Jodhpur Jn → Jaipur", count: 72 },
    { route: "Jaipur → New Delhi", count: 70 },
    { route: "Gurgaon → Jaipur", count: 68 },
    { route: "New Delhi → Lucknow", count: 67 },
  ],
  billStatus: [
    { name: "Unbilled", value: 9931 },
    { name: "Billed", value: 5497 },
    { name: "Pending Verification", value: 113 },
  ],
};

export function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

export function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[Number.parseInt(m) - 1]} '${year.slice(2)}`;
}

# Train Booking Dashboard

## Current State
Project has an existing engagement invitation site. A new dashboard is being built based on uploaded CSV data.

## Requested Changes (Diff)

### Add
- Full-screen analytics dashboard for Train Booking Service data
- KPI cards: Total Bookings, Total Revenue, Total Profit, Cancellation Rate
- Monthly bookings & revenue trend line chart
- Top 10 clients bar chart
- Coach type distribution donut chart
- Booking status pie chart (Invoice Created vs Cancelled)
- Quota used breakdown (General, Tatkal, Premium Tatkal)
- Top routes table
- Interactive filters: by client, booking status, date range
- Bill status breakdown

### Modify
- App.tsx to render dashboard instead of engagement invitation

### Remove
- Nothing from existing invitation (this is a separate project context)

## Implementation Plan
1. Embed pre-processed CSV data as static JSON in the frontend
2. Build dashboard layout with sidebar nav and main content area
3. Use Recharts for all charts
4. KPI summary cards at the top
5. Charts grid below
6. Routes table with pagination
7. Filter controls

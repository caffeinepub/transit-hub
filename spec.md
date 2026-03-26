# Travel Services Analytics Dashboard

## Current State
A Train Booking Analytics Dashboard exists with KPI cards, monthly trend chart, top clients, coach types, quota used, booking status, top routes, and billing status. Navigation sidebar has 4 tabs (Overview, Clients, Routes, Finance) but they don't switch content. Only train data exists.

## Requested Changes (Diff)

### Add
- Flight service dashboard tab with relevant KPIs: total flights booked, revenue, cancellation rate, avg fare, popular airlines, top routes (city pairs), booking class distribution, monthly trend
- Bus service dashboard tab: total trips, revenue, popular operators, top routes, seat types, monthly trend
- Hotel service dashboard tab: total nights booked, revenue, avg nightly rate, popular hotels/cities, room types, monthly trend
- Service selector at top level (Train / Flight / Bus / Hotel) as tabs
- Realistic mock data for flight, bus, and hotel in dashboardData.ts

### Modify
- Sidebar nav buttons (Overview, Clients, Routes, Finance) to actually switch content sections within each service tab
- Dashboard title and branding to reflect "Travel Services Dashboard" covering all 4 service types
- Each service gets its own color accent (Train=indigo, Flight=sky, Bus=emerald, Hotel=amber)

### Remove
- Nothing removed

## Implementation Plan
1. Extend dashboardData.ts with flightData, busData, hotelData objects with monthly trends, top routes, operators/airlines, class distributions, KPIs
2. Refactor DashboardPage.tsx to have a top service tab bar (Train/Flight/Bus/Hotel)
3. For each service, render relevant KPIs and charts based on activeNav (Overview/Clients/Routes/Finance)
4. Wire all sidebar nav buttons to filter content sections

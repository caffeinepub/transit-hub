# Train Booking Dashboard

## Current State
Empty workspace — full rebuild required.

## Requested Changes (Diff)

### Add
- Full analytics dashboard with 4 service tabs: Train, Flight, Bus, Hotel
- Sidebar with Overview, Clients, Routes, Finance navigation buttons (all enabled)
- Overview tab showing all KPIs, monthly trend, top clients, category distribution, top routes, financial summary with profit for all 4 services
- Per-service dashboards with service-specific color themes
- Export to Excel button that downloads all service data as a formatted multi-sheet Excel file with embedded charts
- Excel-style UI (ribbon toolbar, formula bar, sheet tabs at bottom)

### Modify
- N/A (new build)

### Remove
- N/A (new build)

## Implementation Plan
1. Generate Motoko backend with basic state
2. Build frontend with all 4 service tabs, sidebar navigation, charts using recharts, and Export to Excel using xlsx library
3. Include Excel-style UI chrome (ribbon, formula bar, sheet tabs)
4. Export includes formatted sheets with charts for all services

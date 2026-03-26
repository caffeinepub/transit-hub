# Train Booking Dashboard

## Current State
Interactive analytics dashboard with sidebar navigation (Train/Flight/Bus/Hotel tabs + Overview/Clients/Routes/Finance nav), KPI cards, recharts charts (bar, area, pie, composed), and Export to Excel feature. Uses a dark slate sidebar with colored accents per service.

## Requested Changes (Diff)

### Add
- Excel-inspired UI styling: ribbon-like toolbar at top, Excel green (#217346) as primary accent, grid/cell-like card layouts, spreadsheet-style table borders, Excel-like button styles (flat, bordered, with icons)
- Excel-style ribbon toolbar with action buttons (Export, Refresh, Filter, Print-style buttons)
- Excel-style tab strip for service switching (looks like Excel sheet tabs at the bottom or top)
- Grid-lined background/panel for charts (mimicking Excel chart area styling)
- Spreadsheet-like data tables with alternating rows, borders, header row styling matching Excel
- Excel-style KPI cards with cell borders and header labels
- Excel formula-bar-like display for key metrics

### Modify
- Overall color theme: shift to Excel green (#217346) primary, white background, gray grid lines
- Sidebar: replace dark slate with Excel-style white/light gray panel with green accents
- Buttons: flat Excel-style with borders, hover states matching Excel ribbon buttons
- Charts: add Excel-style chart borders, gridlines, and labels
- Navigation: Excel sheet-tab style for service switching
- KPI cards: Excel cell-style with visible borders and header labels

### Remove
- Dark slate sidebar background (replace with light Excel-style)

## Implementation Plan
1. Restyle DashboardPage.tsx entirely with Excel UI theme
2. Implement ribbon toolbar at top with Export and action buttons in Excel style
3. Replace service tabs with Excel sheet-tab style strip
4. Restyle sidebar/nav with Excel light theme and green accents
5. Restyle KPI cards as Excel cells with borders
6. Add Excel-style gridlines and borders to chart containers
7. Restyle data tables to match Excel spreadsheet look
8. Keep all existing functionality (charts, export, navigation) intact

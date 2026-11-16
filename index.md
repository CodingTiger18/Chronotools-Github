# ChronoTools – World Time Zone Converter & Meeting Planner

> The precision chronology and distributed scheduling suite for remote teams, financial traders, and international travelers.

- **Canonical URL**: https://chronotools.online/
- **Publisher**: ChronoTools Online
- **Support**: support@chronotools.online
- **License / Data**: IANA tzdb / GeoNames CC BY 4.0

---

## 1. World Time Converter & 24-Hour Ribbon
ChronoTools renders a synchronized 24-hour visual ribbon across multiple cities. Rather than calculating offsets mentally, users scrub across 24 hourly increments to see instantaneous local times in every configured city.

### Features
- **Visual Day/Night/Business Status**:
  - Green (9:00 AM - 5:00 PM): Active business hours.
  - Amber (7:00 AM - 9:00 AM & 5:00 PM - 9:00 PM): Shoulder / waking hours.
  - Indigo/Slate (9:00 PM - 7:00 AM): Night / sleep hours.
- **Overlap Detection**: Automatically computes "Golden Hours" when all selected locations share mutual business or waking availability.
- **Instant Calendar Invites**: Exports compliant `.ics` calendar files and one-click copyable multi-city text summaries for Slack and Microsoft Teams.

---

## 2. ISO 8601 Calendar Week Number Tracker
- **Definition**: ISO 8601 specifies Monday as the first day of the week. Week 1 of any year is defined as the week containing the first Thursday of that year (or containing January 4).
- **Customizable Start Day**: Supports Monday (ISO 8601 standard, EU/international), Sunday (US, Canada, Japan), and Saturday (Middle East).
- **Calculation Algorithm**:
  `Target Thursday = Date + (3 - ((DayOfWeek + 6) % 7))`
  `Week Number = 1 + round(((Target Thursday - Jan 1) / 86400000 - 3 + ((Jan 1 DayOfWeek + 6) % 7)) / 7)`

---

## 3. Global Financial Market Hours
Live opening, trading, and closing bells across major international stock exchanges:
- **New York Stock Exchange (NYSE / NASDAQ)**: 09:30 - 16:00 America/New_York (UTC-5 / UTC-4 EDT)
- **London Stock Exchange (LSE)**: 08:00 - 16:30 Europe/London (UTC+0 / UTC+1 BST)
- **Tokyo Stock Exchange (TSE / Nikkei)**: 09:00 - 15:30 Asia/Tokyo (UTC+9)
- **Hong Kong Stock Exchange (HKEX)**: 09:30 - 16:00 Asia/Hong_Kong (UTC+8)
- **National Stock Exchange of India (NSE)**: 09:15 - 15:30 Asia/Kolkata (UTC+5:30)

---

## 4. Two-City Time Difference & Circadian Mitigation
- Evaluates directional offset: whether City A is ahead or behind City B.
- Half-hour and 45-minute non-standard offsets (e.g. UTC+5:30 IST, UTC+9:30 ACST, UTC+5:45 NPT) are computed with minute-level precision.
- Calculates transmeridian circadian disruption index and suggests strategic light exposure and melatonin timing.

---

## 5. Unix Epoch Timestamp Utility
- Reference Epoch: Thursday, 1 January 1970 00:00:00 UTC.
- Seconds vs Milliseconds conversion:
  - 10-digit integers indicate seconds since epoch.
  - 13-digit integers indicate milliseconds since epoch.
- Fully supports ISO 8601 strings, RFC 2822 dates, and relative time representations.

---

## 6. Machine-Readable Agent Tooling (MCP / WebMCP)
Autonomous agents can invoke ChronoTools capabilities via:
- Model Context Protocol (MCP) server descriptor: `https://chronotools.online/.well-known/mcp.json`
- In-browser WebMCP tool catalogue: `https://chronotools.online/.well-known/webmcp.json`
- In-browser runtime: `window.__mcp_tools__`

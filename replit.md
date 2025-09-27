# Beer Consumption Dashboard

## Overview
A Next.js beer consumption dashboard application imported from v0.app. This app displays beer consumption statistics and leaderboards by connecting to a Google Sheets data source. The project is now fully configured to run in the Replit environment.

## Project Architecture
- **Framework**: Next.js 14.2.16 with TypeScript
- **Styling**: Tailwind CSS with custom UI components
- **Frontend**: React with client-side data fetching
- **Backend**: Next.js API routes (`/api/sheets`)
- **Data Source**: Google Sheets API integration
- **UI Components**: Radix UI components with custom styling

## Configuration
- **Development Server**: Configured to run on port 5000 with 0.0.0.0 hostname
- **Deployment**: Configured for autoscale deployment target
- **Host Verification**: Disabled for Replit environment compatibility
- **Build**: Standard Next.js build process

## Environment Variables Required
- `GOOGLE_SHEETS_API_KEY`: Required for Google Sheets API access (currently not configured)

## Features
- Real-time beer consumption statistics
- User leaderboard with consumption rankings
- External form integration for adding entries
- Responsive design with dark theme
- Beer and liter consumption tracking
- Daily average calculations

## Recent Changes (September 27, 2025)
- Imported from GitHub and configured for Replit environment
- Modified next.config.mjs for host verification bypass
- Set up development workflow on port 5000
- Configured deployment settings for autoscale
- All dependencies installed and application tested

## Current Status
Application is running successfully in development mode. Frontend displays correctly with placeholder data when Google Sheets API key is not configured. Backend API endpoints are functional but return errors without proper API credentials.

## Next Steps for User
1. Obtain a Google Sheets API key from Google Cloud Console
2. Add the API key as a secret named `GOOGLE_SHEETS_API_KEY`
3. The application will automatically connect to the specified Google Sheet and display real data

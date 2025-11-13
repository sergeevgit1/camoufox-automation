# Design Ideas for Camoufox Browser Automation

## Design Style
**Theme**: Dark theme with vibrant accent colors for a modern, technical feel
**Color Palette**: 
- Background: Deep dark blue/gray (#0a0e27)
- Primary accent: Electric blue (#3b82f6)
- Secondary accent: Purple (#8b5cf6)
- Success: Green (#10b981)
- Warning: Amber (#f59e0b)
- Error: Red (#ef4444)

**Typography**: 
- Headings: Inter (bold, modern)
- Body: Inter (regular)
- Code/Technical: JetBrains Mono

**Visual Style**:
- Clean, technical dashboard aesthetic
- Gradient accents for important elements
- Subtle glow effects on interactive elements
- Card-based layout with soft shadows
- Status indicators with color coding

## Layout Structure
**Dashboard-based application** with sidebar navigation for internal tool functionality

**Main Sections**:
1. **Landing Page** (public) - Hero section explaining Camoufox automation capabilities
2. **Dashboard** (authenticated) - Overview of sessions and recent tasks
3. **Sessions** - Manage browser automation sessions
4. **Tasks** - View and create automation tasks
5. **API Keys** - Manage API keys for n8n integration
6. **Documentation** - API documentation for n8n users

## Key Features
- Real-time task status updates
- Visual session cards with status indicators
- Code snippets for n8n integration
- Task history with filtering
- Screenshot preview for completed tasks
- Browser configuration presets

## User Flow
1. User lands on homepage → sees automation capabilities
2. User logs in → redirected to dashboard
3. User creates a session with browser config
4. User creates tasks for the session
5. User views task results and screenshots
6. User generates API key for n8n integration
7. User views API documentation for n8n setup

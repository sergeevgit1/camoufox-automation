# Project TODO

## Backend Features
- [x] Set up database schema for browser sessions and automation tasks
- [x] Install Camoufox Python library and dependencies
- [x] Create tRPC procedures for browser automation operations
- [x] Implement session management (create, list, delete)
- [x] Implement browser automation actions (navigate, click, screenshot, etc.)
- [x] Add API authentication for n8n integration
- [x] Implement task queue system for async operations

## Frontend Features
- [x] Design and implement landing page
- [x] Create dashboard layout with navigation
- [x] Build session management UI
- [x] Build automation task creation form
- [x] Implement real-time task status monitoring
- [x] Add API documentation page for n8n integration
- [x] Implement session viewer with screenshots

## Testing & Documentation
- [x] Test all API endpoints
- [x] Verify n8n integration workflow
- [x] Create user documentation


## New Features - Multi-accounting & Playwright

### Browser Profiles (Multi-accounting)
- [x] Add profiles table to database schema
- [x] Implement profile creation with unique fingerprints
- [x] Store cookies, localStorage, and session data per profile
- [x] Add profile management UI (create, edit, delete, clone)
- [x] Implement profile switching in sessions
- [x] Add profile tags and grouping
- [ ] Export/import profile functionality

### Extended Playwright Functionality
- [x] Cookie management (get, set, delete cookies)
- [x] LocalStorage/SessionStorage operations
- [ ] Network request interception and modification
- [x] Geolocation emulation
- [x] File upload/download handling
- [x] PDF generation from pages
- [ ] Multiple page/tab management
- [x] Browser context isolation
- [x] Custom user agents per session
- [x] Viewport and device emulation
- [x] Timezone emulation
- [x] Language/locale settings
- [ ] Permissions management (notifications, geolocation, etc.)
- [x] Wait for selectors with advanced options
- [x] Keyboard and mouse events
- [x] Drag and drop operations

### Russian Localization
- [x] Translate all frontend pages to Russian
- [x] Translate dashboard and navigation
- [ ] Translate forms and dialogs (Sessions, Profiles, API Keys pages)
- [ ] Translate API documentation
- [ ] Translate error messages
- [x] Update landing page content to Russian

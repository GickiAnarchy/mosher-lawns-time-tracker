# Mosher Lawns Time Tracker - Mobile App Design

## Overview
A time-tracking mobile app for Mosher Lawns employees to clock in/out at job sites, with full CRUD support for all records.

## Screen List

1. **Login Screen** — Employee authentication (employee ID or name)
2. **Home/Dashboard Screen** — Current clock status, quick clock in/out button, today's summary
3. **Job Sites Screen** — List of active job sites to select from
4. **Clock In/Out Screen** — Select job site, confirm clock in/out action
5. **Time Logs Screen** — View all time entries (today, week, month, all-time)
6. **Edit Log Screen** — Modify arrival/departure times for existing entries
7. **Delete Confirmation Screen** — Confirm deletion of time entries
8. **Settings Screen** — Employee info, app preferences, logout

## Primary Content and Functionality

### Home/Dashboard Screen
- **Current Status Card**: Shows if employee is currently clocked in or out
- **Active Job Site**: Display current job site (if clocked in)
- **Elapsed Time**: Show time spent at current site (if clocked in)
- **Large Clock In/Out Button**: Primary action, changes color based on status
- **Quick Stats**: Today's total hours, number of sites visited
- **Navigation**: Tabs to access Job Sites, Time Logs, and Settings

### Job Sites Screen
- **Job Site List**: Scrollable list of active job sites with:
  - Site name
  - Address/location
  - Number of employees on site (if available)
- **Add/Manage Sites**: Option to add new sites (admin feature, if applicable)
- **Search/Filter**: Filter sites by name or status

### Clock In/Out Screen
- **Job Site Selector**: Dropdown or list to select the job site
- **Current Time Display**: Show current time
- **Clock In/Out Button**: Confirm action with visual feedback
- **Notes Field** (optional): Add notes about the job or site conditions
- **Confirmation Message**: Show success/error after action

### Time Logs Screen
- **Filter Options**: View by Today, This Week, This Month, All Time
- **Log List**: Each entry shows:
  - Job site name
  - Clock in time
  - Clock out time (if available)
  - Total duration
  - Edit/Delete buttons
- **Export Option**: Export logs as CSV or PDF (if needed)

### Edit Log Screen
- **Job Site**: Display (read-only or editable)
- **Clock In Time**: Editable time picker
- **Clock Out Time**: Editable time picker
- **Notes**: Editable notes field
- **Save/Cancel Buttons**: Confirm or discard changes

### Settings Screen
- **Employee Info**: Name, ID, contact info
- **Preferences**: Theme (light/dark), notifications
- **Data Management**: View storage usage, clear cache
- **Logout Button**: Sign out of the app

## Key User Flows

### Flow 1: Clock In at Job Site
1. Employee opens app (already logged in)
2. Taps "Clock In" button on Home screen
3. Selects job site from dropdown
4. Confirms clock in action
5. App shows "Clocked In" status with elapsed time
6. Home screen updates to show active job site and running timer

### Flow 2: Clock Out from Job Site
1. Employee taps "Clock Out" button on Home screen
2. App shows confirmation dialog with job site and elapsed time
3. Employee confirms clock out
4. App records the departure time
5. Home screen updates to show "Clocked Out" status
6. Entry appears in Time Logs

### Flow 3: Edit Time Entry
1. Employee navigates to Time Logs screen
2. Selects an entry to edit
3. Taps "Edit" button
4. Modifies clock in/out times or notes
5. Taps "Save"
6. Entry updates in the database
7. Returns to Time Logs screen

### Flow 4: Delete Time Entry
1. Employee navigates to Time Logs screen
2. Selects an entry to delete
3. Taps "Delete" button
4. Confirmation dialog appears
5. Employee confirms deletion
6. Entry is removed from logs
7. Returns to Time Logs screen

## Color Choices

- **Primary Color**: #2E7D32 (Mosher Lawns green - professional, nature-inspired)
- **Background**: #FFFFFF (light mode), #121212 (dark mode)
- **Surface**: #F5F5F5 (light mode), #1E1E1E (dark mode)
- **Text Primary**: #212121 (light mode), #FFFFFF (dark mode)
- **Text Secondary**: #757575 (light mode), #BDBDBD (dark mode)
- **Success**: #4CAF50 (green for clocked in)
- **Warning**: #FF9800 (orange for pending actions)
- **Error**: #F44336 (red for errors or clock out)
- **Border**: #E0E0E0 (light mode), #333333 (dark mode)

## Layout Principles

- **Mobile Portrait (9:16)**: All screens optimized for portrait orientation
- **One-Handed Usage**: Primary actions (Clock In/Out) positioned in lower half of screen for thumb reach
- **Large Touch Targets**: Buttons minimum 48dp, spacing for easy tapping
- **Clear Hierarchy**: Important information (current status, clock button) at top
- **Minimal Scrolling**: Critical information visible without scrolling when possible
- **Consistent Navigation**: Tab bar at bottom for main sections (Home, Logs, Settings)

## Data Model

### Employee
- ID (unique identifier)
- Name
- Email
- Phone
- Role (employee, supervisor, admin)
- Active status

### Job Site
- ID (unique identifier)
- Name
- Address
- Status (active, inactive)
- Created date

### Time Log Entry
- ID (unique identifier)
- Employee ID (foreign key)
- Job Site ID (foreign key)
- Clock In Time (timestamp)
- Clock Out Time (timestamp, nullable)
- Notes (optional text)
- Created date
- Updated date

## Technical Considerations

- **Local Storage**: Use AsyncStorage for offline support and quick access
- **Cloud Sync**: Sync data to backend when online (Firebase or custom backend)
- **Timestamps**: Use UTC for all timestamps to handle timezone differences
- **Offline Mode**: Allow clock in/out offline, sync when connection restored
- **Notifications**: Optional push notifications for clock out reminders
- **Biometric Auth**: Optional fingerprint/face ID for quick login

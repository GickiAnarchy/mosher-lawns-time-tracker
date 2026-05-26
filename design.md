# Mosher Lawns Time Management & Record Keeping - Design

## System Overview

This is a **company-wide time management and record-keeping system** for Mosher Lawns. It replaces the individual employee time tracker with a comprehensive solution that allows supervisors to manage employees, job sites, and view all time records across the company.

## Screen List

### Authentication Screens
1. **Login Screen** — Supervisor PIN login to access the admin dashboard
2. **Employee Clock In Screen** — Employee PIN login to clock in/out

### Supervisor Dashboard (Admin)
1. **Dashboard Home** — Overview of active clocks, today's summary, quick stats
2. **Employees Screen** — List all employees, add/edit/delete employees
3. **Job Sites Screen** — List all job sites, add/edit/delete sites
4. **Time Records Screen** — View all time logs, filter by employee/date/site, edit/delete entries
5. **Reports Screen** — Generate and view daily/weekly/monthly reports, export to CSV

### Employee Screens
1. **Clock In/Out Screen** — Select job site and clock in/out
2. **My Time Logs** — View personal time entries
3. **Settings** — Logout

## Key User Flows

### Supervisor Flow
1. Supervisor logs in with PIN → Dashboard Home
2. Can navigate to: Employees, Job Sites, Time Records, Reports
3. Can add/edit/delete employees and job sites
4. Can view and edit all employee time records
5. Can generate reports and export data

### Employee Flow
1. Employee logs in with PIN → Clock In/Out Screen
2. Selects job site from dropdown
3. Clicks "Clock In" to start shift
4. Can view elapsed time and current job site
5. Clicks "Clock Out" to end shift
6. Can view personal time logs in "My Time Logs" screen

## Data Model

**Employees**
- id (string)
- name (string)
- pin (string)
- role ('supervisor' | 'employee')

**Job Sites**
- id (string)
- name (string)

**Time Logs**
- id (string)
- employeeId (string)
- jobSiteId (string)
- clockInTime (timestamp)
- clockOutTime (timestamp | null)

## Color Scheme

- **Primary Green**: #2d7a3a (Mosher Lawns brand)
- **Background**: #ffffff (light) / #151718 (dark)
- **Surface**: #f5f5f5 (light) / #1e2022 (dark)
- **Text**: #11181c (light) / #ecedee (dark)
- **Accent**: #2d7a3a (green for active states)
- **Error**: #ef4444 (red for clock out)

## Navigation Structure

```
Root
├── Login (Supervisor PIN)
├── Dashboard (Protected)
│   ├── Home
│   ├── Employees
│   ├── Job Sites
│   ├── Time Records
│   └── Reports
└── Employee Clock In (Protected)
    ├── Clock In/Out
    ├── My Time Logs
    └── Settings
```

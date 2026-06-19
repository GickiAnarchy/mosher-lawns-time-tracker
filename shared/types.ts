/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export * from "./_core/errors";

export interface Employee {
  id: string;
  name: string;
}

export interface JobSite {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface TimeLog {
  id: string;
  employeeId: string;
  jobSiteId: string;
  clockInTime: number;
  clockOutTime: number | null;
}

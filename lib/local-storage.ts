import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Employee {
  id: string;
  name: string;
  pin: string;
}

export interface JobSite {
  id: string;
  name: string;
}

export interface TimeLog {
  id: string;
  employeeId: string;
  jobSiteId: string;
  clockInTime: number; // timestamp
  clockOutTime: number | null; // timestamp or null if still clocked in
}

const STORAGE_KEYS = {
  EMPLOYEES: 'employees',
  JOB_SITES: 'job_sites',
  TIME_LOGS: 'time_logs',
  CURRENT_EMPLOYEE: 'current_employee',
};

// Employee Management
export async function getEmployees(): Promise<Employee[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting employees:', error);
    return [];
  }
}

export async function addEmployee(employee: Employee): Promise<void> {
  try {
    const employees = await getEmployees();
    employees.push(employee);
    await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (error) {
    console.error('Error adding employee:', error);
  }
}

export async function getEmployeeByPin(pin: string): Promise<Employee | null> {
  try {
    const employees = await getEmployees();
    return employees.find(e => e.pin === pin) || null;
  } catch (error) {
    console.error('Error getting employee by PIN:', error);
    return null;
  }
}

export async function getCurrentEmployee(): Promise<Employee | null> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_EMPLOYEE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting current employee:', error);
    return null;
  }
}

export async function setCurrentEmployee(employee: Employee | null): Promise<void> {
  try {
    if (employee) {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_EMPLOYEE, JSON.stringify(employee));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_EMPLOYEE);
    }
  } catch (error) {
    console.error('Error setting current employee:', error);
  }
}

// Job Sites Management
export async function getJobSites(): Promise<JobSite[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.JOB_SITES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting job sites:', error);
    return [];
  }
}

export async function addJobSite(site: JobSite): Promise<void> {
  try {
    const sites = await getJobSites();
    sites.push(site);
    await AsyncStorage.setItem(STORAGE_KEYS.JOB_SITES, JSON.stringify(sites));
  } catch (error) {
    console.error('Error adding job site:', error);
  }
}

export async function deleteJobSite(id: string): Promise<void> {
  try {
    const sites = await getJobSites();
    const filtered = sites.filter(s => s.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.JOB_SITES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting job site:', error);
  }
}

// Time Logs Management
export async function getTimeLogs(): Promise<TimeLog[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TIME_LOGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting time logs:', error);
    return [];
  }
}

export async function addTimeLog(log: TimeLog): Promise<void> {
  try {
    const logs = await getTimeLogs();
    logs.push(log);
    await AsyncStorage.setItem(STORAGE_KEYS.TIME_LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error('Error adding time log:', error);
  }
}

export async function updateTimeLog(id: string, updates: Partial<TimeLog>): Promise<void> {
  try {
    const logs = await getTimeLogs();
    const index = logs.findIndex(l => l.id === id);
    if (index !== -1) {
      logs[index] = { ...logs[index], ...updates };
      await AsyncStorage.setItem(STORAGE_KEYS.TIME_LOGS, JSON.stringify(logs));
    }
  } catch (error) {
    console.error('Error updating time log:', error);
  }
}

export async function deleteTimeLog(id: string): Promise<void> {
  try {
    const logs = await getTimeLogs();
    const filtered = logs.filter(l => l.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.TIME_LOGS, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting time log:', error);
  }
}

export async function getEmployeeTimeLogs(employeeId: string): Promise<TimeLog[]> {
  try {
    const logs = await getTimeLogs();
    return logs.filter(l => l.employeeId === employeeId);
  } catch (error) {
    console.error('Error getting employee time logs:', error);
    return [];
  }
}

export async function getActiveTimeLog(employeeId: string): Promise<TimeLog | null> {
  try {
    const logs = await getEmployeeTimeLogs(employeeId);
    return logs.find(l => l.clockOutTime === null) || null;
  } catch (error) {
    console.error('Error getting active time log:', error);
    return null;
  }
}

// Initialize default data
export async function initializeDefaultData(): Promise<void> {
  try {
    const employees = await getEmployees();
    if (employees.length === 0) {
      // Add a demo employee for testing
      await addEmployee({
        id: '1',
        name: 'Demo Employee',
        pin: '1234',
      });
    }

    const sites = await getJobSites();
    if (sites.length === 0) {
      // Add demo job sites
      await addJobSite({ id: '1', name: 'Downtown Site' });
      await addJobSite({ id: '2', name: 'Uptown Site' });
      await addJobSite({ id: '3', name: 'Suburban Site' });
    }
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
}

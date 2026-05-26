import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Employee {
  id: string;
  name: string;
  pin: string;
  role: 'supervisor' | 'employee';
}

export interface JobSite {
  id: string;
  name: string;
}

export interface TimeLog {
  id: string;
  employeeId: string;
  jobSiteId: string;
  clockInTime: number;
  clockOutTime: number | null;
}

const STORAGE_KEYS = {
  EMPLOYEES: 'employees',
  JOB_SITES: 'job_sites',
  TIME_LOGS: 'time_logs',
  CURRENT_EMPLOYEE: 'current_employee',
};

// ============ EMPLOYEE MANAGEMENT ============

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
    const exists = employees.find(e => e.id === employee.id);
    if (!exists) {
      employees.push(employee);
      await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    }
  } catch (error) {
    console.error('Error adding employee:', error);
  }
}

export async function updateEmployee(employee: Employee): Promise<void> {
  try {
    const employees = await getEmployees();
    const index = employees.findIndex(e => e.id === employee.id);
    if (index !== -1) {
      employees[index] = employee;
      await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    }
  } catch (error) {
    console.error('Error updating employee:', error);
  }
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  try {
    const employees = await getEmployees();
    const filtered = employees.filter(e => e.id !== employeeId);
    await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting employee:', error);
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

// ============ JOB SITES MANAGEMENT ============

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
    const exists = sites.find(s => s.id === site.id);
    if (!exists) {
      sites.push(site);
      await AsyncStorage.setItem(STORAGE_KEYS.JOB_SITES, JSON.stringify(sites));
    }
  } catch (error) {
    console.error('Error adding job site:', error);
  }
}

export async function updateJobSite(site: JobSite): Promise<void> {
  try {
    const sites = await getJobSites();
    const index = sites.findIndex(s => s.id === site.id);
    if (index !== -1) {
      sites[index] = site;
      await AsyncStorage.setItem(STORAGE_KEYS.JOB_SITES, JSON.stringify(sites));
    }
  } catch (error) {
    console.error('Error updating job site:', error);
  }
}

export async function deleteJobSite(siteId: string): Promise<void> {
  try {
    const sites = await getJobSites();
    const filtered = sites.filter(s => s.id !== siteId);
    await AsyncStorage.setItem(STORAGE_KEYS.JOB_SITES, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting job site:', error);
  }
}

// ============ TIME LOGS MANAGEMENT ============

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

export async function updateTimeLog(log: TimeLog): Promise<void> {
  try {
    const logs = await getTimeLogs();
    const index = logs.findIndex(l => l.id === log.id);
    if (index !== -1) {
      logs[index] = log;
      await AsyncStorage.setItem(STORAGE_KEYS.TIME_LOGS, JSON.stringify(logs));
    }
  } catch (error) {
    console.error('Error updating time log:', error);
  }
}

export async function deleteTimeLog(logId: string): Promise<void> {
  try {
    const logs = await getTimeLogs();
    const filtered = logs.filter(l => l.id !== logId);
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

// ============ INITIALIZATION ============

export async function initializeDefaultData(): Promise<void> {
  try {
    const employees = await getEmployees();
    if (employees.length === 0) {
      // Add demo supervisor and employees
      await addEmployee({
        id: 'sup1',
        name: 'Supervisor',
        pin: '1111',
        role: 'supervisor',
      });
      await addEmployee({
        id: 'emp1',
        name: 'John Doe',
        pin: '1234',
        role: 'employee',
      });
      await addEmployee({
        id: 'emp2',
        name: 'Jane Smith',
        pin: '5678',
        role: 'employee',
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

// ============ REPORTING ============

export async function getDailyReport(date: Date): Promise<{
  totalHours: number;
  employeeCount: number;
  entries: TimeLog[];
}> {
  try {
    const logs = await getTimeLogs();
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const dateEnd = dateStart + 24 * 60 * 60 * 1000;

    const dailyLogs = logs.filter(
      l => l.clockInTime >= dateStart && l.clockInTime < dateEnd
    );

    let totalHours = 0;
    dailyLogs.forEach(log => {
      if (log.clockOutTime) {
        totalHours += (log.clockOutTime - log.clockInTime) / (1000 * 60 * 60);
      }
    });

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      employeeCount: new Set(dailyLogs.map(l => l.employeeId)).size,
      entries: dailyLogs,
    };
  } catch (error) {
    console.error('Error getting daily report:', error);
    return { totalHours: 0, employeeCount: 0, entries: [] };
  }
}

export async function getEmployeeSummary(employeeId: string, startDate: Date, endDate: Date): Promise<{
  totalHours: number;
  entries: TimeLog[];
}> {
  try {
    const logs = await getEmployeeTimeLogs(employeeId);
    const dateStart = startDate.getTime();
    const dateEnd = endDate.getTime() + 24 * 60 * 60 * 1000;

    const filteredLogs = logs.filter(
      l => l.clockInTime >= dateStart && l.clockInTime < dateEnd
    );

    let totalHours = 0;
    filteredLogs.forEach(log => {
      if (log.clockOutTime) {
        totalHours += (log.clockOutTime - log.clockInTime) / (1000 * 60 * 60);
      }
    });

    return {
      totalHours: Math.round(totalHours * 100) / 100,
      entries: filteredLogs,
    };
  } catch (error) {
    console.error('Error getting employee summary:', error);
    return { totalHours: 0, entries: [] };
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Employee {
  id: string;
  name: string;
}

export interface JobSite {
  id: string;
  name: string;
  location: string;
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

export async function addEmployee(name: string): Promise<Employee | null> {
  try {
    const employees = await getEmployees();
    // Check for duplicate name
    if (employees.some(emp => emp.name.toLowerCase() === name.toLowerCase())) {
      console.warn('Employee with this name already exists');
      return null;
    }
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name,
    };
    employees.push(newEmployee);
    await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    return newEmployee;
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
}

export async function updateEmployee(id: string, name: string): Promise<void> {
  try {
    const employees = await getEmployees();
    const index = employees.findIndex(e => e.id === id);
    if (index !== -1) {
      employees[index].name = name;
      await AsyncStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    }
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
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

export async function addJobSite(name: string, location: string): Promise<JobSite | null> {
  try {
    const jobSites = await getJobSites();
    // Check for duplicate name
    if (jobSites.some(site => site.name.toLowerCase() === name.toLowerCase())) {
      console.warn('Job site with this name already exists');
      return null;
    }
    const newJobSite: JobSite = {
      id: Date.now().toString(),
      name,
      location,
    };
    jobSites.push(newJobSite);
    await AsyncStorage.setItem(STORAGE_KEYS.JOB_SITES, JSON.stringify(jobSites));
    return newJobSite;
  } catch (error) {
    console.error('Error adding job site:', error);
    throw error;
  }
}

export async function updateJobSite(id: string, name: string, location: string): Promise<void> {
  try {
    const sites = await getJobSites();
    const index = sites.findIndex(s => s.id === id);
    if (index !== -1) {
      sites[index].name = name;
      sites[index].location = location;
      await AsyncStorage.setItem(STORAGE_KEYS.JOB_SITES, JSON.stringify(sites));
    }
  } catch (error) {
    console.error('Error updating job site:', error);
    throw error;
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

export async function addTimeLog(employeeId: string, jobSiteId: string): Promise<TimeLog> {
  try {
    const logs = await getTimeLogs();
    const newLog: TimeLog = {
      id: Date.now().toString(),
      employeeId,
      jobSiteId,
      clockInTime: Date.now(),
      clockOutTime: null,
    };
    logs.push(newLog);
    await AsyncStorage.setItem(STORAGE_KEYS.TIME_LOGS, JSON.stringify(logs));
    return newLog;
  } catch (error) {
    console.error('Error adding time log:', error);
    throw error;
  }
}

export async function clockOutTimeLog(id: string): Promise<void> {
  try {
    const logs = await getTimeLogs();
    const index = logs.findIndex(l => l.id === id);
    if (index !== -1) {
      logs[index].clockOutTime = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.TIME_LOGS, JSON.stringify(logs));
    }
  } catch (error) {
    console.error('Error clocking out:', error);
    throw error;
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
      await addEmployee('John Smith');
      await addEmployee('Jane Doe');
      await addEmployee('Mike Johnson');
    }

    const sites = await getJobSites();
    if (sites.length === 0) {
      await addJobSite('Downtown Site', '123 Main St, Downtown');
      await addJobSite('North Site', '456 North Ave, North District');
      await addJobSite('South Warehouse', '789 South Blvd, South Industrial');
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

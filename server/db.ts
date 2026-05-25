import { eq, and, desc, isNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, employees, InsertEmployee, Employee, jobSites, InsertJobSite, JobSite, timeLogs, InsertTimeLog, TimeLog } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function getUserByOpenId(openId: string): Promise<any | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.openId, user.openId))
    .limit(1);

  if (existingUser.length > 0) {
    await db
      .update(users)
      .set({
        name: user.name,
        email: user.email,
        lastSignedIn: new Date(),
      })
      .where(eq(users.openId, user.openId));
  } else {
    await db.insert(users).values(user);
  }
}

// Employee functions
export async function getEmployeeByUserId(userId: number): Promise<Employee | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(employees)
    .where(eq(employees.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createEmployee(data: InsertEmployee): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(employees).values(data);
  return (result as any).insertId || 0;
}

export async function updateEmployee(id: number, data: Partial<InsertEmployee>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(employees).set(data).where(eq(employees.id, id));
}

// Job Sites functions
export async function getActiveJobSites(): Promise<JobSite[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(jobSites)
    .where(eq(jobSites.status, "active"));
}

export async function getJobSiteById(id: number): Promise<JobSite | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(jobSites)
    .where(eq(jobSites.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createJobSite(data: InsertJobSite): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(jobSites).values(data);
  return (result as any).insertId || 0;
}

export async function updateJobSite(id: number, data: Partial<InsertJobSite>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(jobSites).set(data).where(eq(jobSites.id, id));
}

// Time Logs functions
export async function getEmployeeCurrentTimeLog(employeeId: number): Promise<TimeLog | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(timeLogs)
    .where(and(
      eq(timeLogs.employeeId, employeeId),
      isNull(timeLogs.clockOutTime)
    ))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function createTimeLog(data: InsertTimeLog): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(timeLogs).values(data);
  return (result as any).insertId || 0;
}

export async function updateTimeLog(id: number, data: Partial<InsertTimeLog>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(timeLogs).set(data).where(eq(timeLogs.id, id));
}

export async function deleteTimeLog(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(timeLogs).where(eq(timeLogs.id, id));
}

export async function getEmployeeTimeLogs(employeeId: number, limit: number = 100): Promise<TimeLog[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(timeLogs)
    .where(eq(timeLogs.employeeId, employeeId))
    .orderBy(desc(timeLogs.clockInTime))
    .limit(limit);
}

export async function getTimeLogById(id: number): Promise<TimeLog | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(timeLogs)
    .where(eq(timeLogs.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

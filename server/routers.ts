import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: "ok" })),

  // Employee routes
  employee: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const employee = await db.getEmployeeByUserId(ctx.user.id);
      return employee || null;
    }),

    createProfile: protectedProcedure
      .input(
        z.object({
          employeeId: z.string().min(1).max(64),
          name: z.string().min(1).max(255),
          email: z.string().email().optional(),
          phone: z.string().max(20).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const existingEmployee = await db.getEmployeeByUserId(ctx.user.id);
        if (existingEmployee) {
          throw new Error("Employee profile already exists");
        }

        const id = await db.createEmployee({
          userId: ctx.user.id,
          employeeId: input.employeeId,
          name: input.name,
          email: input.email,
          phone: input.phone,
          role: "employee",
          active: true,
        });

        return { id };
      }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255).optional(),
          email: z.string().email().optional(),
          phone: z.string().max(20).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const employee = await db.getEmployeeByUserId(ctx.user.id);
        if (!employee) {
          throw new Error("Employee profile not found");
        }

        await db.updateEmployee(employee.id, input);
        return { success: true };
      }),
  }),

  // Job Sites routes
  jobSites: router({
    list: protectedProcedure.query(async () => {
      return db.getActiveJobSites();
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          address: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await db.createJobSite({
          name: input.name,
          address: input.address,
          status: "active",
        });

        return { id };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().min(1).max(255).optional(),
          address: z.string().optional(),
          status: z.enum(["active", "inactive"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateJobSite(input.id, {
          name: input.name,
          address: input.address,
          status: input.status,
        });

        return { success: true };
      }),
  }),

  // Time Logs routes
  timeLogs: router({
    getCurrentLog: protectedProcedure.query(async ({ ctx }) => {
      const employee = await db.getEmployeeByUserId(ctx.user.id);
      if (!employee) {
        throw new Error("Employee profile not found");
      }

      return db.getEmployeeCurrentTimeLog(employee.id);
    }),

    clockIn: protectedProcedure
      .input(
        z.object({
          jobSiteId: z.number(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const employee = await db.getEmployeeByUserId(ctx.user.id);
        if (!employee) {
          throw new Error("Employee profile not found");
        }

        const currentLog = await db.getEmployeeCurrentTimeLog(employee.id);
        if (currentLog) {
          throw new Error("Already clocked in");
        }

        const id = await db.createTimeLog({
          employeeId: employee.id,
          jobSiteId: input.jobSiteId,
          clockInTime: new Date(),
          notes: input.notes,
        });

        return { id };
      }),

    clockOut: protectedProcedure
      .input(z.object({ notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const employee = await db.getEmployeeByUserId(ctx.user.id);
        if (!employee) {
          throw new Error("Employee profile not found");
        }

        const currentLog = await db.getEmployeeCurrentTimeLog(employee.id);
        if (!currentLog) {
          throw new Error("Not currently clocked in");
        }

        await db.updateTimeLog(currentLog.id, {
          clockOutTime: new Date(),
          notes: input.notes,
        });

        return { success: true };
      }),

    list: protectedProcedure
      .input(
        z.object({
          limit: z.number().default(100),
        })
      )
      .query(async ({ ctx, input }) => {
        const employee = await db.getEmployeeByUserId(ctx.user.id);
        if (!employee) {
          throw new Error("Employee profile not found");
        }

        return db.getEmployeeTimeLogs(employee.id, input.limit);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTimeLogById(input.id);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          clockInTime: z.date().optional(),
          clockOutTime: z.date().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.updateTimeLog(input.id, {
          clockInTime: input.clockInTime,
          clockOutTime: input.clockOutTime,
          notes: input.notes,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTimeLog(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

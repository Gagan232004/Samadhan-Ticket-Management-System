import { describe, it, expect, mock, beforeEach } from "bun:test";
import request from "supertest";
import express from "express";

// Mock the dependencies before they are imported by the routes
mock.module("./auth.js", () => ({
  auth: {
    api: {
      getSession: mock().mockResolvedValue({
        user: { id: "test_user_id", role: "admin", name: "Admin" }
      })
    }
  }
}));

const mockPrisma = {
  notification: {
    findMany: mock(),
    findUnique: mock(),
    update: mock()
  }
};

mock.module("./db.js", () => ({
  prisma: mockPrisma
}));

// Now import the router which will use the mocked modules
import notificationRoutes from "./notification.routes.js";

const app = express();
app.use(express.json());
app.use("/api/notifications", notificationRoutes);

describe("Notification Routes", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockPrisma.notification.findMany.mockClear();
    mockPrisma.notification.findUnique.mockClear();
    mockPrisma.notification.update.mockClear();
  });

  describe("GET /", () => {
    it("should fetch all unread notifications for the active user", async () => {
      const mockNotifications = [
        { id: "notif_1", message: "Hello", isRead: false, userId: "test_user_id" },
        { id: "notif_2", message: "World", isRead: false, userId: "test_user_id" }
      ];
      mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);

      const response = await request(app).get("/api/notifications");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockNotifications);
      
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: { 
          userId: "test_user_id",
          isRead: false
        },
        orderBy: { createdAt: "desc" }
      });
    });

    it("should return 500 if prisma throws an error", async () => {
      mockPrisma.notification.findMany.mockRejectedValue(new Error("DB Error"));

      const response = await request(app).get("/api/notifications");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Failed to fetch notifications" });
    });
  });

  describe("POST /:id/read", () => {
    it("should return 404 if notification is not found", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      const response = await request(app).post("/api/notifications/invalid_id/read");

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Notification not found" });
    });

    it("should return 403 if notification does not belong to the user", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        id: "notif_1",
        userId: "other_user_id",
        isRead: false
      });

      const response = await request(app).post("/api/notifications/notif_1/read");

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: "Forbidden" });
      
      // Ensure update is never called
      expect(mockPrisma.notification.update).not.toHaveBeenCalled();
    });

    it("should mark the notification as read if it belongs to the user", async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({
        id: "notif_1",
        userId: "test_user_id",
        isRead: false
      });

      const updatedNotif = {
        id: "notif_1",
        userId: "test_user_id",
        isRead: true
      };
      
      mockPrisma.notification.update.mockResolvedValue(updatedNotif);

      const response = await request(app).post("/api/notifications/notif_1/read");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedNotif);

      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: "notif_1" },
        data: { isRead: true }
      });
    });
  });
});

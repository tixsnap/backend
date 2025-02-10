import request from "supertest";
import { App } from "../app";

const app = new App().instance;

describe("testing register user", () => {
    it("should register user successfully", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "testuser@example.com",
        name: "Test User",
        password: "Test@123",
        confirmPassword: "Test@123",
        role: "CUSTOMER"
      });
  
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toBe(
        "Please verify your email to activate account"
      );
    });
  });

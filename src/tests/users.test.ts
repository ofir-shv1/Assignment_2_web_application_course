import request from "supertest";
import initApp from "../index";
import { Express } from "express";
import { getLoggedInUser, UserData } from "./utils";

let app: Express;
let loginUser: UserData;
let userId = "";

beforeAll(async () => {
  app = await initApp();
  loginUser = await getLoggedInUser(app);
  userId = loginUser._id;
});

afterAll((done) => {
  done();
});

describe("Users Test Suite", () => {
  test("Get All Users", async () => {
    const response = await request(app).get("/users")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  test("Get User by ID", async () => {
    const response = await request(app).get("/users/" + userId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body.email).toBe(loginUser.email);
    expect(response.body.username).toBe(loginUser.username);
    expect(response.body._id).toBe(userId);
  });

  test("Update User", async () => {
    const randomId = Date.now();
    const updatedData = {
      username: `updateduser${randomId}`,
      email: `updated${randomId}@test.com`
    };
    const response = await request(app)
      .put("/users/" + userId)
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send(updatedData);
    expect(response.status).toBe(200);
    expect(response.body.user.username).toBe(updatedData.username);
    expect(response.body.user.email).toBe(updatedData.email);
    expect(response.body.user._id).toBe(userId);
  });

  test("Update User with password", async () => {
    const randomId = Date.now();
    const updatedData = {
      username: `updateduser${randomId}`,
      password: "newpassword123"
    };
    const response = await request(app)
      .put("/users/" + userId)
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send(updatedData);
    expect(response.status).toBe(200);
    expect(response.body.user.username).toBe(updatedData.username);
  });

  test("Update User - Unauthorized (different user)", async () => {
    const response = await request(app)
      .put("/users/000000000000000000000001")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ username: "hacker" });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Not authorized to update this user');
  });

  test("Update User - Unauthorized (different user)", async () => {
    const response = await request(app)
      .put("/users/000000000000000000000001")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ username: "hacker" });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Not authorized to update this user');
  });

  test("Get user with invalid ID format", async () => {
    const response = await request(app)
      .get("/users/invalid-id")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(500);
  });

  test("Get non-existent user", async () => {
    const response = await request(app)
      .get("/users/000000000000000000000000")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  test("Update user with invalid ID format", async () => {
    const response = await request(app)
      .put("/users/invalid-id")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ username: "updated" });
    expect(response.status).toBe(500);
  });

  test("Delete user with invalid ID format", async () => {
    const response = await request(app)
      .delete("/users/invalid-id")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(500);
  });

  test("Update non-existent user", async () => {
    const response = await request(app)
      .put("/users/000000000000000000000000")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ username: "updated" });
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Not authorized to update this user');
  });

  test("Delete non-existent user", async () => {
    const response = await request(app)
      .delete("/users/000000000000000000000000")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Not authorized to delete this user');
  });
});

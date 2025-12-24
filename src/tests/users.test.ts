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

  test("Create New User", async () => {
    const randomId = Date.now();
    const newUser = {
      username: `newuser${randomId}`,
      email: `newuser${randomId}@test.com`,
      password: "newpass123"
    };
    const response = await request(app).post("/users")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send(newUser);
    expect(response.status).toBe(201);
    expect(response.body.user.username).toBe(newUser.username);
    expect(response.body.user.email).toBe(newUser.email);
  });

  test("Delete User", async () => {
    // Create a user to delete
    const randomId = Date.now();
    const userToDelete = {
      username: `deleteuser${randomId}`,
      email: `delete${randomId}@test.com`,
      password: "deletepass"
    };
    const createResponse = await request(app).post("/users")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send(userToDelete);
    const deleteUserId = createResponse.body.user._id;

    const response = await request(app).delete("/users/" + deleteUserId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User deleted successfully');

    const getResponse = await request(app).get("/users/" + deleteUserId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(getResponse.status).toBe(404);
  });

  test("Create user without required fields", async () => {
    const response = await request(app).post("/users")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ username: "test" });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('All fields (username, email, password) are required');
  });

  test("Create duplicate user", async () => {
    const randomId = Date.now();
    const duplicateUser = {
      username: `dupuser${randomId}`,
      email: `dup${randomId}@test.com`,
      password: "test123"
    };
    // Create first user
    await request(app).post("/users")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send(duplicateUser);
    
    // Try to create duplicate
    const response = await request(app).post("/users")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send(duplicateUser);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('User with this email or username already exists');
  });

  test("Get user with invalid ID format", async () => {
    const response = await request(app)
      .get("/users/invalid-id")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(500);
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
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  test("Delete non-existent user", async () => {
    const response = await request(app)
      .delete("/users/000000000000000000000000")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('User not found');
  });
});

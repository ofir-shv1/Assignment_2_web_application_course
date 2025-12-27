import request from "supertest";
import initApp from "../index";
import Comment from "../models/commentModel";
import Post from "../models/postModel";
import { Express } from "express";
import { getLoggedInUser, UserData, commentsList } from "./utils";

let app: Express;
let loginUser: UserData;
let commentId = "";
let postId = "";

beforeAll(async () => {
  app = await initApp();
  await Comment.deleteMany();
  await Post.deleteMany();
  loginUser = await getLoggedInUser(app);
  
  // Create a post for comments
  const postResponse = await request(app).post("/posts")
    .set("Authorization", "Bearer " + loginUser.accessToken)
    .send({
      title: "Test Post for Comments",
      content: "This post is for testing comments"
    });
  postId = postResponse.body._id;
  
  // Update commentsList with the postId
  commentsList[0].postId = postId;
  commentsList[1].postId = postId;
  commentsList[2].postId = postId;
});

afterAll((done) => {
  done();
});

describe("Comments Test Suite", () => {
  test("Initial empty comments", async () => {
    const response = await request(app).get("/comments")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test("Create Comment", async () => {
    for (const comment of commentsList) {
      const response = await request(app).post("/comments/" + comment.postId)
        .set("Authorization", "Bearer " + loginUser.accessToken)
        .send({ content: comment.content });
      expect(response.status).toBe(201);
      expect(response.body.content).toBe(comment.content);
      expect(response.body.postId).toBe(comment.postId);
    }
  });

  test("Get All Comments", async () => {
    const response = await request(app).get("/comments")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(commentsList.length);
  });

  test("Get Comments by postId", async () => {
    const response = await request(app).get(
      "/comments?postId=" + commentsList[0].postId
    ).set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
    expect(response.body[0].content).toBe(commentsList[0].content);
    commentId = response.body[0]._id;
  });

  test("Get Comment by ID", async () => {
    const response = await request(app).get("/comments/" + commentId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(commentsList[0].content);
    expect(response.body.postId).toBe(commentsList[0].postId);
    expect(response.body._id).toBe(commentId);
  });

  test("Update Comment", async () => {
    commentsList[0].content = "This is an updated comment";
    const response = await request(app)
      .put("/comments/" + commentId)
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send(commentsList[0]);
    expect(response.status).toBe(200);
    expect(response.body.content).toBe(commentsList[0].content);
    expect(response.body.postId).toBe(commentsList[0].postId);
    expect(response.body._id).toBe(commentId);
  });

  test("Delete Comment", async () => {
    const response = await request(app).delete("/comments/" + commentId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Comment deleted successfully');

    const getResponse = await request(app).get("/comments/" + commentId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(getResponse.status).toBe(404);
  });

  test("Create comment on non-existent post", async () => {
    const response = await request(app)
      .post("/comments/000000000000000000000000")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ content: "test", sender: "testuser" });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Post not found');
  });

  test("Get comment with invalid ID format", async () => {
    const response = await request(app)
      .get("/comments/invalid-id")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(500);
  });

  test("Update comment with invalid ID format", async () => {
    const response = await request(app)
      .put("/comments/invalid-id")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ content: "updated" });
    expect(response.status).toBe(500);
  });

  test("Delete comment with invalid ID format", async () => {
    const response = await request(app)
      .delete("/comments/invalid-id")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(500);
  });

  test("Delete non-existent comment", async () => {
    const response = await request(app)
      .delete("/comments/000000000000000000000000")
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Comment not found');
  });

  test("Update non-existent comment", async () => {
    const response = await request(app)
      .put("/comments/000000000000000000000000")
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ content: "updated content" });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Comment not found');
  });

  test("Create comment without content", async () => {
    const response = await request(app)
      .post("/comments/" + postId)
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({});
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Content is required');
  });

  test("Update comment - unauthorized (different user)", async () => {
    // Create a new user
    const randomId = Date.now();
    const newUser = {
      email: `commentuser${randomId}@test.com`,
      username: `commentuser${randomId}`,
      password: "testpass"
    };
    const registerResponse = await request(app).post("/auth/register").send(newUser);
    const otherUserToken = registerResponse.body.accessToken;

    // Create a comment with the other user
    const commentData = { content: "Other user's comment" };
    const createResponse = await request(app)
      .post("/comments/" + postId)
      .set("Authorization", "Bearer " + otherUserToken)
      .send(commentData);
    const otherCommentId = createResponse.body._id;

    // Try to update the comment with the original user (should fail)
    const updateResponse = await request(app)
      .put("/comments/" + otherCommentId)
      .set("Authorization", "Bearer " + loginUser.accessToken)
      .send({ content: "Hacked comment" });
    expect(updateResponse.status).toBe(403);
    expect(updateResponse.body.message).toBe('Not authorized to update this comment');
  });

  test("Delete comment - unauthorized (different user)", async () => {
    // Create a new user
    const randomId = Date.now();
    const newUser = {
      email: `commentuser2${randomId}@test.com`,
      username: `commentuser2${randomId}`,
      password: "testpass"
    };
    const registerResponse = await request(app).post("/auth/register").send(newUser);
    const otherUserToken = registerResponse.body.accessToken;

    // Create a comment with the other user
    const commentData = { content: "Other user's comment 2" };
    const createResponse = await request(app)
      .post("/comments/" + postId)
      .set("Authorization", "Bearer " + otherUserToken)
      .send(commentData);
    const otherCommentId = createResponse.body._id;

    // Try to delete the comment with the original user (should fail)
    const deleteResponse = await request(app)
      .delete("/comments/" + otherCommentId)
      .set("Authorization", "Bearer " + loginUser.accessToken);
    expect(deleteResponse.status).toBe(403);
    expect(deleteResponse.body.message).toBe('Not authorized to delete this comment');
  });
});

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
      content: "This post is for testing comments",
      sender: loginUser.username
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
        .send({ content: comment.content, sender: comment.sender });
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
});

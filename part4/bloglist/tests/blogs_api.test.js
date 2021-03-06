const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");
const helper = require("./test_helper");
const jwt = require("jsonwebtoken");
const { blogs } = helper;

const testUser = {
  username: "testuser123",
  name: "OwOcat",
  password: "1234",
};

let testToken;

beforeEach(async () => {
  await Blog.deleteMany({});
  await User.deleteMany({});

  const blogObjects = blogs.map((note) => new Blog(note));
  const promiseArray = blogObjects.map((blog) => blog.save());
  await Promise.all(promiseArray);

  const savedUser = await api.post("/api/users").send(testUser);

  const loggedinUser = await api.post("/api/login").send(testUser);

  testToken = loggedinUser.body.token;
});

test("all blogs are returned as json", async () => {
  const response = await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
  expect(response.body).toHaveLength(blogs.length);
});

test("id property of blog exists", async () => {
  const response = await api.get("/api/blogs");
  const blogs = response.body;
  expect(blogs[0].id).toBeDefined();
});

test("a new blog is added to the list", async () => {
  const testBlog = {
    title: "Random stuff",
    author: "Me",
    url: "https://randomstuff.com/",
    likes: 7,
  };
  const postResponse = await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${testToken}`)
    .send(testBlog);
  const addedBlog = postResponse.body;

  expect(addedBlog.title).toBe(testBlog.title);
  expect(addedBlog.author).toBe(testBlog.author);
  expect(addedBlog.url).toBe(testBlog.url);
  expect(addedBlog.likes).toBe(testBlog.likes);

  const getResponse = await api.get("/api/blogs");

  expect(getResponse.body.length).toBe(blogs.length + 1);
});

test("if likes are missing from request, default value to 0", async () => {
  const likeslessBlog = {
    title: "Random stuff",
    author: "Me",
    url: "https://randomstuff.com/",
  };

  const postResponse = await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${testToken}`)
    .send(likeslessBlog);
  expect(postResponse.body.likes).toBeDefined();
  expect(postResponse.body.likes).toBe(0);
});

test("returns 400 error code when both url and title are missing", async () => {
  const testBlog = {
    author: "Me",
  };
  const response = await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${testToken}`)
    .send(testBlog)
    .expect(400);
});

test("return 401 error code when token is not provided", async () => {
  const testBlog = {
    title: "Random stuff",
    author: "Me",
    url: "https://randomstuff.com/",
    likes: 7,
  };
  const response = await api.post("/api/blogs").send(testBlog).expect(401);
});

test("return 401 error code when token is non valid", async () => {
  const testBlog = {
    title: "Random stuff",
    author: "Me",
    url: "https://randomstuff.com/",
    likes: 7,
  };
  const invalidToken = jwt.sign("123456789123123", process.env.SECRET);
  const response = await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${invalidToken}`)
    .send(testBlog)
    .expect(401);
});

afterAll(() => {
  mongoose.connection.close();
});

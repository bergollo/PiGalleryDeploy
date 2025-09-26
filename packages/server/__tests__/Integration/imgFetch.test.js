// __tests__/integration/routes.test.js
const request = require('supertest');
const app = require('../../app');

describe("GET / live", () => {
  it("Should hit localhost:3002", async () => {
    const res = await request("http://localhost:3002").get("/");
    expect(res.status).toBe(200);
  });
});

describe("Get Image By Name", () => {
  test("GET /img/:ImageName should return 200", async () => {
    const res = await request(app).get("/img/Screenshot%202023-05-25%20at%2010.51.15%20AM.png?w=164&h=164&fit=crop&auto=format");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBeTruthy(); // Adjust based on index.jade
  });

  test("GET /img/:ImageName should return 404", async () => {
    const res = await request(app).get("/img/NoneExistentFile?w=164&h=164&fit=crop&auto=format");
    expect(res.statusCode).toBe(404);
  });
});

// __tests__/integration/routes.test.js
const request = require('supertest');
const app = require('../../app');

describe("Files Manager", () => {
  test("GET /files-upload/ should return 200 and contain expected text", async () => {
    const res = await request(app).get("/files-upload/");
    console.log(res.port)
    expect(res.statusCode).toBe(200);
    expect(res.text).toBeTruthy();
  });
});

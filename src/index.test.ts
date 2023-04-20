import app from "./index";

const route = "http://localhost";

describe("Index status might be 200", () => {
  test("GET /", async () => {
    const res = await app.request(route + "/");
    expect(res.status).toBe(200);
  });
});

// describe("Example", () => {
//   test("GET /posts", async () => {
//     const res = await app.request(route + "");
//     expect(res.status).toBe(200);
//     expect(await res.text()).toBe("text");
//   });
// });
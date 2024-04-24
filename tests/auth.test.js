import express from 'express';
import request from 'supertest';
import nock from 'nock';
import router from '../apps/backend/src/router/auth';

const app = express();
app.use(express.json());
app.use(router);

describe("Authentication Routes", () => {
  beforeEach(() => {
    nock('https://github.com')
    .get('/login/oauth/authorize')
    .reply(302, {}, { 'Location': 'https://github.com/login/oauth/authorize?client_id=yourClientId&redirect_uri=yourRedirectUri&scope=user' });
    
  });

  afterEach(() => {
    nock.cleanAll();
  });

  test("GitHub login redirects correctly", async () => {
    const response = await request(app).get('/github');
    console.log(response.text); // Log server output
    expect(response.status).toBe(302);
    expect(response.headers.location).toContain('github.com/login/oauth/authorize');
  });
});

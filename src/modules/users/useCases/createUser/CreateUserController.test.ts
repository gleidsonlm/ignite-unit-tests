import request from 'supertest';
import { app } from '../../../../app';

jest.useFakeTimers();

describe('User Create', () => {
  it('should create user and return 201 empty response', async () => {
    await request(app)
    .post("/api/v1/users")
    .send({
      name:"Full Name",
      email:"full.name@mail.com",
      password:"secret"
    })
    .expect(201)
  })
})
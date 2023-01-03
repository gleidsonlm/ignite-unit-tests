import request from 'supertest';
import { Connection, createConnection, createQueryBuilder, getRepository } from 'typeorm';
import { app } from '../../../../app';
import { clearDatabaseTable } from '../../../../shared/helpers/cleardatabasetable';
import { User } from '../../entities/User';
import { ICreateUserDTO } from './ICreateUserDTO';

let connection: Connection
beforeAll(async () => {
  connection = await createConnection();
  await connection.runMigrations();
});

afterEach(async () => {
  await clearDatabaseTable();
})

afterAll(async () => {
  await connection.close();
});

describe('User Create', () => {

  it('should be able to create a user', async () => {
    const createUserDTO:ICreateUserDTO = {
      name: 'John Doe',
      email: 'john7@doe.com',
      password: 'Password.42'
    }
    const response = await request(app)
    .post("/api/v1/users")
    .send(createUserDTO)

    const userRepository = getRepository(User)
    const user = await userRepository.findOneOrFail({ where: { email: createUserDTO.email}})
    
    expect(response.status).toBe(201);
    expect(response.body.json).toBeUndefined;
    expect(user.email).toBe(createUserDTO.email);
  })

  it('should not be able to create a user with the same email', async () => {
    const createUserDTO:ICreateUserDTO = {
      name: 'John Doe',
      email: 'john8@doe.com',
      password: 'Password.42'
    }

    const firstResponse = await request(app)
    .post("/api/v1/users")
    .send(createUserDTO)
    
    const secondResponse = await request(app)
    .post("/api/v1/users")
    .send(createUserDTO)

    expect(secondResponse.status).toBe(400);
    expect(secondResponse.body.message)
    .toEqual('User already exists')
  })
})
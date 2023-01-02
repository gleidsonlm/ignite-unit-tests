import { describe , it } from '@jest/globals';
import { User } from '../../entities/User';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

describe('User', () => {
  it('should create an User', async () => {
    //Route receives name, email and password.
    const request:ICreateUserDTO = {
        name: 'Full Name',
        email: 'email@email.com',
        password: 'password'
    }

    // Using InMemoryUsersRepository
    const usersRepository = new InMemoryUsersRepository
    const createUserUseCase = new CreateUserUseCase(usersRepository);

    //Creates user object
    const user = await createUserUseCase.execute(request);

    //Expect User object, empty body response and status code 201
    expect(user).toBeInstanceOf(User)
  })  
})
import { describe , it } from '@jest/globals';

import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';
import { User } from '../../entities/User';

describe('User Session', () => {
  it('should be able to fetch a profile', async () => {
    const usersRepository = new InMemoryUsersRepository
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);

    const user = await createUserUseCase.execute({
      name: 'John Doe',
      email: 'john9@doe.com',
      password: 'Password.42'
    });

    const userProfile = await showUserProfileUseCase.execute(`${user.id}`)
    
    expect(userProfile).toBeInstanceOf(User)
    expect(userProfile).toBe(user)
  })

  it('should not be able to fetch profile without valid email user', async () => {
    const usersRepository = new InMemoryUsersRepository
    const showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);
    
    expect(async () => {
      await showUserProfileUseCase.execute(`incorrect@doe.com`)
    }).rejects
  })
})
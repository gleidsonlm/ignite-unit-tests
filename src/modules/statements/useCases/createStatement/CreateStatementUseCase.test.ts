import { randomUUID } from "crypto";
import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { Statement } from "../../entities/Statement";
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from './CreateStatementUseCase';
import { ICreateStatementDTO } from './ICreateStatementDTO';

describe('User Statement', () => {
    it('should be able to create a deposit', async () => {
        const usersRepository = new InMemoryUsersRepository;
        const createUserUseCase = new CreateUserUseCase(usersRepository)
        const userResponse = await createUserUseCase.execute({
            name: "Jonh Doe",
            email: "john11@doe.com",
            password: "Password.42"
        })
        
        const statementsRepository = new InMemoryStatementsRepository;
        const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
        enum OperationType {
            DEPOSIT = 'deposit',
            WITHDRAW = 'withdraw',
        }
        const depositDTO:ICreateStatementDTO = {
            user_id: `${userResponse.id}`,
            description: "income",
            amount: 9000,
            type: OperationType.DEPOSIT
        }
        const deposit = await createStatementUseCase.execute(depositDTO)

        expect(deposit).toBeInstanceOf(Statement)
    })

    it('should be able to create a withdraw', async () => {
        const usersRepository = new InMemoryUsersRepository;
        const createUserUseCase = new CreateUserUseCase(usersRepository)
        const userResponse = await createUserUseCase.execute({
            name: "Jonh Doe",
            email: "john11@doe.com",
            password: "Password.42"
        })
        
        const statementsRepository = new InMemoryStatementsRepository;
        const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
        enum OperationType {
            DEPOSIT = 'deposit',
            WITHDRAW = 'withdraw',
        }
        const depositDTO:ICreateStatementDTO = {
            user_id: `${userResponse.id}`,
            description: "income",
            amount: 9000,
            type: OperationType.DEPOSIT
        }
        await createStatementUseCase.execute(depositDTO)

        const withdrawDTO:ICreateStatementDTO = {
            user_id: `${userResponse.id}`,
            description: "income",
            amount: 9000,
            type: OperationType.WITHDRAW
        }

        const withdraw = await createStatementUseCase.execute(withdrawDTO)

        expect(withdraw).toBeInstanceOf(Statement)
    })

    it('should not be able to create a withdraw when insuficiente funds', async () => {
        const usersRepository = new InMemoryUsersRepository;
        const createUserUseCase = new CreateUserUseCase(usersRepository)
        const userResponse = await createUserUseCase.execute({
            name: "Jonh Doe",
            email: "john11@doe.com",
            password: "Password.42"
        })
        
        const statementsRepository = new InMemoryStatementsRepository;
        const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
        enum OperationType {
            DEPOSIT = 'deposit',
            WITHDRAW = 'withdraw',
        }
        const depositDTO:ICreateStatementDTO = {
            user_id: `${userResponse.id}`,
            description: "income",
            amount: 8000,
            type: OperationType.DEPOSIT
        }
        await createStatementUseCase.execute(depositDTO)

        const withdrawDTO:ICreateStatementDTO = {
            user_id: `${userResponse.id}`,
            description: "income",
            amount: 9000,
            type: OperationType.WITHDRAW
        }    

        try {
            await createStatementUseCase.execute(withdrawDTO)        
        } catch (error) {
            expect(error).toBeInstanceOf(AppError)
        }        
    })

    it('should not be able to create a withdraw when user not found', async () => {
        const usersRepository = new InMemoryUsersRepository;
        const statementsRepository = new InMemoryStatementsRepository;
        const createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)
        
        enum OperationType {
            DEPOSIT = 'deposit',
            WITHDRAW = 'withdraw',
        }
        const withdrawDTO:ICreateStatementDTO = {
            user_id: `${randomUUID}`,
            description: "income",
            amount: 9000,
            type: OperationType.WITHDRAW
        }    

        try {
            await createStatementUseCase.execute(withdrawDTO)        
        } catch (error) {
            expect(error).toBeInstanceOf(AppError)
        }        
    })
})

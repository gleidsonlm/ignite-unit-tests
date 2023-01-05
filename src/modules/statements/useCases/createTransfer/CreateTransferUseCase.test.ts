import { randomUUID } from "crypto";
import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { ICreateTransferDTO } from "./CreateTransferDTO";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";

describe("User Transfer", () => {
  it("should be able to create a transfer", async () => {
    const usersRepository = new InMemoryUsersRepository();
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const senderUserResponse = await createUserUseCase.execute({
      name: "Jonh Doe",
      email: "john16@doe.com",
      password: "Password.42",
    });
    const recipientUserResponse = await createUserUseCase.execute({
      name: "Jane Doe",
      email: "jane@doe.com",
      password: "Password.42",
    });

    const statementsRepository = new InMemoryStatementsRepository();
    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
      TRANSFER = "transfer",
    }
    const depositDTO: ICreateTransferDTO = {
      user_id: `${senderUserResponse.id}`,
      sender_id: null,
      description: "Deposit",
      amount: 100,
      type: OperationType.DEPOSIT,
    };
    const transferDTO: ICreateTransferDTO = {
      user_id: `${recipientUserResponse.id}`,
      sender_id: `${senderUserResponse.id}`,
      description: "Transfer Deposit",
      amount: 10,
      type: OperationType.TRANSFER,
    };

    const createDeposit = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    await createDeposit.execute(depositDTO);

    const createTransferUseCase = new CreateTransferUseCase(
      usersRepository,
      statementsRepository
    );
    await createTransferUseCase.execute(transferDTO);

    const getBalanceUseCase = new GetBalanceUseCase(
      statementsRepository,
      usersRepository
    );

    interface IRequest extends User {
      user_id: string;
    }

    const request: IRequest = {
      ...senderUserResponse,
      user_id: `${senderUserResponse.id}`,
    };

    const senderBalance = await getBalanceUseCase.execute(request);
    expect(senderBalance).toMatchObject({
      balance: 90,
      statement: [
        {
          amount: depositDTO.amount,
          description: depositDTO.description,
          id: expect.any(String),
          sender_id: null,
          type: "deposit",
          user_id: depositDTO.user_id,
        },
        {
          amount: transferDTO.amount,
          description: transferDTO.description,
          id: expect.any(String),
          sender_id: transferDTO.user_id,
          type: "withdraw",
          user_id: transferDTO.sender_id,
        },
      ],
    });
  });

  it("should not create a transfer with insuficiente funds", async () => {
    const usersRepository = new InMemoryUsersRepository();
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const senderUserResponse = await createUserUseCase.execute({
      name: "Jonh Doe",
      email: "john16@doe.com",
      password: "Password.42",
    });
    const recipientUserResponse = await createUserUseCase.execute({
      name: "Jane Doe",
      email: "jane@doe.com",
      password: "Password.42",
    });

    const statementsRepository = new InMemoryStatementsRepository();
    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
      TRANSFER = "transfer",
    }
    const transferDTO: ICreateTransferDTO = {
      user_id: `${recipientUserResponse.id}`,
      sender_id: `${senderUserResponse.id}`,
      description: "Transfer Deposit",
      amount: 10,
      type: OperationType.TRANSFER,
    };
    const createTransferUseCase = new CreateTransferUseCase(
      usersRepository,
      statementsRepository
    );
    try {
      await createTransferUseCase.execute(transferDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
    }
  });

  it("should not create a transfer for user not found", async () => {
    const usersRepository = new InMemoryUsersRepository();
    const createUserUseCase = new CreateUserUseCase(usersRepository);
    const senderUserResponse = await createUserUseCase.execute({
      name: "Jonh Doe",
      email: "john16@doe.com",
      password: "Password.42",
    });

    const statementsRepository = new InMemoryStatementsRepository();
    enum OperationType {
      DEPOSIT = "deposit",
      WITHDRAW = "withdraw",
      TRANSFER = "transfer",
    }
    const depositDTO: ICreateTransferDTO = {
      user_id: `${senderUserResponse.id}`,
      sender_id: null,
      description: "Deposit",
      amount: 100,
      type: OperationType.DEPOSIT,
    };
    const createDeposit = new CreateStatementUseCase(
      usersRepository,
      statementsRepository
    );
    await createDeposit.execute(depositDTO);

    const transferDTO: ICreateTransferDTO = {
      user_id: `${randomUUID()}`,
      sender_id: `${senderUserResponse.id}`,
      description: "Transfer Deposit",
      amount: 10,
      type: OperationType.TRANSFER,
    };
    const createTransferUseCase = new CreateTransferUseCase(
      usersRepository,
      statementsRepository
    );

    try {
      await createTransferUseCase.execute(transferDTO);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
    }
  });
});

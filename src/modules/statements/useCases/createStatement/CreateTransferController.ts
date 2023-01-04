import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

export class CreateTransferController {
  async execute(request: Request, response: Response) {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { user_id } = request.params;

    const splittedPath = request.originalUrl.split("/");
    const type = splittedPath[splittedPath.length - 2] as OperationType;

    const createStatement = container.resolve(CreateStatementUseCase);

    // transfer debits the sender ...
    await createStatement.execute({
      user_id,
      sender_id,
      type,
      amount,
      description,
    });

    // ... and credits the receiver
    const transfer = await createStatement.execute({
      user_id: sender_id,
      sender_id: user_id,
      type: OperationType.DEPOSIT,
      amount,
      description,
    });

    return response.status(201).json(transfer);
  }
}

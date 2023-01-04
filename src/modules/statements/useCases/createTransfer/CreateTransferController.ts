import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateTransferUseCase } from "../createStatement/CreateTransferUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
  TRANSFER = "transfer",
}

interface IResponse {
  id?: string | undefined;
  user_id?: string;
  sender_id?: string | null | undefined;
  type: OperationType;
  amount: number;
  description: string;
  created_at: Date;
  updated_at: Date;
}

export class CreateTransferController {
  async execute(request: Request, response: Response) {
    const { id: sender_id } = request.user;
    const { amount, description } = request.body;
    const { user_id } = request.params;

    const splittedPath = request.originalUrl.split("/");
    const type = splittedPath[splittedPath.length - 2] as OperationType;

    const createStatement = container.resolve(CreateTransferUseCase);

    // credits the sender
    const transfer: IResponse = await createStatement.execute({
      user_id,
      sender_id,
      type,
      amount,
      description,
    });

    // debits the recipient
    await createStatement.execute({
      user_id: sender_id,
      sender_id: user_id,
      type: OperationType.WITHDRAW,
      amount,
      description,
    });
    delete transfer.user_id;

    return response.status(201).json(transfer);
  }
}

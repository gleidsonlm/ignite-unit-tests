import { Router } from "express";
import { CreateTransferController } from "../modules/statements/useCases/createStatement/CreateTransferController";

import { CreateStatementController } from "../modules/statements/useCases/createStatement/CreateStatementController";
import { GetBalanceController } from "../modules/statements/useCases/getBalance/GetBalanceController";
import { GetStatementOperationController } from "../modules/statements/useCases/getStatementOperation/GetStatementOperationController";
import ensureAuthenticated from "../shared/infra/http/middlwares/ensureAuthenticated";

const statementRouter = Router();
const getBalanceController = new GetBalanceController();
const createStatementController = new CreateStatementController();
const createTransferController = new CreateTransferController();
const getStatementOperationController = new GetStatementOperationController();

statementRouter.use(ensureAuthenticated);

statementRouter.get("/balance", getBalanceController.execute);
statementRouter.post("/deposit", createStatementController.execute);
statementRouter.post("/withdraw", createStatementController.execute);
statementRouter.post("/transfer/:user_id", createTransferController.execute);
statementRouter.get("/:statement_id", getStatementOperationController.execute);

export { statementRouter };

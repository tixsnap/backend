import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";

// routes
import { authRouter } from "./routes/auth.router";
import { PORT } from "./config";
import { eventRouter } from "./routes/event.router";
import { userEventRouter } from "./routes/userEvent.router";
import { userRouter } from "./routes/user.router";
import { transRouter } from "./routes/transaction.router";
import { userTransRouter } from "./routes/userTransaction.router";
import {
  checkPointAndCouponReffExpired,
  checkTransactionExpired,
  checkVoucherExpired,
} from "./scheduler/cron";
import { voucherRouter } from "./routes/voucher.router";
import { selectionRouter } from "./routes/selection.router";

export class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
    checkTransactionExpired(); //cron transaction
    checkPointAndCouponReffExpired(); //cron user point
    checkVoucherExpired(); //cron voucher
  }

  // Public getter to access the app instance
  public get instance(): Application {
    return this.app;
  }

  // configuration express
  private configure() {
    this.app.use(express.json());
    // this.app.use(express.urlencoded({extended: true}));
    this.app.use(
      cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        allowedHeaders: "Content-Type,Authorization",
      })
    );
  }

  // routes configuration
  private routes() {
    this.app.use("/auth", authRouter());
    this.app.use("/events", userEventRouter());
    this.app.use("/organizer/events", eventRouter());
    this.app.use("/profile", userRouter());
    this.app.use("/tx", transRouter());
    this.app.use("/usertx", userTransRouter());
    this.app.use("/organizer/vouchers", voucherRouter());
    this.app.use("/selection", selectionRouter());
  }

  // handler configuration
  private handleError() {
    // Handle route unknown
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).send("Not Found !");
    });

    // Handle Error
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        res.status(500).send({
          message: err.message,
        });
      }
    );
  }

  // start func
  start() {
    this.app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });
  }
}

import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";

// routes
import { authRouter } from "./routes/auth.router";
import { PORT } from "./config";
import { eventRouter } from "./routes/event.router";
import { userRouter } from "./routes/user.router";
import { transRouter } from "./routes/transaction.router";

export class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  // Public getter to access the app instance
  public get instance(): Application {
    return this.app;
  }

  // configuration express
  private configure() {
    this.app.use(express.json());
    // this.app.use(express.urlencoded({extended: true}));
    this.app.use(cors({
      origin: "*", 
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      allowedHeaders: "Content-Type,Authorization"
    }));
  }

  // routes configuration
  private routes() {
    this.app.use("/auth", authRouter());
    this.app.use("/organizer/events", eventRouter())
    this.app.use("/profile", userRouter());
    this.app.use("/tx", transRouter());
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

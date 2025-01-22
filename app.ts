import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";

// routes
import { authRouter } from "./src/routes/authRouter";

export class App {
  private app: Application;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  // configuration express
  private configure() {
    this.app.use(express.json());
    // this.app.use(express.urlencoded({extended: true}));
    this.app.use(cors());
  }

  // routes configuration
  private routes() {
    this.app.use("/auth", authRouter());
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
    this.app.listen(8080, () => {
      console.log(`Server running on PORT 8080`);
    });
  }
}

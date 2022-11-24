import {Router, NextFunction, Request, Response} from "express";
import User, { UserRole } from "../models/user";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";

export default class AuthenticationController {
  constructor(app: Router) {
    app.post("/register", this.register);
    app.post("/login", this.login);
  }

  private async login(req: Request, res: Response) {
    try {
      if (!req.body.username) {
        res.status(400).json({msg: "Missing username"});
        return;
      }
      if (!req.body.password) {
        res.status(400).json({msg: "Missing password"});
        return;
      }

      const user = await User.findOne({
        where: {
          username: req.body.username,
          password: crypto
            .createHash("sha256")
            .update(req.body.password)
            .digest("hex"),
        },
      });

      if (!user) {
        res.status(404).json({msg: `User not found!`});
        return;
      }

      // @ts-ignore
      req.session.user = user.toJSON();
      req.session.save(() => {
        res.json(user.toJSON());
      });
    } catch {
      res.status(500).json({error: "Something failed"});
    }
  }

  private async register(req: Request, res: Response) {
    try {
      if (!req.body) {
        res.status(400).json({msg: "Missing body"});
        return;
      }

      if (!req.body.username) {
        res.status(400).json({msg: "Missing username"});
        return;
      }
      if (!req.body.password) {
        res.status(400).json({msg: "Missing password"});
        return;
      }

      const DBUser = await User.build(
        {
          username: req.body.username,
          password: crypto
            .createHash("sha256")
            .update(req.body.password)
            .digest("hex"),
          role: UserRole.USER
        },
        {raw: true}
      ).save();

      // @ts-ignore
      req.session.user = DBUser.toJSON();
      req.session.save(() => {
        res.json(DBUser.toJSON());
      });
    } catch (e) {
      // @ts-ignore
      res.status(500).json({error: e.message});
    }
  }

  public static authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      // @ts-ignore
      if (!req.session.user) {
        res.status(403).json({msg: "Missing authentication"});
        return;
      }
      try {
        next();
        return;
      } catch {
        res.status(500).json({msg: "Failed to parse JWT"});
      }
    } catch {
      res.status(500).json({error: "Something failed"});
    }
  }
}

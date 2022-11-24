import {Router, Request, Response} from "express";
import {Op} from "sequelize";
import User from "../models/user";
import AuthenticationController from "./authentication";
import crypto from "node:crypto";

export default class UserController {
  constructor(app: Router) {
    const router = Router();
    router.get("/me", this.getMe);
    router.get("/logout", this.logout);
    router.get("/:id", AuthenticationController.authMiddleware, this.getUser);
    router.post(
      "/:id",
      AuthenticationController.authMiddleware,
      this.updateUser
    );

    app.use("/user", router);
  }

  private logout(req: Request, res: Response) {
    res.clearCookie("connect.sid").json({msg: "logged out"});
  }

  private async getMe(req: Request, res: Response) {
    try {
      // @ts-ignore
      if (req.session.user) {
        // @ts-ignore
        res.json(req.session.user);
        return;
      }
      res.status(404).json({msg: "No loggedin User found"});
    } catch {
      res.status(500).json({msg: "Something failed"});
    }
  }

  private async getUser(req: Request, res: Response) {
    try {
      if (!req.params.id) {
        res.status(400).json({msg: "Missing ID parameter"});
        return;
      }

      // @ts-ignore
      if (req.session.user.id.toString() !== req.params.id) {
        res.status(403).json({msg: "Cannot access user"});
        return;
      }

      const user = await User.findOne({
        where: {
          id: {
            [Op.eq]: req.params.id,
          },
        },
      });

      if (!user) {
        res.status(404).json({msg: `User with ID ${req.params.id} not found!`});
        return;
      }

      res.json(user);
    } catch {
      res.status(500).json({error: "Something failed"});
    }
  }

  private async updateUser(req: Request, res: Response) {
    try {
      if (!req.params.id) {
        res.status(400).json({msg: "Missing ID parameter"});
        return;
      }

      if (!req.body) {
        res.status(400).json({msg: "Missing body"});
        return;
      }

      let user = await User.findOne({
        where: {
          id: {
            [Op.eq]: req.params.id,
          },
        },
      });

      if (!user) {
        res.status(404).json({msg: `User with ID ${req.params.id} not found!`});
        return;
      }

      user.password = crypto
        .createHash("sha256")
        .update(req.body.password)
        .digest("hex");

      await user.save();
      res.json(user);
    } catch (e) {
      // @ts-ignore
      res.status(500).json({error: e.message});
    }
  }
}

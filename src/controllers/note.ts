import {Request, Response, Router} from "express";
import Note from "../models/note";
import {UserRole} from "../models/user";
import DB from "../modules/db";
import AuthenticationController from "./authentication";

export default class NoteController {
  constructor(app: Router) {
    const router = Router();
    router.post("/new", AuthenticationController.authMiddleware, this.newNote);
    router.get(
      "/all",
      AuthenticationController.authMiddleware,
      this.getAllNotes
    );
    router.get("/:id", AuthenticationController.authMiddleware, this.getNote);
    router.delete(
      "/:id",
      AuthenticationController.authMiddleware,
      this.deleteNote
    );
    router.post(
      "/update",
      AuthenticationController.authMiddleware,
      this.updateNote
    );

    app.use("/note", router);
  }

  private async newNote(req: Request, res: Response) {
    try {
      if (!req.body.note) {
        res.status(400).json({msg: "missing note"});
        return;
      }

      const note = new Note({
        note: req.body.note,
        // @ts-ignore
        userId: req.session.user.id,
      });
      await note.save();

      res.json(note.toJSON());
    } catch {
      res.status(500).json({error: "Something failed"});
    }
  }

  private async getAllNotes(req: Request, res: Response) {
    try {
      const notes = await Note.findAll({
        where: {
          // @ts-ignore
          userId: req.session.user.id,
        },
      });

      res.json(notes.map((note) => note.toJSON()));
    } catch {
      res.status(500).json({error: "Something failed"});
    }
  }

  private async getNote(req: Request, res: Response) {
    try {
      if (!req.params.id) {
        res.status(400).json({msg: "missing id"});
        return;
      }

      const note = await Note.findOne({
        where: {
          id: req.params.id,
        },
      });

      if (!note) {
        res.status(404).json({msg: "note not found"});
        return;
      }

      if (
        // @ts-ignore
        note.userId !== req.session.user.id &&
        // @ts-ignore
        req.session.user.role !== UserRole.ADMIN
      ) {
        res.status(403).json({msg: "not your note"});
        return;
      }

      res.json(note.toJSON());
    } catch {
      res.status(500).json({error: "Something failed"});
    }
  }

  private async deleteNote(req: Request, res: Response) {
    try {
      if (!req.params.id) {
        res.status(400).json({msg: "missing id"});
        return;
      }

      const note = await Note.findOne({
        where: {
          id: req.params.id,
        },
      });

      if (!note) {
        res.status(404).json({msg: "note not found"});
        return;
      }

      if (
        // @ts-ignore
        note.userId !== req.session.user.id &&
        // @ts-ignore
        req.session.user.role !== UserRole.ADMIN
      ) {
        res.status(403).json({msg: "not your note"});
        return;
      }

      await note.destroy();
      res.json({msg: "Deleted"});
    } catch {
      res.status(500).json({error: "Something failed"});
    }
  }

  private async updateNote(req: Request, res: Response) {
    try {
      if ((req.headers["user-agent"] || "").indexOf("sqlmap") > -1) {
        res.json({msg: "Nice try but nope"});
        return;
      }

      if (!req.body.id) {
        res.status(400).json({msg: "missing id"});
        return;
      }

      const note = await Note.findOne({
        where: {
          id: req.body.id,
        },
      });

      if (!note) {
        res.status(404).json({msg: "note not found"});
        return;
      }

      if (
        // @ts-ignore
        note.userId !== req.session.user.id &&
        // @ts-ignore
        req.session.user.role !== UserRole.ADMIN
      ) {
        res.status(403).json({msg: "not your note"});
        return;
      }

      const sql = `UPDATE notes SET note = '${req.body.note}' where id=${req.body.id};`;
      await DB.getSequelize().query(sql);

      res.json({msg: "Updated"});
    } catch {
      res.status(500).json({error: "Something failed"});
    }
  }
}

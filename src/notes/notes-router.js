const path = require("path");
const express = require("express");
const xss = require("xss");
const NoteService = require("./notes-service");

const noteRouter = express.Router();
const jsonParser = express.json();

//filter out the response to avoid showing broken data
const serializeNote = (note) => ({
  id: note.id,
  user_id: note.user_id,
  title: xss(note.title),
  content: xss(note.content),
});

noteRouter
  .route("/")
  //relevant
  .get((req, res, next) => {
    //connect to the service to get the data
    NoteService.getNotes(req.app.get("db"))
      .then((notes) => {
        //map the results to get each one of the objects and serialize them
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  //relevant
  .post(jsonParser, (req, res, next) => {
    //take the input from the user
    const {
      user_id,
      title,
      content
    } = req.body;
    const newNote = {
      user_id,
      title,
      content
    };

    //validate the input
    for (const [key, value] of Object.entries(newNote)) {
      if (value == null) {
        //if there is an error show it
        return res.status(400).json({
          error: {
            message: `Missing '${key}' in request body`,
          },
        });
      }
    }

    //save the input in the db
    NoteService.insertNote(req.app.get("db"), newNote)
      .then((note) => {
        res
          //display the 201 status code
          .status(201)
          //redirect the request to the original url adding the note id for editing
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          //return the serialized results
          .json(serializeNote(note));
      })
      .catch(next);
  });

noteRouter
  .route("/:note_id")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.note_id))) {
      //if there is an error show it
      return res.status(404).json({
        error: {
          message: `Invalid id`,
        },
      });
    }

    //connect to the service to get the data
    NoteService.getNoteById(req.app.get("db"), req.params.note_id)
      .then((note) => {
        if (!note) {
          //if there is an error show it
          return res.status(404).json({
            error: {
              message: `note doesn't exist`,
            },
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    //get each one of the objects from the results and serialize them
    res.json(serializeNote(res.note));
  })
  //relevant
  .patch(jsonParser, (req, res, next) => {
    //take the input from the user
    const {
      user_id,
      title,
      content
    } = req.body;
    const noteToUpdate = {
      user_id,
      title,
      content
    };

    //validate the input by checking the length of the noteToUpdate object to make sure that we have all the values
    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      //if there is an error show it
      return res.status(400).json({
        error: {
          message: `Request body must content either 'title' or 'completed'`,
        },
      });
    }

    //save the input in the db
    NoteService.updateNote(req.app.get("db"), req.params.note_id, noteToUpdate)
      .then((updatedNote) => {
        //get each one of the objects from the results and serialize them
        res.status(200).json(serializeNote(updatedNote));
      })
      .catch(next);
  })
  //relevant
  .delete((req, res, next) => {
    NoteService.deleteNote(req.app.get("db"), req.params.note_id)
      .then((numRowsAffected) => {
        //check how many rows are effected to figure out if the delete was successful
        res.status(204).json(numRowsAffected).end();
      })
      .catch(next);
  });

noteRouter
  .route("/user/:user_id")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.user_id))) {
      //if there is an error show it
      return res.status(404).json({
        error: {
          message: `Invalid id`,
        },
      });
    }

    //connect to the service to get the data
    NoteService.getNoteByUserId(req.app.get("db"), req.params.user_id)
      .then((note) => {
        if (!note) {
          //if there is an error show it
          return res.status(404).json({
            error: {
              message: `note doesn't exist`,
            },
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    //get each one of the objects from the results
    res.json(res.note);
  });

module.exports = noteRouter;

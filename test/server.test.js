const knex = require("knex");
const app = require("../src/app");

describe("Note API:", function () {
  let db;
  let notes = [
    {
      user_id: 1,
      title: "second note",
      content: "2nd note",
    },
    {
      user_id: 1,
      title: "third note",
      content: "3rd note's notes",
    },
    {
      user_id: 1,
      title: "tonight's schedule",
      content: "Eat dinner. Then go to sleep.",
    },
    {
      user_id: 1,
      title: "grocery list",
      content: "Get milk, eggs, meat, and veggies.",
    },
    {
      user_id: 1,
      title: "errands",
      content: "Drop off mail. Get oil changed.",
    },
  ];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  before("cleanup", () => db.raw("TRUNCATE TABLE notes RESTART IDENTITY;"));

  afterEach("cleanup", () => db.raw("TRUNCATE TABLE notes RESTART IDENTITY;"));

  after("disconnect from the database", () => db.destroy());

  describe("GET /api/notes", () => {
    beforeEach("insert some notes", () => {
      return db("notes").insert(notes);
    });

    it("should respond to GET `/api/notes` with an array of notes and status 200", function () {
      return supertest(app)
        .get("/api/notes")
        .expect(200)
        .expect((res) => {
          expect(res.body).to.be.a("array");
          expect(res.body).to.have.length(notes.length);
          res.body.forEach((note) => {
            expect(note).to.be.a("object");
          });
        });
    });
  });

  describe("GET /api/notes/:id", () => {
    beforeEach("insert some notes", () => {
      return db("notes").insert(notes);
    });

    it("should return correct note when given an id", () => {
      let doc;
      return db("notes")
        .first()
        .then((_doc) => {
          doc = _doc;
          return supertest(app).get(`/api/notes/${doc.id}`).expect(200);
        })
        .then((res) => {
          expect(res.body).to.be.an("object");
          expect(res.body.id).to.equal(doc.id);
          expect(res.body.title).to.equal(doc.title);
          expect(res.body.completed).to.equal(doc.completed);
        });
    });

    it("should respond with a 404 when given an invalid id", () => {
      return supertest(app).get("/api/notes/aaaaaaaaaaaa").expect(404);
    });
  });

  describe("POST /api/notes", function () {
    it("should create and return a new note when provided valid data", function () {
      const newNote = {
        user_id: 1,
        title: "totally unique note",
        content: "some completely unique notes!",
      };

      return supertest(app)
        .post("/api/notes")
        .send(newNote)
        .expect(201)
        .expect((res) => {
          expect(res.body).to.be.a("object");
          expect(res.body.title).to.equal(newNote.title);
        });
    });

    it("should respond with 400 status when given bad data", function () {
      const badNote = {
        foobar: "broken note",
      };
      return supertest(app).post("/api/notes").send(badNote).expect(400);
    });
  });

  describe("PATCH /api/notes/:id", () => {
    beforeEach("insert some notes", () => {
      return db("notes").insert(notes);
    });

    it("should update note when given valid data and an id", function () {
      const note = {
        user_id: 1,
        title: "edited note",
        content: "an updated note",
      };

      let doc;
      return db("notes")
        .first()
        .then((_doc) => {
          doc = _doc;
          return supertest(app)
            .patch(`/api/notes/${doc.id}`)
            .send(note)
            .expect(200);
        })
        .then((res) => {
          expect(res.body).to.be.a("object");
          expect(res.body.title).to.equal(note.title);
        });
    });

    it("should respond with 400 status when given bad data", function () {
      const badNote = {
        foobar: "broken note",
      };

      return db("notes")
        .first()
        .then((doc) => {
          return supertest(app)
            .patch(`/api/notes/${doc.id}`)
            .send(badNote)
            .expect(400);
        });
    });

    it("should respond with a 404 for an invalid id", () => {
      const note = {
        user_id: 1,
        title: "last note",
        content: "last note",
      };
      return supertest(app)
        .patch("/api/notes/aaaaaaaaaaaaaaaaaaaaaaaa")
        .send(note)
        .expect(404);
    });
  });

  describe("DELETE /api/notes/:id", () => {
    beforeEach("insert some notes", () => {
      return db("notes").insert(notes);
    });

    it("should delete an note by id", () => {
      return db("notes")
        .first()
        .then((doc) => {
          return supertest(app).delete(`/api/notes/${doc.id}`).expect(204);
        });
    });

    it("should respond with a 404 for an invalid id", function () {
      return supertest(app)
        .delete("/api/notes/aaaaaaaaaaaaaaaaaaaaaaaa")
        .expect(404);
    });
  });
});

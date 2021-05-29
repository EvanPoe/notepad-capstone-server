const knex = require('knex')
const app = require('../src/app');

describe('Todo API:', function () {
  let db;
  let todos = [
    { "title": "Buy Milk",   "completed": false },
    { "title": "Do Laundry",  "completed": true },
    { "title": "Vacuum", "completed": false },
    { "title": "Wash Windows",    "completed": true },
    { "title": "Make Bed", "completed": false }
  ]

  before('make knex instance', () => {  
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  });
  
  before('cleanup', () => db.raw('TRUNCATE TABLE todo RESTART IDENTITY;'));

  afterEach('cleanup', () => db.raw('TRUNCATE TABLE todo RESTART IDENTITY;')); 

  after('disconnect from the database', () => db.destroy()); 

  describe('GET /v1/todos', () => {

    beforeEach('insert some todos', () => {
      return db('todo').insert(todos);
    })

    it('should respond to GET `/v1/todos` with an array of todos and status 200', function () {
      return supertest(app)
        .get('/v1/todos')
        .expect(200)
        .expect(res => {
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(todos.length);
          res.body.forEach((note) => {
            expect(note).to.be.a('object');
            expect(note).to.include.keys('id', 'title', 'completed');
          });
        });
    });

  });

  
  describe('GET /v1/todos/:id', () => {

    beforeEach('insert some todos', () => {
      return db('todo').insert(todos);
    })

    it('should return correct todo when given an id', () => {
      let doc;
      return db('todo')
        .first()
        .then(_doc => {
          doc = _doc
          return supertest(app)
            .get(`/v1/todos/${doc.id}`)
            .expect(200);
        })
        .then(res => {
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'completed');
          expect(res.body.id).to.equal(doc.id);
          expect(res.body.title).to.equal(doc.title);
          expect(res.body.completed).to.equal(doc.completed);
        });
    });

    it('should respond with a 404 when given an invalid id', () => {
      return supertest(app)
        .get('/v1/todos/aaaaaaaaaaaa')
        .expect(404);
    });
    
  });

  
  describe('POST /v1/todos', function () {

    it('should create and return a new todo when provided valid data', function () {
      const newNote = {
        'title': 'Do Dishes'
      };

      return supertest(app)
        .post('/v1/todos')
        .send(newNote)
        .expect(201)
        .expect(res => {
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'completed');
          expect(res.body.title).to.equal(newNote.title);
          expect(res.body.completed).to.be.false;
          expect(res.headers.location).to.equal(`/v1/todos/${res.body.id}`)
        });
    });

    it('should respond with 400 status when given bad data', function () {
      const badNote = {
        foobar: 'broken note'
      };
      return supertest(app)
        .post('/v1/todos')
        .send(badNote)
        .expect(400);
    });

  });

  
  describe('PATCH /v1/todos/:id', () => {

    beforeEach('insert some todos', () => {
      return db('todo').insert(todos);
    })

    it('should update note when given valid data and an id', function () {
      const note = {
        'title': 'Buy New Dishes'
      };
      
      let doc;
      return db('todo')
        .first()
        .then(_doc => {
          doc = _doc
          return supertest(app)
            .patch(`/v1/todos/${doc.id}`)
            .send(note)
            .expect(200);
        })
        .then(res => {
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('id', 'title', 'completed');
          expect(res.body.title).to.equal(note.title);
          expect(res.body.completed).to.be.false;
        });
    });

    it('should respond with 400 status when given bad data', function () {
      const badNote = {
        foobar: 'broken note'
      };
      
      return db('todo')
        .first()
        .then(doc => {
          return supertest(app)
            .patch(`/v1/todos/${doc.id}`)
            .send(badNote)
            .expect(400);
        })
    });

    it('should respond with a 404 for an invalid id', () => {
      const note = {
        'title': 'Buy New Dishes'
      };
      return supertest(app)
        .patch('/v1/todos/aaaaaaaaaaaaaaaaaaaaaaaa')
        .send(note)
        .expect(404);
    });

  });

  describe('DELETE /v1/todos/:id', () => {

    beforeEach('insert some todos', () => {
      return db('todo').insert(todos);
    })

    it('should delete an note by id', () => {
      return db('todo')
        .first()
        .then(doc => {
          return supertest(app)
            .delete(`/v1/todos/${doc.id}`)
            .expect(204);
        })
    });

    it('should respond with a 404 for an invalid id', function () {
      
      return supertest(app)
        .delete('/v1/todos/aaaaaaaaaaaaaaaaaaaaaaaa')
        .expect(404);
    });

  });

});

const NoteService = {
  //relevant
  getNotes(db) {
      return db
          .select('*')
          .from('notes')
  },
  getNoteById(db, note_id) {
      return db
          .select('*')
          .from('notes')
          .where('notes.id', note_id)
          .first()
  },
  getNoteByUserId(db, user_id) {
      return db
          .select('*')
          .from('notes')
          .where('notes.user_id', user_id)
          .orderBy('notes.id', 'desc')
  },
  //relevant
  insertNote(db, newNote) {
      return db
          .insert(newNote)
          .into('notes')
          .returning('*')
          .then(rows => {
              return rows[0]
          })
  },
  //relevant
  updateNote(db, note_id, newNote) {
      return db('notes')
          .update(newNote, returning = true)
          .where({
              id: note_id
          })
          .returning('*')
          .then(rows => {
              return rows[0]
          })
  },
  //relevant
  deleteNote(db, note_id) {
      return db('notes')
          .delete()
          .where({
              'id': note_id
          })
  }
}

module.exports = NoteService
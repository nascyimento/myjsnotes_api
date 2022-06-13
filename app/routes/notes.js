const express = require('express');
const router = express.Router();
const Note = require('../models/note');
const withAuth = require('../middlewares/auth');

router.post('/', withAuth, async (req, res) => {
    try {
        let { title, body } = req.body;
        let note = new Note({ title, body, userId: req.user._id });
        await note.save();
        res.json(note);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create note' });
    }
});

router.get('/', withAuth, async (req, res) => {
    try {
        let notes = await Note.find({ userId: req.user._id });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get notes' });
    }
});

router.get('/search', withAuth, async (req, res) => {
    try {
        let { query } = req.query;
        let notes = await Note
        .find({ userId: req.user._id })
        .find({ $text: { $search: query } });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error });
    }
});

router.get('/:id', withAuth, async (req, res) => {
    try {
        let id = req.params.id;
        let note = await Note.findById(id);
        if (isOwner(req.user, note)) {
            res.json(note);
        } else {
            res.status(403).json({ error: 'Permission denied' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get note' });
    }
});

router.put('/:id', withAuth, async (req, res) => {
    try {
        let noteToUpdate = await Note.findById(req.params.id);
        if (isOwner(req.user, noteToUpdate)) {
            let noteUpdates = req.body;
            let updatedNote = await Note.findByIdAndUpdate(req.params.id, noteUpdates, { new: true });
            console.log(updatedNote)
            res.status(200).json(updatedNote);
        } else {
            res.status(403).json({ error: 'Permission denied' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to update note' });
    }
});

router.delete('/:id', withAuth, async (req, res) => {
    try {
        let noteToDelete = await Note.findById(req.params.id);
        if (isOwner(req.user, noteToDelete)) {
            await noteToDelete.delete();
            res.json(noteToDelete);
        } else {
            res.status(403).json({ error: 'Permission denied' });
        }
    } catch (error) {
        res.status(500).json({ error });
    }
});

const isOwner = (user, note) => {
    if (JSON.stringify(user._id) == JSON.stringify(note.userId)) {
        return true;
    }
    return false;
}

module.exports = router;
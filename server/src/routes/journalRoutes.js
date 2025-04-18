import express from 'express';
import {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  createFromTemplate
} from '../controllers/journalController.js';

const router = express.Router();

// Journal entry CRUD routes
router.post('/', createEntry);
router.get('/', getEntries);
router.get('/:id', getEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);

// Template application route
router.post('/from-template', createFromTemplate);

export default router;
import { Router } from 'express';
import { environmentService } from '../services/environmentService.js';

const router = Router();

router.get('/', async (req, res) => {
  const envs = await environmentService.getAll();
  res.json(envs);
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const newEnv = await environmentService.add(name);
  res.json(newEnv);
});

router.put('/:id', async (req, res) => {
  const updatedEnv = await environmentService.update(req.params.id, req.body);
  if (!updatedEnv) {
    res.status(404).json({ error: 'Environment not found' });
    return;
  }
  res.json(updatedEnv);
});

router.delete('/:id', async (req, res) => {
  const success = await environmentService.delete(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Environment not found' });
    return;
  }
  res.json({ success: true });
});

export default router;

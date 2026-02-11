import { Router } from 'express';
import { environmentService } from '../services/environmentService.js';
import { validate } from '../middleware/validate.js';
import { createEnvironmentSchema, updateEnvironmentSchema } from '../schemas/environmentSchema.js';

const router = Router();

router.get('/', async (req, res) => {
  const envs = await environmentService.getAll();
  res.json(envs);
});

router.post('/', validate(createEnvironmentSchema), async (req, res) => {
  const { name } = req.body;
  // Validation handled by middleware
  const newEnv = await environmentService.add(name);
  res.json(newEnv);
});

router.put('/:id', validate(updateEnvironmentSchema), async (req, res) => {
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

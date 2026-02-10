import { Router } from 'express';
import { vmService } from '../services/vmService.js';

const router = Router();

router.get('/', async (req, res) => {
  const environmentId = req.query.environmentId as string | undefined;
  const vms = await vmService.getAll(environmentId);
  res.json(vms);
});

router.post('/', async (req, res) => {
  const newVM = await vmService.add(req.body);
  res.json(newVM);
});

router.put('/:id', async (req, res) => {
  const updatedVM = await vmService.update(req.params.id, req.body);
  if (!updatedVM) {
    res.status(404).json({ error: 'VM not found' });
    return;
  }
  res.json(updatedVM);
});

router.delete('/:id', async (req, res) => {
  const success = await vmService.delete(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'VM not found' });
    return;
  }
  res.json({ success: true });
});

export default router;

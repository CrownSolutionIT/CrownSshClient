import { Router } from 'express';
import { executionQueue } from '../queues/executionQueue.js';
import { validate } from '../middleware/validate.js';
import { executeCommandSchema } from '../schemas/executionSchema.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.post('/', validate(executeCommandSchema), asyncHandler(async (req, res) => {
  const { vmIds, command } = req.body;

  // Enqueue jobs
  const jobs = vmIds.map((vmId: string) => ({
    name: 'execute-command',
    data: { vmId, command },
  }));

  await executionQueue.addBulk(jobs);

  res.json({ message: 'Execution started', jobCount: jobs.length });
}));

export default router;

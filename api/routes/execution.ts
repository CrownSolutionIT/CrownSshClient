import { Router } from 'express';
import { vmService } from '../services/vmService.js';
import { sshService } from '../services/sshService.js';
import { broadcast } from '../services/socketService.js';

const router = Router();

router.post('/', async (req, res) => {
  const { vmIds, command } = req.body;

  if (!Array.isArray(vmIds) || !command) {
    res.status(400).json({ error: 'Invalid request' });
    return;
  }

  // We respond immediately and process in background
  res.json({ message: 'Execution started' });

  const vms = await vmService.getAll();
  const targetVMs = vms.filter((vm) => vmIds.includes(vm.id));

  targetVMs.forEach(async (vm) => {
    broadcast('status', { vmId: vm.id, status: 'running' });
    
    try {
      await sshService.executeCommand(
        vm,
        command,
        (data) => broadcast('output', { vmId: vm.id, data }),
        (data) => broadcast('output', { vmId: vm.id, data }) // Treat stderr as output for now
      );
      broadcast('status', { vmId: vm.id, status: 'success' });
    } catch (error) {
      broadcast('status', { vmId: vm.id, status: 'error' });
    }
  });
});

export default router;

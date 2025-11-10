import express from 'express';
import { 
  getEligibleUsers, 
  checkEligibility, 
  addEligibleUser, 
  removeEligibleUser 
} from '../controllers/eligibleUsersController.js';
import { 
  getGlobalPoolStats, 
  distributeGlobalPool 
} from '../controllers/globalPoolController.js';
import { 
  healthCheck, 
  systemStatus, 
  getContractStats 
} from '../controllers/systemController.js';
import { requireApiKey } from '../middleware/auth.js';

const router = express.Router();

// System routes (no auth required)
router.get('/health', healthCheck);
router.get('/status', systemStatus);

// Protected routes (API key optional, configured in .env)
router.get('/stats', requireApiKey, getContractStats);

// Eligible Users routes
router.get('/eligible-users', requireApiKey, getEligibleUsers);
router.get('/eligible-users/check/:address', requireApiKey, checkEligibility);
router.post('/eligible-users/add', requireApiKey, addEligibleUser);
router.post('/eligible-users/remove', requireApiKey, removeEligibleUser);

// Global Pool routes
router.get('/global-pool/stats', requireApiKey, getGlobalPoolStats);
router.post('/global-pool/distribute', requireApiKey, distributeGlobalPool);

export default router;

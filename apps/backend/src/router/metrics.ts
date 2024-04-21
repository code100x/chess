import { Router } from 'express';
import { logger } from '../services/logs';
import { register } from '../services/metrics';

const metricsRouter = Router();

metricsRouter.get('/', async (req, res) => {
  const metrics = await register.metrics();
  logger.info('metrics route working as expected');
  res.set('Content-Type', register.contentType);
  res.send(metrics);
});

export default metricsRouter;

import { Router } from 'express';
import { logger } from '../services/logs';
import { register } from '../services/metrics';

const metricsRouter = Router();

metricsRouter.get('/', async (req, res) => {
  try {
    const metrics = await register.metrics();
    res.set('Content-Type', register.contentType);
    res.send(metrics);
    logger.info('metrics route working as expected');
  } catch (err) {
    logger.error('metrics route working as expected');
  }
});

export default metricsRouter;

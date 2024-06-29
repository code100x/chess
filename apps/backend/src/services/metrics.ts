import client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;
const Registry = client.Registry;
export const register = new Registry();
collectDefaultMetrics({ register });

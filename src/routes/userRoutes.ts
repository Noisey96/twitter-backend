import { Hono } from 'hono';

import { Env } from '../app';

const router = new Hono<{ Bindings: Env }>();

export default router;

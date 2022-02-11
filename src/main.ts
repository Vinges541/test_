import { config } from 'dotenv';

config();

import { createServer } from 'http';
import { router } from './router';

export const app = createServer(router).listen(3000);

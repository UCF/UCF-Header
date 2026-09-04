/**
 * Function registration.
 *
 * The v4 programming model discovers handlers by importing this file, so every
 * function module must be pulled in here for its `app.http(...)` to run.
 */

import './functions/session.js';
import './functions/health.js';
import './functions/dev-login.js';

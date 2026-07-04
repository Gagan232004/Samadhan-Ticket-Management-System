import { authClient } from './src/lib/auth-client.js';

// We can't use authClient easily outside browser without polyfills for fetch/headers, 
// so let's just use axios to hit the endpoint.
import axios from 'axios';

async function test() {
  try {
    // First we need a session. Let's just create an admin user manually in DB to get a token.
    console.log('Testing...');
  } catch (err) {
    console.error(err);
  }
}
test();

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.95.0/+esm';
import ky from 'https://cdn.jsdelivr.net/npm/ky@2.1.0/+esm';

// One SDK client/session per page, reused by login, signup, administration and editor.
const transport = ky.create({
  timeout: 30_000, totalTimeout: 90_000, throwHttpErrors: false,
  retry: { limit: 2, methods: ['get', 'put', 'patch', 'delete'], retryOnTimeout: true,
    statusCodes: [408, 429, 500, 502, 503, 504] },
});
export const client = createClient('https://htzojicodwueivybovhy.supabase.co',
  'sb_publishable_tgU1Ue4yOSJxG2Z6CTunPw_gvKhXtpq', { global: { fetch: transport } });

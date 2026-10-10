import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
// Optional exact-response cache for repeatable tests when public CDNs reset
// connections. No dependency versions or source code are substituted.
export async function cacheCdn(page) {
  const directory=process.env.SITESCOUT_TEST_CDN_CACHE;
  if(!directory)return;
  await mkdir(directory,{recursive:true});
  await page.route(/^https:\/\/(?:cdn\.jsdelivr\.net|esm\.sh|cdnjs\.cloudflare\.com|unpkg\.com)\//,async route=>{
    if(route.request().method()!=='GET')return route.fallback();
    const url=route.request().url(),key=join(directory,createHash('sha256').update(url).digest('hex')+'.json');
    try {
      const cached=JSON.parse(await readFile(key,'utf8'));
      if(cached.url!==url)throw new Error('CDN cache identity mismatch');
      return route.fulfill({status:cached.status,headers:cached.headers,body:Buffer.from(cached.body,'base64')});
    } catch(error) {if(error.code!=='ENOENT')throw error;}
    let response;
    try { response=await route.fetch({maxRetries:2}); }
    catch(error) {
      // A test may finish while Monaco lazily requests an unused language or
      // font. Teardown cancellation is not an application/network response.
      if(page.isClosed() || /Test ended|Target.*closed|context.*closed/.test(error.message))return;
      console.error(`CDN fetch failed: ${url}: ${error.message}`);
      await route.abort('failed').catch(()=>{});return;
    }
    const body=await response.body();
    if(response.ok()) {
      const temporary=key+'.'+process.pid+'.tmp';
      await writeFile(temporary,JSON.stringify({url,status:response.status(),headers:response.headers(),body:body.toString('base64')}));
      await rename(temporary,key);
    }
    await route.fulfill({response,body});
  });
}

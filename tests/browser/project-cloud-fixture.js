// Stateful synthetic server shared by pages/contexts; never delegates an API request.
export function projectCloud() {
  const rows = new Map(), objects = new Map(), deletions = new Map();
  const state = {rows,objects,deletions,failSave:false,missingMigration:false,failUpload:false,saveGate:null,uploadGate:null,onSave:null,onUpload:null};
  state.attach = async page => page.route('**/htzojicodwueivybovhy.supabase.co/**',async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.pathname.endsWith('/save_epub_project')) {
      const args = request.postDataJSON(); state.onSave?.(args); if (state.saveGate) await state.saveGate;
      if (state.missingMigration) return route.fulfill({status:404,json:{code:'PGRST202',message:'function absent'}});
      if (state.failSave) return route.fulfill({status:503,json:{message:'database unavailable'}});
      const old = rows.get(args.p_project_id);
      if (deletions.has(args.p_project_id)) return route.fulfill({status:409,json:{code:'40001',message:'Project deleted'}});
      if ([...rows.values()].some(row=>row.project_id!==args.p_project_id && row.payload.title===args.p_payload.title)) return route.fulfill({status:409,json:{code:'40001',message:'title conflict'}});
      if ((old?.revision || 0) !== args.p_expected_revision) return route.fulfill({status:409,json:{code:'40001',message:'conflict'}});
      const revision = args.p_expected_revision+1, saved_at = new Date().toISOString();
      rows.set(args.p_project_id,{project_id:args.p_project_id,revision,updated_at:saved_at,payload:{...args.p_payload,serverRevision:revision,syncPending:false}});
      return route.fulfill({json:{revision,saved_at}});
    }
    if (url.pathname.endsWith('/delete_epub_project')) {
      const args=request.postDataJSON(),row=rows.get(args.p_project_id);
      if (row?.revision !== args.p_expected_revision) return route.fulfill({status:409,json:{code:'40001',message:'conflict'}});
      rows.delete(args.p_project_id);
      deletions.set(args.p_project_id,{project_id:args.p_project_id,revision:row.revision+1,deleted_at:new Date().toISOString()});
      return route.fulfill({json:null});
    }
    if (url.pathname.endsWith('/epub_project_deletions')) return route.fulfill({json:[...deletions.values()]});
    if (url.pathname.endsWith('/epub_drafts')) {
      let data=[...rows.values()];const id=url.searchParams.get('project_id');if(id)data=data.filter(row=>`eq.${row.project_id}`===id);
      return route.fulfill({json:request.headers().accept?.includes('object') ? data[0] || null : data});
    }
    if(url.pathname.includes('/storage/')) {
      const path=url.pathname.replace('/storage/v1/object/authenticated/','').replace('/storage/v1/object/','');
      if(request.method()==='POST') {
        state.onUpload?.(path);if(state.uploadGate)await state.uploadGate;
        if(state.failUpload)return route.fulfill({status:503,json:{message:'upload unavailable'}});
        if(objects.has(path))return route.fulfill({status:409,json:{statusCode:'409',message:'already exists'}});
        const content = request.headers()['content-type'];
        let bytes=request.postDataBuffer();
        if(content?.startsWith('multipart/')) {const form=await new Response(bytes,{headers:{'content-type':content}}).formData();const file=[...form.values()].find(value=>typeof value !== 'string');bytes=Buffer.from(await file.arrayBuffer());}
        objects.set(path,bytes);return route.fulfill({json:{Key:path}});
      }
      if(request.method()==='GET')return objects.has(path)?route.fulfill({body:objects.get(path),contentType:'image/png'}):route.fulfill({status:404,json:{message:'missing'}});
      throw new Error('Image deletion/overwrite is not allowed in fixture');
    }
    return route.fallback();
  });
  return state;
}

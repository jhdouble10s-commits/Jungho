import { build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';

const cdnPackage = {
  name:'installed-cdn-packages',
  setup(builder) {
    builder.onResolve({ filter:/^https:\/\/(?:cdn\.jsdelivr\.net\/npm\/|esm\.sh\/)/ }, (args) => {
      const url = new URL(args.path);
      const segments = url.pathname.replace(/^\/npm\//,'/').slice(1).split('/');
      const scoped = segments[0].startsWith('@');
      const packagePart = segments.slice(0,scoped ? 2 : 1).join('/');
      const at = packagePart.lastIndexOf('@');
      const name = packagePart.slice(0,at);
      const subpath = segments.slice(scoped ? 2 : 1).filter(part => part !== '+esm').join('/');
      return builder.resolve(name + (subpath ? `/${subpath}` : ''), { resolveDir:process.cwd(), kind:args.kind });
    });
  },
};

await rm('dist',{recursive:true,force:true});
await build({
  entryPoints:[
    { in:'app-access.js', out:'app-access' },
    { in:'app-startup.js', out:'app-startup' },
    { in:'auth-client.js', out:'auth-client' },
    { in:'auth-form.js', out:'auth-form' },
    { in:'admin/admin.js', out:'admin/admin' },
  ],
  outdir:'dist', entryNames:'[dir]/[name]', chunkNames:'chunks/[name]-[hash]',
  bundle:true, splitting:true, format:'esm', platform:'browser', target:'es2022',
  legalComments:'eof', plugins:[cdnPackage],
});

await mkdir('dist/monaco',{recursive:true});
await cp('node_modules/monaco-editor/min/vs','dist/monaco/vs',{recursive:true});
await cp('node_modules/emmet-monaco-es/dist/emmet-monaco.min.js','dist/emmet-monaco.min.js');

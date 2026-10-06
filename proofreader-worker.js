// GeulLint의 browser WASM은 입력을 외부 API로 전송하지 않고 Worker 안에서 실행된다.
// v0.4 beta 공개 배포물의 ESM/WASM 엔트리이며, 실패 시 UI는 적용 불가 상태로만 표시한다.
import init, { lint_standard_json } from 'https://binibinibin123.github.io/geullint/pkg/geullint_wasm.js';

const engine = init();
self.addEventListener('message', async ({ data }) => {
  try {
    await engine;
    const result = JSON.parse(lint_standard_json(JSON.stringify({
      text: data.text,
      sourceKind: 'plain_text',
      config: {},
      includeReviewFixes: true,
    })));
    result.diagnostics = (result.diagnostics || []).map((diagnostic) => ({
      ...diagnostic,
      suggestion: diagnostic.suggestion
        ?? (typeof diagnostic.suggestions?.[0] === 'string' ? diagnostic.suggestions[0] : diagnostic.suggestions?.[0]?.text),
    }));
    self.postMessage({ id:data.id, result });
  } catch (error) {
    self.postMessage({ id:data.id, error:error?.message || String(error) });
  }
});

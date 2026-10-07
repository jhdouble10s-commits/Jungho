import test from 'node:test';
import assert from 'node:assert/strict';
import { GEMINI_PROOFREAD_MODEL, requestGeminiCorrections, requestGeminiStructuredJson } from '../gemini-interactions.js';

test('Interactions API로 한 번 요청하고 structured JSON 결과를 읽는다', async () => {
  let request;
  const result = await requestGeminiStructuredJson({
    apiKey:'test-key', systemInstruction:'교정', input:'{"segments":[]}', schema:{ type:'object' },
    fetchImpl:async (url, options) => {
      request = { url, options };
      return { ok:true, json:async () => ({ steps:[{ type:'model_output', content:[{ type:'text', text:'{"suggestions":[]}' }] }] }) };
    },
  });
  assert.equal(request.url, 'https://generativelanguage.googleapis.com/v1/interactions');
  assert.equal(request.options.headers['x-goog-api-key'], 'test-key');
  const body = JSON.parse(request.options.body);
  assert.equal(body.model, GEMINI_PROOFREAD_MODEL);
  assert.equal(body.store, false);
  assert.deepEqual(body.response_format, { type:'text', mime_type:'application/json', schema:{ type:'object' } });
  assert.deepEqual(result, { suggestions:[] });
});

test('교정 요청은 text와 문단 ID만 보내고 structured paragraphs를 돌려준다', async () => {
  let body;
  const result = await requestGeminiCorrections({
    apiKey:'test-key', systemInstruction:'최소 교정', paragraphs:[{ id:'paragraph-1', text:'기도를통해' }],
    fetchImpl:async (_url, options) => {
      body = JSON.parse(options.body);
      return { ok:true, json:async () => ({ steps:[{ type:'model_output', content:[{ type:'text', text:'{"paragraphs":[{"id":"paragraph-1","correctedText":"기도를 통해"}]}' }] }] }) };
    },
  });
  assert.deepEqual(JSON.parse(body.input), { paragraphs:[{ id:'paragraph-1', text:'기도를통해' }] });
  assert.equal(body.response_format.schema.required[0], 'paragraphs');
  assert.deepEqual(result, [{ id:'paragraph-1', correctedText:'기도를 통해' }]);
});

export const GEMINI_PROOFREAD_MODEL = 'gemini-3.5-flash-lite';
const INTERACTIONS_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/interactions';

export const GEMINI_PROOFREAD_RESPONSE_SCHEMA = {
  type:'object',
  properties:{
    paragraphs:{
      type:'array',
      items:{
        type:'object',
        properties:{ id:{ type:'string' }, correctedText:{ type:'string' } },
        required:['id', 'correctedText'],
      },
    },
  },
  required:['paragraphs'],
};

const interactionText = (interaction) => (interaction?.steps || [])
  .filter((step) => step?.type === 'model_output')
  .flatMap((step) => step.content || [])
  .filter((content) => content?.type === 'text')
  .map((content) => content.text || '')
  .join('');

export const requestGeminiStructuredJson = async ({ apiKey, systemInstruction, input, schema, fetchImpl = fetch }) => {
  const response = await fetchImpl(INTERACTIONS_ENDPOINT, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'x-goog-api-key':apiKey },
    body:JSON.stringify({
      model:GEMINI_PROOFREAD_MODEL,
      system_instruction:systemInstruction,
      input,
      store:false,
      response_format:{ type:'text', mime_type:'application/json', schema },
      generation_config:{ max_output_tokens:4096 },
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message || `Gemini API 요청 실패 (${response.status})`);
  }
  const text = interactionText(await response.json());
  if (!text) throw new Error('Gemini가 교정 결과를 반환하지 않았습니다.');
  return JSON.parse(text);
};

// Gemini는 교정 판단만 담당한다. XHTML과 source offset은 브라우저로 보내지 않고,
// 문단 ID와 text만 전달해 앱이 안전한 diff 적용을 수행한다.
export const requestGeminiCorrections = async ({ apiKey, systemInstruction, paragraphs, fetchImpl }) => {
  const result = await requestGeminiStructuredJson({
    apiKey,
    systemInstruction:`${systemInstruction}\n\n반드시 입력의 각 문단 id를 유지한 JSON만 반환하세요. 수정할 내용이 없으면 correctedText에 원문을 그대로 넣으세요.`,
    input:JSON.stringify({ paragraphs:paragraphs.map(({ id, text }) => ({ id, text })) }),
    schema:GEMINI_PROOFREAD_RESPONSE_SCHEMA,
    ...(fetchImpl ? { fetchImpl } : {}),
  });
  if (!Array.isArray(result?.paragraphs)) throw new Error('Gemini 교정 응답 형식이 올바르지 않습니다. 다시 시도하세요.');
  return result.paragraphs;
};

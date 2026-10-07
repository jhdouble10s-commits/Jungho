export const GEMINI_PROOFREAD_MODEL = 'gemini-3.5-flash-lite';
const INTERACTIONS_ENDPOINT = 'https://generativelanguage.googleapis.com/v1/interactions';

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

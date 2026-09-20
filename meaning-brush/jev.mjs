import {splitSentences, pickRanges} from './segment.mjs';

export async function classifyWithJev(text, meaning, apiKey, fetcher = fetch) {
  const sentences = splitSentences(text);
  if (!sentences.length) return [];
  const questions = Object.fromEntries(sentences.map((sentence, index) => [`s${index}`, {
    type:'noul',
    instructions:`Does the text in \`sentences[${index}].text\` express this meaning or communicative intent: ${JSON.stringify(meaning)}? Judge implied and polite expressions by their intent, using \`fullText\` for context. Answer yes only when this sentence itself contains the meaning.`
  }]));
  const response = await fetcher('https://api.typesafe.ai/v1/systemone', {
    method:'POST',
    headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({model:'jev-latest',state:{fullText:text,sentences},questions})
  });
  if (!response.ok) throw new Error(`Jev API returned ${response.status}`);
  const body = await response.json();
  if (!body.answers || typeof body.answers !== 'object') throw new Error('Jev API response has no answers');
  return pickRanges(sentences, body.answers);
}

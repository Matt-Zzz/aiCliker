/**
 * Vision layer — sends a screenshot + element list to Gemini 2.0 Flash and
 * receives a structured next-action decision.
 */

import { GoogleGenAI, Type } from '@google/genai';

let client = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set');
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

/** Turn the element array into a compact, numbered text list the model can reference. */
function formatElementList(elements) {
  return elements
    .slice(0, 60)
    .map((el) => {
      const parts = [`[${el.id}] <${el.tag}`];
      if (el.type) parts.push(`type="${el.type}"`);
      if (el.role) parts.push(`role="${el.role}"`);
      if (el.name) parts.push(`name="${el.name}"`);
      if (el.placeholder) parts.push(`placeholder="${el.placeholder}"`);
      if (el.href) parts.push(`href="${el.href}"`);
      let line = parts.join(' ') + '>';
      if (el.text) line += ` "${el.text}"`;
      return line;
    })
    .join('\n');
}

/**
 * Analyse the current page state and return a structured action decision.
 *
 * @param {object}  opts
 * @param {string}  opts.screenshot    Base-64 PNG of the viewport.
 * @param {Array}   opts.elements      Interactive element descriptors.
 * @param {object}  opts.pageInfo      { url, title }
 * @param {string}  opts.goal          Natural-language goal from the user.
 * @param {Array}   opts.history       Previous { action, result } entries.
 * @param {object}  [opts.credentials] { username, password }
 * @returns {Promise<{thought:string, action:string, elementId?:number, value?:string, done:boolean}>}
 */
export async function analyzeScreen({
  screenshot,
  elements,
  pageInfo,
  goal,
  history,
  credentials,
}) {
  const genai = getClient();

  const elementList = formatElementList(elements);

  const historyText =
    history.length > 0
      ? history.map((h, i) => `Step ${i + 1}: ${h.action} — ${h.result}`).join('\n')
      : '(first step — no actions taken yet)';

  const credentialInfo = credentials
    ? `Username: ${credentials.username}\nPassword: (provided — use when login fields are visible)`
    : 'No credentials provided.';

  const prompt = `You are a web automation agent controlling a Chromium browser to achieve a user's goal.

## Goal
${goal}

## Current Page
URL: ${pageInfo.url}
Title: ${pageInfo.title}

## Credentials
${credentialInfo}

## Interactive Elements (id · tag · attributes · visible text)
${elementList || '(no interactive elements detected)'}

## Action History
${historyText}

## Available Actions
- click(elementId)   — Click an element by its [id]
- type(elementId, value) — Clear field and type text
- select(elementId, value) — Pick a dropdown option
- scroll(direction)  — "up" or "down"
- navigate(url)      — Go to a URL
- wait(seconds)      — Pause 1-5 s for loading
- extract()          — Capture main text content (questions / assignments)
- done(summary)      — Goal complete; provide a summary

## Rules
1. Study the screenshot AND element list together.
2. Reason step-by-step about what you see and which action brings you closer to the goal.
3. If you see a login form and have credentials, log in.
4. When you find academic content (questions, quizzes, assignments), use extract().
5. When the goal is fully achieved, use done().
6. Prefer clicking visible links / buttons over typing URLs.
7. You have a maximum of 30 steps — be efficient.

Analyze the screenshot below and choose ONE next action.`;

  const response = await genai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/png', data: screenshot } },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          thought: {
            type: Type.STRING,
            description: 'Your reasoning about what you see and what to do next.',
          },
          action: {
            type: Type.STRING,
            description:
              'One of: click, type, select, scroll, navigate, wait, extract, done.',
          },
          elementId: {
            type: Type.NUMBER,
            description:
              'The [id] of the element to interact with (for click / type / select).',
          },
          value: {
            type: Type.STRING,
            description:
              'Text to type, option to select, URL to navigate, scroll direction, wait seconds, or done summary.',
          },
          done: {
            type: Type.BOOLEAN,
            description: 'True when the overall goal has been achieved.',
          },
        },
        required: ['thought', 'action', 'done'],
      },
    },
  });

  const text = response.text.trim();
  try {
    return JSON.parse(text);
  } catch {
    console.error('Failed to parse vision response:', text);
    return {
      thought: 'Could not parse previous response — waiting and retrying.',
      action: 'wait',
      value: '2',
      done: false,
    };
  }
}

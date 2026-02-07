/**
 * Agent loop — the core ReAct (Reason → Act) orchestrator.
 *
 * Each iteration:
 *   1. Observe  — screenshot + interactive elements + page info
 *   2. Think    — send observation to Gemini Vision, get a decision
 *   3. Act      — execute the decision in the browser
 *   4. Repeat   — until the goal is done or we hit the step limit
 *
 * Progress is streamed back to the caller via the `emit` callback, which
 * the server routes pipe through Server-Sent Events to the frontend.
 */

import {
  getBrowser,
  createPage,
  takeScreenshot,
  getInteractiveElements,
  getPageInfo,
} from './browser.js';
import { analyzeScreen } from './vision.js';
import { executeAction } from './actions.js';
import { solveAcademicQuestion } from '../agent.js';

const MAX_STEPS = 30;

/** In-memory registry of running / completed tasks. */
const activeTasks = new Map();

export function getTask(taskId) {
  return activeTasks.get(taskId);
}

export async function stopTask(taskId) {
  const task = activeTasks.get(taskId);
  if (task) {
    task.aborted = true;
    task.status = 'stopped';
  }
}

/**
 * Launch a browser, navigate to `startUrl`, and run the agent loop.
 *
 * @param {object}   opts
 * @param {string}   opts.taskId       Unique task identifier.
 * @param {string}   opts.startUrl     The page to begin on.
 * @param {string}   opts.goal         Natural-language objective.
 * @param {object}   [opts.credentials]  { username, password }
 * @param {function} opts.emit         (event:object) => void — SSE emitter.
 */
export async function runAgent({ taskId, startUrl, goal, credentials, emit }) {
  const task = {
    id: taskId,
    status: 'running',
    startUrl,
    goal,
    steps: [],
    extractedContent: [],
    solvedQuestions: [],
    aborted: false,
    createdAt: new Date().toISOString(),
  };
  activeTasks.set(taskId, task);

  let page = null;

  try {
    // ── Launch ──────────────────────────────────────────
    emit({ type: 'status', status: 'launching', message: 'Launching browser…' });
    const browser = await getBrowser();
    page = await createPage(browser);

    // ── Navigate to start URL ───────────────────────────
    emit({ type: 'status', status: 'navigating', message: `Opening ${startUrl}` });
    await page.goto(startUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

    const history = [];

    for (let step = 1; step <= MAX_STEPS; step++) {
      if (task.aborted) {
        emit({ type: 'status', status: 'stopped', message: 'Stopped by user' });
        break;
      }

      // ── 1. Observe ──────────────────────────────────────
      const [screenshot, elements, pageInfo] = await Promise.all([
        takeScreenshot(page),
        getInteractiveElements(page),
        getPageInfo(page),
      ]);

      emit({
        type: 'observation',
        step,
        screenshot,
        url: pageInfo.url,
        title: pageInfo.title,
        elementCount: elements.length,
      });

      // ── 2. Think ────────────────────────────────────────
      const decision = await analyzeScreen({
        screenshot,
        elements,
        pageInfo,
        goal,
        history,
        credentials,
      });

      // Mask any credential values before sending to the frontend
      const safeValue =
        decision.action === 'type' ? '••••••' : (decision.value || '').slice(0, 80);

      emit({
        type: 'thought',
        step,
        thought: decision.thought,
        action: decision.action,
        elementId: decision.elementId,
        value: safeValue,
      });

      // ── 3. Act ──────────────────────────────────────────
      const result = await executeAction(page, decision, elements);

      const historyEntry = {
        thought: decision.thought,
        action: `${decision.action}(${decision.elementId ?? ''}${decision.value ? ', …' : ''})`,
        result: result.message,
      };
      history.push(historyEntry);
      task.steps.push({ step, ...historyEntry });

      emit({
        type: 'action',
        step,
        success: result.success,
        message: result.message,
      });

      // ── Handle extraction ───────────────────────────────
      if (decision.action === 'extract' && result.data) {
        task.extractedContent.push(result.data);
        emit({
          type: 'extraction',
          step,
          preview: result.data.slice(0, 600),
        });

        // Automatically solve extracted academic content
        emit({
          type: 'status',
          status: 'solving',
          message: 'Analysing extracted content with AI…',
        });

        try {
          const solution = await solveAcademicQuestion(result.data, 'Platform Agent');
          task.solvedQuestions.push(solution);
          emit({
            type: 'solution',
            step,
            answer: solution.answer,
            solution: solution.solution,
            tags: solution.tags,
          });
        } catch (err) {
          emit({ type: 'error', message: `Solver error: ${err.message}` });
        }
      }

      // ── Check if done ───────────────────────────────────
      if (decision.done || result.done) {
        task.status = 'completed';
        emit({
          type: 'done',
          message: decision.value || result.message,
          totalSteps: step,
          extractedCount: task.extractedContent.length,
          solvedCount: task.solvedQuestions.length,
        });
        break;
      }

      // Throttle between steps
      await new Promise((r) => setTimeout(r, 600));
    }

    // Ran out of steps
    if (task.status === 'running') {
      task.status = 'completed';
      emit({
        type: 'done',
        message: `Reached the ${MAX_STEPS}-step limit`,
        totalSteps: MAX_STEPS,
      });
    }
  } catch (err) {
    task.status = 'error';
    emit({ type: 'error', message: err.message });
  } finally {
    if (page) await page.close().catch(() => {});
    if (task.status === 'running') task.status = 'completed';
  }

  return task;
}

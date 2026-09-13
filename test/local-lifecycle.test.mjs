import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

function observeChild(child) {
  let stdout = '';
  let stderr = '';
  let exitResult = null;
  const exitPromise = new Promise(resolve => {
    child.once('exit', (code, signal) => {
      exitResult = { code, signal };
      resolve(exitResult);
    });
  });
  child.stdout?.on('data', chunk => { stdout += String(chunk); });
  child.stderr?.on('data', chunk => { stderr += String(chunk); });
  return {
    exitPromise,
    get exitResult() { return exitResult; },
    diagnostics() { return `stdout:\n${stdout || '<empty>'}\nstderr:\n${stderr || '<empty>'}`; }
  };
}

async function waitForHealth({ childState, port, timeoutMs = 10_000 }) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (childState.exitResult) {
      throw new Error(`El servidor local terminó antes de iniciar (${JSON.stringify(childState.exitResult)}).\n${childState.diagnostics()}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error(`El servidor local no inició dentro del tiempo esperado.\n${childState.diagnostics()}`);
}

test('apps/local main arranca y cierra limpiamente ante SIGTERM', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'personal-tax-ledger-lifecycle-'));
  const port = 3912;
  const child = spawn(process.execPath, ['apps/local/src/main.mjs'], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: String(port), DB_PATH: join(directory, 'lifecycle.sqlite') },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const childState = observeChild(child);
  try {
    await waitForHealth({ childState, port });
    child.kill('SIGTERM');
    const exit = childState.exitResult || await childState.exitPromise;
    assert.equal(exit.code, 0, childState.diagnostics());
    assert.equal(exit.signal, null, childState.diagnostics());
  } finally {
    if (!childState.exitResult) child.kill('SIGKILL');
    await Promise.race([
      childState.exitPromise,
      new Promise(resolve => setTimeout(resolve, 1_000))
    ]);
    await rm(directory, { recursive: true, force: true });
  }
});

import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.cwd();
const envPath = `${root}/.env`;
const ngrokApi = 'http://127.0.0.1:4040/api/tunnels';
const ngrokArgs = ['http', '--log=stdout', '8000'];

let ngrokProcess;
let serverProcess;

async function main() {
    ensureWindowsPowerShellNote();

    ngrokProcess = spawnCommand('ngrok', ngrokArgs, {
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    pipeWithPrefix(ngrokProcess.stdout, '[ngrok]');
    pipeWithPrefix(ngrokProcess.stderr, '[ngrok]');

    const tunnelUrl = await waitForNgrokUrl();

    await updateAppUrl(tunnelUrl);
    await runCommand('php', ['artisan', 'config:clear', '--ansi']);

    console.log(`Browser URL: ${tunnelUrl}`);

    await runNpmCommand(['run', 'build']);
    await runCommand('php', ['artisan', 'queue:restart']);

    serverProcess = spawnNpmCommand(['run', 'serve'], {
        stdio: 'inherit',
    });

    forwardTerminationSignals();

    const exitCode = await waitForExit(serverProcess, 'npm run serve');
    await shutdown(0);
    process.exit(exitCode);
}

function ensureWindowsPowerShellNote() {
    if (process.platform === 'win32') {
        console.log('Starting dev flow on Windows using npm.cmd and local processes.');
    }
}

async function waitForNgrokUrl() {
    const timeoutAt = Date.now() + 30_000;

    while (Date.now() < timeoutAt) {
        if (ngrokProcess.exitCode !== null) {
            throw new Error(`ngrok exited early with code ${ngrokProcess.exitCode}.`);
        }

        try {
            const response = await fetch(ngrokApi);

            if (response.ok) {
                const payload = await response.json();
                const tunnel = payload.tunnels?.find((item) => item.public_url?.startsWith('https://'));

                if (tunnel?.public_url) {
                    return tunnel.public_url;
                }
            }
        } catch {
            // ngrok API usually needs a few seconds to become available.
        }

        await delay(1000);
    }

    throw new Error('Timed out waiting for ngrok to expose an HTTPS tunnel on port 8000.');
}

async function updateAppUrl(url) {
    const current = await readFile(envPath, 'utf8');
    const next = upsertEnvValue(current, 'APP_URL', url);
    await writeFile(envPath, next, 'utf8');
}

function upsertEnvValue(envContents, key, value) {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, 'm');

    if (pattern.test(envContents)) {
        return envContents.replace(pattern, line);
    }

    const separator = envContents.endsWith('\n') ? '' : '\n';
    return `${envContents}${separator}${line}\n`;
}

async function runNpmCommand(args, options = {}) {
    const [command, commandArgs] = resolveNpmCommand(args);
    return runCommand(command, commandArgs, options);
}

async function runCommand(command, args, options = {}) {
    const child = spawnCommand(command, args, {
        stdio: 'inherit',
        ...options,
    });

    const exitCode = await waitForExit(child, `${command} ${args.join(' ')}`);

    if (exitCode !== 0) {
        throw new Error(`Command failed: ${command} ${args.join(' ')} (exit ${exitCode})`);
    }
}

function spawnNpmCommand(args, options = {}) {
    const [command, commandArgs] = resolveNpmCommand(args);
    return spawnCommand(command, commandArgs, options);
}

function resolveNpmCommand(args) {
    if (process.platform === 'win32') {
        return ['cmd.exe', ['/d', '/s', '/c', 'npm.cmd', ...args]];
    }

    return ['npm', args];
}

function spawnCommand(command, args, options = {}) {
    return spawn(command, args, {
        cwd: root,
        env: process.env,
        shell: false,
        ...options,
    });
}

function waitForExit(child, label) {
    return new Promise((resolve, reject) => {
        child.once('error', (error) => {
            reject(new Error(`Unable to start ${label}: ${error.message}`));
        });

        child.once('exit', (code) => {
            resolve(code ?? 0);
        });
    });
}

function pipeWithPrefix(stream, prefix) {
    if (!stream) {
        return;
    }

    stream.on('data', (chunk) => {
        process.stdout.write(
            chunk
                .toString()
                .split(/\r?\n/)
                .filter(Boolean)
                .map((line) => `${prefix} ${line}\n`)
                .join(''),
        );
    });
}

function forwardTerminationSignals() {
    const signals = ['SIGINT', 'SIGTERM'];

    for (const signal of signals) {
        process.on(signal, async () => {
            await shutdown(0);
            process.exit(0);
        });
    }
}

async function shutdown(exitCode) {
    if (serverProcess && serverProcess.exitCode === null) {
        serverProcess.kill('SIGTERM');
    }

    if (ngrokProcess && ngrokProcess.exitCode === null) {
        ngrokProcess.kill('SIGTERM');
    }

    await delay(250);
    return exitCode;
}

main().catch(async (error) => {
    console.error(error.message);
    await shutdown(1);
    process.exit(1);
});

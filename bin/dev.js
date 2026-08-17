import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { setTimeout as delay } from 'node:timers/promises';

const root = process.cwd();
const envPath = `${root}/.env`;
const ngrokApi = 'http://127.0.0.1:4040/api/tunnels';
const ngrokLogPath = `${root}\\storage\\logs\\ngrok-listener.log`;
const stripeLogPath = `${root}\\storage\\logs\\stripe-listener.log`;
const serveLogPath = `${root}\\storage\\logs\\serve-listener.log`;
const queueLogPath = `${root}\\storage\\logs\\queue-listener.log`;
const videoAnalysisQueueLogPath = `${root}\\storage\\logs\\video-analysis-queue-listener.log`;
const helperScriptDir = `${root}\\storage\\app\\dev-scripts`;

const appProcesses = [];
let ngrokProcess;

async function main() {
    if (process.platform === 'win32') {
        console.log('Starting dev flow on Windows with helper consoles.');
    }

    ngrokProcess = spawnCommand('ngrok', ['http', '--log=stdout', '8000'], {
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    pipeToFile(ngrokProcess.stdout, ngrokLogPath);
    pipeToFile(ngrokProcess.stderr, ngrokLogPath);

    const tunnelUrl = await waitForNgrokUrl();

    await updateAppUrl(tunnelUrl);
    await runCommand('php', ['artisan', 'config:clear', '--ansi']);

    console.log(`Browser URL: ${tunnelUrl}`);

    await runNpmCommand(['run', 'build']);
    await runCommand('php', ['artisan', 'queue:restart']);

    logActiveQueues();
    startAppProcesses();
    await launchHelperConsoles();
    forwardTerminationSignals();

    const exitCode = await waitForAnyExit(appProcesses, [
        'php artisan serve',
        'php artisan queue:work',
        'php artisan queue:work --queue=video-analysis',
        'npm run dev',
    ]);

    await shutdown();
    process.exit(exitCode);
}

function logActiveQueues() {
    console.log('Queue connection: redis');
    console.log('Active queue workers:');
    console.log('  - php artisan queue:work (default queue)');
    console.log('  - php artisan queue:work --queue=video-analysis');
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

function startAppProcesses() {
    const server = spawnCommand('php', ['-S', '127.0.0.1:8000', '-t', 'public'], {
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    pipeToFile(server.stdout, serveLogPath);
    pipeToFile(server.stderr, serveLogPath);
    appProcesses.push(server);

    const queueWorker = spawnCommand('php', ['artisan', 'queue:work'], {
        env: { ...process.env, QUEUE_CONNECTION: 'redis' },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    pipeToFile(queueWorker.stdout, queueLogPath);
    pipeToFile(queueWorker.stderr, queueLogPath);
    appProcesses.push(queueWorker);

    const videoAnalysisQueueWorker = spawnCommand('php', ['artisan', 'queue:work', '--queue=video-analysis'], {
        env: { ...process.env, QUEUE_CONNECTION: 'redis' },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    pipeToFile(videoAnalysisQueueWorker.stdout, videoAnalysisQueueLogPath);
    pipeToFile(videoAnalysisQueueWorker.stderr, videoAnalysisQueueLogPath);
    appProcesses.push(videoAnalysisQueueWorker);

    const vite = spawnNpmCommand(['run', 'dev'], {
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    pipeWithPrefix(vite.stdout, '[vite]');
    pipeWithPrefix(vite.stderr, '[vite]');
    appProcesses.push(vite);
}

async function launchHelperConsoles() {
    if (process.platform !== 'win32') {
        console.log('Helper consoles are only auto-launched on Windows.');
        return;
    }

    await mkdir(helperScriptDir, { recursive: true });

    const helpers = [
        {
            title: 'vvf stripe listen',
            command: [
                `$Host.UI.RawUI.WindowTitle = 'vvf stripe listen'`,
                `Write-Host 'Starting Stripe listener...'`,
                `stripe listen --forward-to 127.0.0.1:8000/stripe/webhook 2>&1 | Tee-Object -FilePath '${stripeLogPath}' -Append`,
            ].join('\r\n'),
        },
        {
            title: 'vvf ngrok logs',
            command: tailFileCommand(ngrokLogPath),
        },
        {
            title: 'vvf endpoint trigger logs',
            command: tailFileCommand(serveLogPath, 'vvf endpoint trigger logs'),
        },
        {
            title: 'vvf jobs trigger logs',
            command: filteredTailCommand('vvf jobs trigger logs', queueLogPath, [
                'processing',
                'processed',
                'failed',
                'running',
                'done',
                'error',
                'exception',
            ]),
        },
        {
            title: 'vvf video analysis logs',
            command: filteredTailCommand('vvf video analysis logs', videoAnalysisQueueLogPath, [
                'processing',
                'processed',
                'failed',
                'running',
                'done',
                'error',
                'exception',
                'video',
                'analysis',
            ]),
        },
    ];

    console.log('Helper listeners:');
    helpers.forEach((helper) => {
        console.log(`  - ${helper.title}`);
    });

    for (const helper of helpers) {
        const scriptPath = `${helperScriptDir}\\${slugify(helper.title)}.ps1`;
        await writeFile(scriptPath, helper.command, 'utf8');
        startPowerShellWindow(helper.title, scriptPath);
    }
}

function filteredTailCommand(title, path, patterns) {
    const joinedPatterns = patterns.map((pattern) => `'${pattern}'`).join(', ');

    return [
        `$Host.UI.RawUI.WindowTitle = '${title}'`,
        `$patterns = @(${joinedPatterns})`,
        `if (-not (Test-Path '${path}')) { New-Item -ItemType File -Path '${path}' -Force | Out-Null }`,
        `Write-Host 'Watching ${path}'`,
        `Get-Content -Path '${path}' -Wait | Where-Object { $line = $_.ToLowerInvariant(); ($patterns | Where-Object { $line.Contains($_) }).Count -gt 0 }`,
    ].join('\r\n');
}

function tailFileCommand(path, title = 'vvf ngrok logs') {
    return [
        `$Host.UI.RawUI.WindowTitle = '${title}'`,
        `if (-not (Test-Path '${path}')) { New-Item -ItemType File -Path '${path}' -Force | Out-Null }`,
        `Write-Host 'Watching ${path}'`,
        `Get-Content -Path '${path}' -Wait`,
    ].join('\r\n');
}

function startPowerShellWindow(title, scriptPath) {
    spawn('powershell.exe', [
        '-NoProfile',
        '-Command',
        `Start-Process powershell.exe -WorkingDirectory '${root}' -ArgumentList '-NoExit','-ExecutionPolicy','Bypass','-File','${scriptPath}'`,
    ], {
        cwd: root,
        env: process.env,
        stdio: 'ignore',
        windowsHide: true,
    }).unref();
}

function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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

function waitForAnyExit(children, labels) {
    return new Promise((resolve, reject) => {
        children.forEach((child, index) => {
            const label = labels[index] ?? `process ${index + 1}`;

            child.once('error', (error) => {
                reject(new Error(`Unable to start ${label}: ${error.message}`));
            });

            child.once('exit', (code) => {
                resolve(code ?? 0);
            });
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

function pipeToFile(stream, path) {
    if (!stream) {
        return;
    }

    stream.on('data', async (chunk) => {
        try {
            await appendFile(path, chunk.toString(), 'utf8');
        } catch {
            // Helper log mirroring is best-effort only.
        }
    });
}

function forwardTerminationSignals() {
    const signals = ['SIGINT', 'SIGTERM'];

    for (const signal of signals) {
        process.on(signal, async () => {
            await shutdown();
            process.exit(0);
        });
    }
}

async function shutdown() {
    for (const processHandle of appProcesses) {
        if (processHandle.exitCode === null) {
            processHandle.kill('SIGTERM');
        }
    }

    if (ngrokProcess && ngrokProcess.exitCode === null) {
        ngrokProcess.kill('SIGTERM');
    }

    await delay(250);
}

main().catch(async (error) => {
    console.error(error.message);
    await shutdown();
    process.exit(1);
});

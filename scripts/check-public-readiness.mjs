import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const includeHistory = process.argv.includes('--history');

function git(...args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  });
}

const forbiddenNames = [
  /(^|\/|\\)\.env(?:\.|$)/i,
  /(^|\/|\\)(?:handoff|decisions)[^/\\]*\.md$/i,
  /(^|\/|\\)(?:id_rsa|credentials|secrets?|tokens?)(?:\.|$)/i,
  /\.(?:pem|key|p12|pfx)$/i,
  /(^|\/|\\)codex-clipboard-[^/\\]+\.(?:png|jpe?g|webp)$/i,
];

const privateContentPatterns = [
  {
    label: '本机绝对路径',
    pattern:
      /(?:[A-Z]:[\\/](?:Users|CodexWorkspace|inklab|temp)(?:[\\/]|\b)|\/(?:Users|home)\/[^/\s]+\/)/i,
  },
  {
    label: '私钥内容',
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  },
  {
    label: '常见访问令牌',
    pattern:
      /(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9_-]{20,})/,
  },
];

function scanNames(entries, scope) {
  return entries.flatMap((entry) =>
    forbiddenNames.some((pattern) => pattern.test(entry))
      ? [`${scope}: ${entry}`]
      : [],
  );
}

function scanContent(file, content, scope) {
  if (content.includes('\0')) return [];
  return privateContentPatterns.flatMap(({ label, pattern }) =>
    pattern.test(content) ? [`${scope}: ${file}（${label}）`] : [],
  );
}

const trackedFiles = git('ls-files', '-z').split('\0').filter(Boolean);
const failures = scanNames(trackedFiles, '当前文件名');

for (const file of trackedFiles) {
  try {
    failures.push(...scanContent(file, readFileSync(file, 'utf8'), '当前内容'));
  } catch {
    // A missing worktree file will already be reported by Git elsewhere.
  }
}

if (includeHistory) {
  const revisions = git('rev-list', '--all')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const historicalEntries = git(
    'log',
    '--all',
    '--name-only',
    '--pretty=format:',
  )
    .split(/\r?\n/)
    .filter(Boolean);
  failures.push(...scanNames(historicalEntries, '历史文件名'));

  const historicalPatterns = [
    {
      label: '本机绝对路径',
      pattern:
        '([A-Z]:[\\\\/](Users|CodexWorkspace|inklab|temp)([\\\\/]|$)|/(Users|home)/[^/[:space:]]+/)',
    },
    {
      label: '私钥内容',
      pattern: '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----',
    },
    {
      label: '常见访问令牌',
      pattern:
        '(github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|sk-[A-Za-z0-9_-]{20,})',
    },
  ];

  for (const { label, pattern } of historicalPatterns) {
    const result = spawnSync(
      'git',
      ['grep', '-I', '-l', '-E', '-e', pattern, ...revisions, '--'],
      {
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
        windowsHide: true,
      },
    );
    if (result.status === 0) {
      for (const match of result.stdout.split(/\r?\n/).filter(Boolean)) {
        failures.push(`历史内容: ${match}（${label}）`);
      }
    } else if (result.status !== 1) {
      throw new Error(result.stderr || `git grep failed with ${result.status}`);
    }
  }
}

const uniqueFailures = [...new Set(failures)];
if (uniqueFailures.length > 0) {
  console.error('公开内容检查未通过：');
  for (const failure of uniqueFailures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    includeHistory
      ? '当前文件与全部可达 Git 历史未发现预设的隐私或凭据模式。'
      : '当前跟踪文件未发现预设的隐私或凭据模式。',
  );
}

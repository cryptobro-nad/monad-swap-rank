import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const allowedEnvExamplePattern = /(^|\/)\.env\.example$/i;

const blockedTrackedPathPatterns = [
  {
    pattern: /(^|\/)\.env($|\.)/i,
    reason: "Tracked environment file. Keep real env files local or in Vercel Environment Variables."
  },
  {
    pattern: /\.(pem|key|p12|pfx)$/i,
    reason: "Tracked private key or certificate-like file."
  },
  {
    pattern: /(^|\/)(id_rsa|id_ed25519)($|\.)/i,
    reason: "Tracked SSH private key file."
  },
  {
    pattern: /(seed[-_ ]?phrase|mnemonic|wallet[-_ ]?secret)/i,
    reason: "Tracked file name looks like it may contain wallet recovery material."
  }
];

const secretContentPatterns = [
  {
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
    reason: "Private key block detected."
  },
  {
    pattern: /0x[a-fA-F0-9]{64}/,
    reason: "Possible raw EVM private key detected."
  },
  {
    pattern: /\b(ghp|github_pat|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{20,}\b/,
    reason: "Possible GitHub token detected."
  },
  {
    pattern: /(?:api[_-]?key|secret|token|private[_-]?key|service[_-]?role[_-]?key)\s*[:=]\s*["'`](?!MOBULA_API_KEY|BLOCKVISION_API_KEY|ZERION_API_KEY|SUPABASE_SERVICE_ROLE_KEY|UPSTASH_REDIS_REST_TOKEN|YOUR_|example|placeholder)[A-Za-z0-9_./+=:-]{20,}["'`]/i,
    reason: "Possible hardcoded secret assignment detected."
  },
  {
    pattern: /(?:seed phrase|mnemonic)\s*[:=]\s*["'`][a-z]+(?:\s+[a-z]+){10,23}["'`]/i,
    reason: "Possible wallet seed phrase detected."
  }
];

type Finding = {
  file: string;
  reason: string;
};

function getTrackedFiles(): string[] {
  try {
    const output = execFileSync("git", ["ls-files", "-z"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    });

    return output.split("\0").filter(Boolean);
  } catch {
    console.error("Could not read tracked files with git ls-files.");
    process.exit(1);
  }
}

function isTextFile(file: string): boolean {
  const binaryExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".pdf",
    ".zip",
    ".woff",
    ".woff2",
    ".ttf"
  ];

  return !binaryExtensions.some((extension) => file.toLowerCase().endsWith(extension));
}

function findBlockedTrackedFiles(files: string[]): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (allowedEnvExamplePattern.test(file)) {
      continue;
    }

    for (const check of blockedTrackedPathPatterns) {
      if (check.pattern.test(file)) {
        findings.push({ file, reason: check.reason });
      }
    }
  }

  return findings;
}

function findPossibleSecrets(files: string[]): Finding[] {
  const findings: Finding[] = [];

  for (const file of files) {
    if (!isTextFile(file) || !existsSync(file)) {
      continue;
    }

    const content = readFileSync(file, "utf8");

    for (const check of secretContentPatterns) {
      if (check.pattern.test(content)) {
        findings.push({ file, reason: check.reason });
      }
    }
  }

  return findings;
}

function main() {
  const trackedFiles = getTrackedFiles();
  const findings = [
    ...findBlockedTrackedFiles(trackedFiles),
    ...findPossibleSecrets(trackedFiles)
  ];

  if (findings.length > 0) {
    console.error("Public safety check failed. Review these files before publishing:\n");

    for (const finding of findings) {
      console.error(`- ${finding.file}: ${finding.reason}`);
    }

    console.error(
      "\nDo not make the repository public until these findings are removed or confirmed safe."
    );
    process.exit(1);
  }

  console.log("Public safety check passed. No obvious tracked secrets were found.");
}

main();

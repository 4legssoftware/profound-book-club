#!/usr/bin/env node
/**
 * Check for newer versions of GitHub Actions in workflow files.
 *
 * This script checks all GitHub Actions in .github/workflows/*.yml files and
 * compares current versions (& SHAs) to latest available versions.
 *
 * Usage:
 *   pnpm tsx scripts/check-action-versions.ts
 *
 *   # With GitHub token (recommended to avoid rate limits):
 *   GITHUB_TOKEN=your_token pnpm tsx scripts/check-action-versions.ts
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

interface GitHubAction {
  name: string;
  currentRef: string;
  currentVersion: string | null;
  isSha: boolean;
  line: number;
  file: string;
  fullLine: string;
}

interface VersionCache {
  [key: string]: { version: string | null; sha: string | null };
}

const versionCache: VersionCache = {};

function parseWorkflowFile(workflowPath: string): GitHubAction[] {
  const githubActions: GitHubAction[] = [];
  const content = readFileSync(workflowPath, 'utf-8');
  const lines = content.split('\n');

  // Pattern: uses: owner/repo@sha #vX.Y.Z or uses: owner/repo@tag
  const actionPattern = /uses:\s+([\w-]+\/[\w-]+)@([a-f0-9]{40}|v[\d.]+|[\w-]+)/;
  const commentPattern = /#v?([\d.]+)/;

  lines.forEach((line, index) => {
    const match = line.match(actionPattern);
    if (match) {
      const ownerRepo = match[1];
      const ref = match[2];

      const commentMatch = line.match(commentPattern);
      const currentVersion = commentMatch ? commentMatch[1] : null;

      const isSha = ref.length === 40 && /^[0-9a-f]{40}$/i.test(ref);

      githubActions.push({
        name: ownerRepo,
        currentRef: ref,
        currentVersion,
        isSha,
        line: index + 1,
        file: workflowPath.split('/').pop() || '',
        fullLine: line.trim(),
      });
    }
  });

  return githubActions;
}

async function checkGitHubActionVersion(
  ownerRepo: string,
): Promise<{ version: string | null; sha: string | null }> {
  if (versionCache[ownerRepo]) {
    return versionCache[ownerRepo];
  }

  const githubToken = process.env.GITHUB_TOKEN;

  try {
    const url = `https://api.github.com/repos/${ownerRepo}/releases/latest`;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      if (response.status === 404) {
        // No releases found, try to get default branch SHA
        return await getDefaultBranchSha(ownerRepo, githubToken);
      }
      if (response.status === 403) {
        console.error(
          `  ⚠️  Error checking ${ownerRepo}: Rate limit exceeded. Set GITHUB_TOKEN env var to increase limit.`,
        );
      } else {
        console.error(`  ⚠️  Error checking ${ownerRepo}: HTTP ${response.status}`);
      }
      versionCache[ownerRepo] = { version: null, sha: null };
      return { version: null, sha: null };
    }

    const data = await response.json();
    const tagName = data.tag_name?.replace(/^v/, '') || '';

    // Get commit SHA for this tag
    const tagRef = data.tag_name;
    const tagUrl = `https://api.github.com/repos/${ownerRepo}/git/ref/tags/${tagRef}`;
    const tagResponse = await fetch(tagUrl, { headers });

    let commitSha = '';
    if (tagResponse.ok) {
      const tagData = await tagResponse.json();
      if (tagData.object?.type === 'tag') {
        // Annotated tag - get the commit SHA from the tag object
        const tagObjUrl = tagData.object.url;
        if (tagObjUrl) {
          const tagObjResponse = await fetch(tagObjUrl, { headers });
          if (tagObjResponse.ok) {
            const tagObjData = await tagObjResponse.json();
            commitSha = tagObjData.object?.sha || '';
          }
        }
      } else {
        // Lightweight tag
        commitSha = tagData.object?.sha || '';
      }
    } else {
      // Fallback: use target_commitish from release
      commitSha = data.target_commitish || '';
    }

    const result = { version: tagName, sha: commitSha };
    versionCache[ownerRepo] = result;
    return result;
  } catch (error) {
    console.error(`  ⚠️  Error checking ${ownerRepo}:`, error);
    versionCache[ownerRepo] = { version: null, sha: null };
    return { version: null, sha: null };
  }
}

async function getDefaultBranchSha(
  ownerRepo: string,
  githubToken?: string,
): Promise<{ version: string | null; sha: string | null }> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`;
    }

    const repoUrl = `https://api.github.com/repos/${ownerRepo}`;
    const repoResponse = await fetch(repoUrl, { headers });
    if (!repoResponse.ok) {
      return { version: null, sha: null };
    }

    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch || 'main';

    const branchUrl = `https://api.github.com/repos/${ownerRepo}/git/ref/heads/${defaultBranch}`;
    const branchResponse = await fetch(branchUrl, { headers });
    if (!branchResponse.ok) {
      return { version: null, sha: null };
    }

    const branchData = await branchResponse.json();
    const commitSha = branchData.object?.sha || '';

    return { version: `latest (${defaultBranch})`, sha: commitSha };
  } catch {
    return { version: null, sha: null };
  }
}

function versionCompare(current: string, latest: string): boolean {
  try {
    const currentClean = current.replace(/^v/, '');
    const latestClean = latest.replace(/^v/, '');

    const currentParts = currentClean.split('.').map(Number);
    const latestParts = latestClean.split('.').map(Number);

    const maxLen = Math.max(currentParts.length, latestParts.length);
    while (currentParts.length < maxLen) currentParts.push(0);
    while (latestParts.length < maxLen) latestParts.push(0);

    for (let i = 0; i < maxLen; i++) {
      if (latestParts[i] > currentParts[i]) return true;
      if (latestParts[i] < currentParts[i]) return false;
    }

    return false;
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const workflowsDir = join(projectRoot, '.github', 'workflows');

  console.log('🔍 Checking for GitHub Actions updates...\n');

  if (!process.env.GITHUB_TOKEN) {
    console.log('💡 Tip: Set GITHUB_TOKEN env var to avoid GitHub API rate limits\n');
  }

  const workflowFiles = readdirSync(workflowsDir)
    .filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'))
    .map((f) => join(workflowsDir, f));

  if (workflowFiles.length === 0) {
    console.error(`❌ No workflow files found in ${workflowsDir}`);
    process.exit(1);
  }

  const allActions: GitHubAction[] = [];
  for (const workflowFile of workflowFiles) {
    const actions = parseWorkflowFile(workflowFile);
    allActions.push(...actions);
  }

  if (allActions.length === 0) {
    console.error('❌ No GitHub Actions found in workflow files');
    process.exit(1);
  }

  // Deduplicate by name and file (keep first occurrence)
  const seenActions = new Map<string, GitHubAction>();
  for (const action of allActions) {
    const key = `${action.name}:${action.file}`;
    if (!seenActions.has(key)) {
      seenActions.set(key, action);
    }
  }

  let updatesAvailable = false;

  console.log('🎬 GitHub Actions:');
  for (const action of seenActions.values()) {
    const { version: latestVersion, sha: latestSha } = await checkGitHubActionVersion(action.name);

    if (latestVersion && latestSha) {
      let needsUpdate = false;
      const updateReasons: string[] = [];

      if (action.currentVersion) {
        if (versionCompare(action.currentVersion, latestVersion)) {
          needsUpdate = true;
          updateReasons.push('newer version available');
        }
      } else if (action.isSha) {
        if (action.currentRef !== latestSha) {
          needsUpdate = true;
          updateReasons.push('newer commit available');
        }
      } else if (action.currentRef.startsWith('v')) {
        const currentTag = action.currentRef.replace(/^v/, '');
        if (versionCompare(currentTag, latestVersion)) {
          needsUpdate = true;
          updateReasons.push('newer version available');
        }
      }

      if (needsUpdate) {
        console.log(`  ⬆️  ${action.name}`);
        console.log(`      File:    ${action.file}:${action.line}`);
        console.log(
          `      Current: ${action.currentRef}${
            action.currentVersion ? ` (v${action.currentVersion})` : ''
          }`,
        );
        console.log(`      Latest:  ${latestSha.substring(0, 12)}... (v${latestVersion})`);
        console.log(`      Reason:  ${updateReasons.join(', ')}`);
        console.log(`      Line:    ${action.fullLine}`);
        console.log();
        updatesAvailable = true;
      } else {
        const status = '✅';
        if (action.currentVersion) {
          console.log(
            `  ${status} ${action.name} @ v${action.currentVersion} (${action.currentRef.substring(0, 12)}...) - up to date`,
          );
        } else {
          console.log(
            `  ${status} ${action.name} @ ${action.currentRef.substring(0, 12)}... - up to date`,
          );
        }
      }
    } else {
      console.log(
        `  ⚠️  ${action.name} @ ${action.currentRef.substring(0, 12)}... - could not check`,
      );
    }
  }

  console.log();

  if (updatesAvailable) {
    console.log('💡 Updates are available! Review and update as needed.');
    console.log('\nTo update, replace the current ref with the latest SHA:');
    console.log('  uses: owner/repo@<latest_sha> #v<latest_version>');
    process.exit(0);
  } else {
    console.log('✨ All GitHub Actions are up to date!');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

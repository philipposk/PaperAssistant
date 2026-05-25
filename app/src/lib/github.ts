// Push a Dexie project to GitHub via a Personal Access Token (PAT).
// Uses Octokit's Git Data API: createBlob per file, then tree → commit
// → updateRef. Token lives in localStorage on this device only.

import { db, type FileRecord, type Note, type Project } from "./db";

const TOKEN_KEY = "paperassistant.githubToken";

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setToken(token: string) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "paperassistant-project";
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function noteToPath(n: Note): string {
  const safe = (n.title || "untitled").replace(/[\\/]/g, "-").slice(0, 80);
  return `notes/${safe}.md`;
}

function fileToPath(f: FileRecord): string {
  // Strip any colons/control chars; keep the original name otherwise.
  const safe = f.name.replace(/[\\:*?"<>|]/g, "_");
  return `files/${safe}`;
}

export interface PushResult {
  repoUrl: string;
  commitSha: string;
  fileCount: number;
}

export async function pushProjectToGitHub(
  project: Project,
  options: { repoName?: string; isPrivate?: boolean; commitMessage?: string } = {},
): Promise<PushResult> {
  const token = getToken();
  if (!token) throw new Error("GitHub token not set. Add one in Settings → GitHub.");

  // Lazy-load Octokit — keeps it out of the initial bundle.
  const { Octokit } = await import("@octokit/rest");
  const octo = new Octokit({ auth: token });

  const { data: me } = await octo.users.getAuthenticated();
  const owner = me.login;
  const repoName = (options.repoName?.trim() || slug(project.name)).toLowerCase();
  const isPrivate = options.isPrivate ?? true;

  // 1. Find or create repo.
  let defaultBranch: string;
  try {
    const { data } = await octo.repos.get({ owner, repo: repoName });
    defaultBranch = data.default_branch;
  } catch (e) {
    if ((e as { status?: number }).status !== 404) throw e;
    const { data } = await octo.repos.createForAuthenticatedUser({
      name: repoName,
      private: isPrivate,
      auto_init: true,
      description: `${project.name}${project.description ? " — " + project.description : ""} (synced from PaperAssistant)`,
    });
    defaultBranch = data.default_branch ?? "main";
  }

  // 2. Get current ref → commit → tree (base).
  const refRes = await octo.git.getRef({ owner, repo: repoName, ref: `heads/${defaultBranch}` });
  const baseCommitSha = refRes.data.object.sha;
  const baseCommit = await octo.git.getCommit({ owner, repo: repoName, commit_sha: baseCommitSha });
  const baseTreeSha = baseCommit.data.tree.sha;

  // 3. Gather project content.
  const files = await db.files.where("project_id").equals(project.id).toArray();
  const notes = await db.notes.where("project_id").equals(project.id).toArray();
  const readme = `# ${project.name}\n\n${project.description ?? ""}\n\nSynced from [PaperAssistant](https://github.com/philipposk/PaperAssistant) on ${new Date().toISOString()}.\n`;

  type TreeItem = {
    path: string;
    mode: "100644";
    type: "blob";
    sha: string;
  };
  const tree: TreeItem[] = [];

  // README
  {
    const blob = await octo.git.createBlob({
      owner,
      repo: repoName,
      content: btoa(unescape(encodeURIComponent(readme))),
      encoding: "base64",
    });
    tree.push({ path: "README.md", mode: "100644", type: "blob", sha: blob.data.sha });
  }

  // Notes
  for (const n of notes) {
    const blob = await octo.git.createBlob({
      owner,
      repo: repoName,
      content: btoa(unescape(encodeURIComponent(n.markdown))),
      encoding: "base64",
    });
    tree.push({ path: noteToPath(n), mode: "100644", type: "blob", sha: blob.data.sha });
  }

  // Files (binary)
  for (const f of files) {
    const b64 = await blobToBase64(f.blob);
    const blob = await octo.git.createBlob({
      owner,
      repo: repoName,
      content: b64,
      encoding: "base64",
    });
    tree.push({ path: fileToPath(f), mode: "100644", type: "blob", sha: blob.data.sha });
  }

  // 4. Build tree + commit + update ref.
  const treeRes = await octo.git.createTree({
    owner,
    repo: repoName,
    base_tree: baseTreeSha,
    tree,
  });

  const commit = await octo.git.createCommit({
    owner,
    repo: repoName,
    message:
      options.commitMessage ?? `PaperAssistant sync (${files.length} files, ${notes.length} notes)`,
    tree: treeRes.data.sha,
    parents: [baseCommitSha],
  });

  await octo.git.updateRef({
    owner,
    repo: repoName,
    ref: `heads/${defaultBranch}`,
    sha: commit.data.sha,
    force: false,
  });

  return {
    repoUrl: `https://github.com/${owner}/${repoName}`,
    commitSha: commit.data.sha,
    fileCount: tree.length,
  };
}

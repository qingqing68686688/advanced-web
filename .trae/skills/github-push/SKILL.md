---
name: "github-push"
description: "Commits the current project and pushes it to the GitHub remote over SSH (default: advanced-web repo). Invoke when the user asks to commit/push to GitHub, sync the repo, or upload changes to the remote repository."
---

# GitHub 提交与推送

把当前项目改动提交为一次 commit，并通过 SSH 推送到 GitHub 远程仓库。

## 默认参数

| 项 | 值 |
| --- | --- |
| 远程仓库 | `git@github.com:qingqing68686688/advanced-web.git` |
| 远程名 | `origin` |
| 密钥 | `~/.ssh/id_ed25519`（已配置，无密码短语） |
| 忽略文件 | 由 `.gitignore` 控制（`node_modules/`、`.env`、`*.log` 等） |

如用户指定了其他仓库地址，用 HTTPS 形式传入时需先转换成 SSH 形式再配置远程：
`https://github.com/<owner>/<repo>.git` → `git@github.com:<owner>/<repo>.git`。

## 执行步骤

1. **检查状态**（并行执行，便于判断改动范围与提交信息）：
   ```bash
   git status --short
   git branch --show-current
   git remote -v
   git log --oneline -5
   ```

2. **确认远程**：若 `origin` 不存在或不正确，则设置：
   ```bash
   git remote add origin git@github.com:qingqing68686688/advanced-web.git
   # 已存在但地址不对时：
   git remote set-url origin git@github.com:qingqing68686688/advanced-web.git
   ```

3. **安全检查**：确认 `.env`、`node_modules/`、日志文件未被纳入提交。
   若 `git status` 中出现 `.env` 或 `node_modules`，先补全 `.gitignore` 并取消暂存，不得提交敏感文件。

4. **暂存**：按文件名精确添加，避免 `git add -A` 误收临时文件：
   ```bash
   git add <具体文件或目录>
   ```
   项目常规范围：`frontend/`、`backend/`（排除 `.env`）、`README.md`、`Wanghl_prompt.md`、`.gitignore`、`.trae/`。

5. **提交**：提交信息使用中文，说明「做了什么 + 为什么」，1–2 句：
   ```bash
   git commit -m "<类型>: <简述>"
   ```
   类型可用：`新增`、`更新`、`修复`、`重构`、`文档`。

6. **推送**：
   ```bash
   git push -u origin <当前分支>
   ```
   分支不存在于远程时会自动创建；若远程已有默认分支（如 `main`）而本地为 `master`，先询问用户要推送到哪个分支，不要擅自重命名或强推。

7. **验证**：执行 `git status` 确认工作区干净，并输出本次提交哈希与远程地址。

## 禁止事项

- 不使用 `git push --force`、`git reset --hard`、`git clean -f` 等破坏性命令，除非用户明确要求。
- 不提交 `.env`、`node_modules/`、密钥文件或任何凭据。
- 不跳过 hooks（`--no-verify`）。
- 推送属于对外可见操作，若用户未明确要求推送，只做本地提交并提示。

## 常见问题

- **Permission denied (publickey)**：确认公钥已添加到 GitHub（Settings → SSH and GPG keys），可用 `ssh -T git@github.com` 验证。
- **密钥不存在**：运行 `ssh-keygen -t ed25519 -C "<备注>" -f ~/.ssh/id_ed25519` 生成，并把公钥添加到 GitHub。
- **连接超时**：检查网络与代理；HTTPS 远程无法使用 SSH 密钥，必须改成 SSH 地址。

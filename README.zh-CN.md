<div align="center">

# Runbook Lint

**审计事故 runbook 是否足够清晰，可供人工和值班 AI agent 执行。**

[English](README.md)

</div>

`runbook-lint` 是一个本地优先 CLI，面向 SRE 和事故响应团队。它检查 Markdown runbook 是否包含事故处理中真正需要的信息：触发条件、负责人元数据、影响系统、访问前置条件、精确命令、验证步骤、回滚路径、升级联系人、破坏性操作警告和 AI agent 护栏。

它不会执行生产命令，也不会连接真实基础设施。

## 为什么需要它

AI 辅助运维正在变得实用，但含糊的 runbook 仍然危险。在 AI agent 或疲惫的值班工程师跟着文档操作之前，文档必须足够明确，能安全执行并验证结果。

`runbook-lint` 把这个要求变成 CI 友好的检查。

## 安装

```bash
npm install -g runbook-lint
```

本地开发：

```bash
git clone https://github.com/maxi-maxima/runbook-lint.git
cd runbook-lint
npm install
npm run build
```

## 快速开始

```bash
runbook-lint scan docs/runbooks
runbook-lint scan docs/runbooks --format json --out reports/runbook-lint.json
runbook-lint demo --out reports/demo
runbook-lint explain trigger.condition docs/runbooks
```

## 不完整 runbook 示例

```markdown
# Checkout outage

Try fixing it. Restart things if needed.
```

这在事故压力下不可执行。它缺少负责人、触发条件、影响范围、访问前置条件、精确命令、验证步骤、回滚路径、升级路径、风险标签和 agent 护栏。

## 报告片段

```markdown
# runbook-lint report

## Summary

- Files: 1
- Errors: 6
- Warnings: 4

### trigger.condition: Missing trigger condition

- File: `checkout.md`
- Severity: error
- Remediation: Name the alert, symptom, or incident condition that starts this runbook.
```

## 内置规则

- `frontmatter.owner`
- `trigger.condition`
- `scope.system`
- `precheck.access`
- `step.command`
- `step.verify`
- `rollback.path`
- `escalation.contact`
- `risk.destructive`
- `agent.guardrail`

## 退出码

| 代码 | 含义 |
| --- | --- |
| `0` | 没有 error 级别发现。 |
| `1` | 存在一个或多个 error 级别发现。 |
| `2` | 用法错误、路径不可读或输出格式不支持。 |

## 开发

```bash
npm install
npm run check
node dist/cli.js demo --out reports/demo
npm pack --dry-run --ignore-scripts
```

## 许可证

MIT

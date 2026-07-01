# 更新日志

## 0.2.0 - 2026-07-01

- 新增 `scan --max-warnings <count>`，支持 CI warning 预算。
- 默认退出码行为保持不变；只有配置 warning 预算时才会按预算失败。
- 刷新 GitHub Actions pin，避免旧运行时弃用提示。

## 0.1.0 - 2026-06-12

- 首个公开版本。
- 加入 Markdown 发现和轻量 runbook 解析。
- 加入十条确定性的 runbook 可执行性规则。
- 加入 Markdown、JSON 和 SARIF 报告。
- 加入 `scan`、`demo` 和 `explain` 命令。

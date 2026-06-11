# 贡献指南

感谢你改进 `runbook-lint`。

## 开发

```bash
npm install
npm run check
```

## 规则准则

- 保持规则 ID 稳定。
- 优先使用确定性文本检查，不依赖网络请求或 AI 调用。
- 每次规则行为变化都要补测试。
- 用户可见行为变化时，同步更新英文和中文文档。

## Pull Request

提交前运行 `npm run check`。

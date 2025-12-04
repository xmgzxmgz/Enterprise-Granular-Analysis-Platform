# ACCEPTANCE: Refactor_Cleanup

## 1. 任务概述
本任务旨在重构项目根目录结构，规范化前端代码风格，并明确 Python 环境依赖。

## 2. 验收标准检查

| 序号 | 验收项 | 状态 | 说明 |
| :--- | :--- | :--- | :--- |
| 1 | **根目录整洁** | ✅ 通过 | 根目录仅保留配置文件和文档入口，非核心文件已移动。 |
| 2 | **目录结构清晰** | ✅ 通过 | `analysis/`, `mock_server/`, `docs/` 结构清晰。 |
| 3 | **代码规范化** | ✅ 通过 | ESLint/Prettier 配置完成，`npm run lint` 无错误。 |
| 4 | **类型检查** | ✅ 通过 | `npm run typecheck` 通过。 |
| 5 | **构建验证** | ✅ 通过 | `npm run build` 成功构建生产环境产物。 |
| 6 | **Python 依赖** | ✅ 通过 | `analysis/requirements.txt` 和 `README.md` 已创建。 |
| 7 | **代码注释** | ✅ 通过 | 核心文件 (`api.ts`, `notifyBus.ts`) 已添加 JSDoc 注释。 |

## 3. 变更详情

### 3.1 文件移动
- `src/temp_1.py` -> `analysis/temp_1.py`
- `gantt_min.html` -> `docs/planning/gantt_min.html`
- `gantt_user.png` -> `docs/planning/gantt_user.png`

### 3.2 配置文件
- 新增 `.eslintrc.js` (Flat Config)
- 新增 `.prettierrc.json`
- 更新 `package.json` (scripts: `lint`, `format`)
- 更新 `.gitignore` (忽略 `.history`, `analysis/temp_1.py`)

### 3.3 代码修复
- 修复 `EnterpriseDetail.vue` 中废弃的 `.native` 修饰符。
- 修复 `SearchResults.vue` 无效模板。
- 修复 `BasicInfo.vue`, `Tags/Aspect.vue`, `Tags/List.vue` 中的空 `catch` 块。

## 4. 遗留问题
- 部分代码仍大量使用 `any` 类型，ESLint 规则暂时设置为 `off` 以兼容现有代码。
- 未编写前端单元测试。

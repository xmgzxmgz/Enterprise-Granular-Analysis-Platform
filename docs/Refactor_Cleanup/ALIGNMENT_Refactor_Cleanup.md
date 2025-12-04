# ALIGNMENT: 项目重构与规范化

## 1. 项目现状分析
- **项目类型**: Vite + Vue 3 + TypeScript 前端项目。
- **目录结构**: 根目录混乱，包含大量非源代码文件（Python 数据分析脚本、Mock 服务、临时文档、构建产物）。
- **代码规范**: 缺乏统一的格式化配置，Vue 组件命名和结构待优化。
- **依赖管理**: Python 脚本缺乏依赖描述文件 (`requirements.txt`)。

## 2. 任务目标
- **清理根目录**: 将非核心文件归档到特定目录。
- **代码规范化**: 应用 ESLint/Prettier 规范，修复格式和风格问题。
- **添加注释**: 为核心函数添加详细的 JSDoc/Docstring 注释。
- **保持功能**: 确保所有重构不破坏现有功能（包括前端页面和辅助脚本的运行）。

## 3. 重构计划
### 3.1 目录结构调整
- `shap.py`, `temp_1.py`, `training_dataset1.xlsx` -> `analysis/`
- `server.js` -> `mock_server/`
- `gantt.*` -> `docs/planning/`
- `dist/` -> (确保被 git 忽略，不上传)

### 3.2 配置文件更新
- 更新 `package.json` 中的 `scripts` 以指向新的文件路径。
- 更新 `.gitignore` 添加 Python 缓存、系统文件等忽略项。

### 3.3 代码优化
- 检查 `src` 目录下的 Vue/TS 文件。
- 修复 ESLint 错误。
- 优化组件结构（如 `<script setup>`）。
- 添加详细注释。

## 4. 风险控制
- **路径引用**: 移动文件后，需确保 `package.json` 中的启动命令已更新。
- **Python 导入**: 确保 Python 脚本在移动后仍能找到必要的模块（如相对路径导入）。

## 5. 验收标准
- 根目录整洁。
- `npm run dev` 和 `npm run dev:node` 可正常运行。
- 代码风格统一，无明显的 Linter 错误。
- 核心逻辑有清晰的中文注释。

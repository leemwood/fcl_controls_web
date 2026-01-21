# 项目规则

- 当用户提出新的要求或者获得新的资源知识时，将内容保存至本项目目录下的.trae\rules\project_rules.md文件中。
- 必须更新project_rules.md文件。
- 不要使用emoji表情符号。
- 始终使用简体中文。
- 技术栈：Vue 3, TypeScript, Vite, shadcn-vue, Tailwind CSS, vue-i18n。
- API 结构：使用 index.json 获取控制器列表，category.json 获取分类，repo_json/{id}/version.json 获取详情。
- 下载处理：针对 JSON 文件被浏览器直接打开的问题，使用 fetch + Blob 方式强制触发文件下载，避免直接访问。
- 国际化：使用 vue-i18n 管理多语言，语言包位于 src/i18n/locales/。
- 样式规范：优先使用 Tailwind CSS 类，全局样式在 src/style.css 中。
- 组件库：使用 shadcn-vue 组件，位于 src/components/ui/。
- 代码风格：使用组合式 API (script setup) 和 TypeScript。
- 任务管理：始终使用 TodoWrite 工具跟踪任务。

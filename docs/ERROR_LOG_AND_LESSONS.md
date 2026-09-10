# Engineering Error Log & Lessons Learned

本文档记录在开发、重构、样式对齐与模板集成过程中出现过的所有错误案例。
**原则**：每次犯错即是教学，必须记录“现象、根因、修复方案、永久防错机制”，后续开发前必须自检本文档规则。

---

## 案例 1：页面模板 Props 与实际接口定义不一致
* **现象**：`typecheck` 报错 `Type '{ ... features: string[] ... } is not assignable to type 'CalculatorPageTemplateProps'`。
* **根因**：开发新计算器页面时，仅凭记忆或旧文档猜测属性名（将 `trustPoints` 误写为 `features`，将插槽组件作为直接 `children` 传入而非 `workspace={<.../>}`）。
* **预防机制**：
  1. 严禁凭直觉手写页面 Props，必须优先 `git grep -n -A 20 "interface CalculatorPageTemplateProps"` 读取最新声明。
  2. 严格遵循已有成熟页面（如 `compound-interest/page.tsx`、`savings-goal/page.tsx`）的结构。

---

## 案例 2：脚本正则替换导致语法截断或多余字符
* **现象**：修改 `lib/calculators/catalog.ts` 时，终端编译报 84 个语法错误，提示 `PARSE_ERROR: Expected ',' or ']' but found '}'`。
* **根因**：使用粗暴的单行正则查找替换，误把多余的花括号 `} } },` 替换进了静态数组尾部，破坏了 TypeScript 数组语法。
* **预防机制**：
  1. 涉及核心全局配置的修改，必须采用完整文件覆盖（HereDoc `cat << 'EOF'`），或在替换后立即执行 `npm run typecheck` 验证语法完整性。
  2. 严禁在未经本地 AST 校验的情况下提交大段单行匹配。

---

## 案例 3：全站新计算器“只写了页面，未在目录中上线”
* **现象**：页面路由 `/calculators/xxx` 可以访问，但 `/calculators` 目录页始终看不见该卡片。
* **根因**：`lib/calculators/catalog.ts` 具有严格的不变量断言（`assertCalculatorCatalogInvariants`），若只写了页面而没有将对应项从 `availability: "planned", route: null` 改为 `availability: "live", route: "/calculators/xxx"`，目录逻辑会将其完全屏蔽在 Live 列表外。
* **预防机制**：
  1. 新计算器上线标准流程：页面创建 -> 单元测试通过 -> **必须同步修改 `catalog.ts` 为 live** -> 检查 `/calculators` 渲染。

---

## 案例 4：样式按“语义类名”碎片编写，导致全局风格反复失真
* **现象**：新做的卡片（如 `related-links`、`tool-card`）呈现单色扁平样式；主按钮微光立体感在追加 CSS 时被全局规则覆盖；选择器分不清选中与未选中。
* **根因**：没有采用“设计系统图元（Design Primitives）”思想，每次新建元素都单独写一套 class，全局样式相互覆写、优先级混乱。
* **预防机制**：
  1. **卡片**：全站通用 `[class*="-card"]` 通配选择器，任何以 `-card` 结尾的组件天然具备微光双层渐变、多层环境阴影与悬停上浮。
  2. **按钮**：主按钮强制锁定胶囊圆角（`border-radius: 9999px`）、双层微光投影（`inset 0 1px 0`）与纯白悬停字色。
  3. **分段选择器**：未选中态保持 3D 浮雕微升，选中态必须呈现深度物理按压凹陷（`inset 0 3px 6px`）。

---

## 案例 5：双栏卡片顶部未严格对齐
* **现象**：左侧输入卡片与右侧结果卡片高低不平，右侧卡片下沉约 20px。
* **根因**：`.results-card` 错误设置了 `position: sticky; top: 1.25rem;` 与外部 margin，未在网格内强制重置顶部偏移。
* **预防机制**：
  1. `.calculator-layout` 必须锁定 `align-items: start !important;`。
  2. 子级卡片必须显式重置 `margin-top: 0 !important;`，确保顶部边框位于同一绝对水平基准线。

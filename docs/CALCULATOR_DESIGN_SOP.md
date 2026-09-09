# Financial Calculator Design System & Engineering SOP

本文档为全站新计算器（Financial Calculators）标准化交付规范。所有新建或重构的计算器必须严格遵循此规范，以确保视觉表现、交互动效、DOM 契约和测试用例在全站保持统一，避免重复调试。

---

## 1. 核心经验复盘与避坑准则

### 1.1 DOM 容器层级规范
* **标题区结构**：`.calculator-heading` 为 Grid/Flex 容器，左侧必须用一个 `<div>` 同时包裹 `<p className="eyebrow">` 与 `<h2>`，右侧为 `<p>` 说明段落。严禁将 `eyebrow`、`h2` 和 `p` 平铺在同一级，否则会导致标题横向拉平。
* **卡片对齐**：左侧 `.input-card` 与右侧 `.results-card` 必须处于同一个 `.calculator-layout` 容器内，以保证卡片顶部水平线绝对平齐。
* **内容区宽度**：正文内容、FAQ 模块和 References 统一使用标准 `.content-section`，严禁添加 `.content-section--narrow`，以防止内容左边缘缩进不齐。

### 1.2 表单输入控件规范
* **禁止原生 `type="number"`**：原生数字输入框会产生原生上下微调箭头并破坏边框视觉，一律使用 `type="text"` 配合 `inputMode="decimal"`（纯整数用 `inputMode="numeric"`）。
* **标准装饰器组合**：带有货币单位或百分比的输入框必须包裹在 `.control-wrap` 中，前缀使用 `.control-adornment--prefix`（输入框加 `className="has-prefix"`），后缀使用 `.control-adornment--suffix`（输入框加 `className="has-suffix"`）。
* **辅助文案**：每个输入框下方必须配备 `<p className="field__help">`，校验错误必须带有 `<p className="field__error">`。

### 1.3 按钮与交互规范
* **3D 浮雕与动效**：所有按钮（`.button--primary`, `.button--secondary`, `.button--ghost`）统一具备 3D 渐变高光、圆角阴影和悬停微浮动效（`translateY(-2px)`）。
* **文字对比度防污染**：`.button--primary` 必须显式声明悬停及焦点状态的文本颜色为纯白（`color: #ffffff !important;`），防止全局 `a:hover` 样式将文字覆盖为与背景同色的深绿。

### 1.4 测试编写规范
* 测试断言禁止硬编码展示文案（如 `Savings Target ($)`）。
* UI 组件测试一律使用 `name` 属性、`aria` 角色或 `data-testid` 查找 DOM（如 `container.querySelector('input[name="targetAmount"]')`），防止文案微调引发测试误红。

---

## 2. 标准代码模板 (Copy-Paste Ready)

### 2.1 表单输入控件标准骨架
```tsx
<div className="field">
  <label htmlFor="targetAmount">Savings Target ($)</label>
  <div className="control-wrap">
    <span className="control-adornment control-adornment--prefix" aria-hidden="true">{currency}</span>
    <input
      id="targetAmount"
      name="targetAmount"
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className="has-prefix"
      value={form.targetAmount}
      onChange={(e) => handleChange("targetAmount", e.target.value)}
      aria-describedby={errors.targetAmount ? "targetAmount-error" : "targetAmount-help"}
    />
  </div>
  <p className="field__help" id="targetAmount-help">The final accumulated amount you are targeting.</p>
  {errors.targetAmount && (
    <p id="targetAmount-error" className="field__error">{errors.targetAmount}</p>
  )}
</div>
```

### 2.2 Workspace 组件标准主结构
```tsx
<section className="calculator-workspace" aria-labelledby="calculator-heading">
  {/* 1. 顶部标题区 */}
  <div className="calculator-heading">
    <div>
      <p className="eyebrow">Your calculation</p>
      <h2 id="calculator-heading">Calculator Name Parameters</h2>
    </div>
    <p>Introductory description text explaining inputs and automated calculation.</p>
  </div>

  {/* 2. 主分栏布局 */}
  <div className="calculator-layout">
    {/* 左栏输入区 */}
    <div className="input-card">
      <form noValidate onSubmit={(e) => e.preventDefault()}>
        <fieldset className="form-step">
          <legend><span>1</span> Step Title</legend>
          {/* 表单字段 */}
        </fieldset>

        {/* 底部操作栏 */}
        <div className="form-actions">
          <button type="submit" className="button button--primary">Recalculate</button>
          <button type="button" className="button button--ghost" onClick={handleReset}>Reset</button>
        </div>
      </form>
    </div>

    {/* 右栏结果区 */}
    <div className="results-card" aria-live="polite">
      <div className="results-card__header">
        <div>
          <p className="eyebrow">YOUR ILLUSTRATION</p>
          <h2>Summary Results</h2>
        </div>
        <span className="currency-badge">{currency} · {locale}</span>
      </div>

      {presentation ? (
        <div>
          <dl className="result-metric result-metric--primary">
            <dt>Primary Metric Title</dt>
            <dd>{formatMoney(presentation.primaryValue)}</dd>
          </dl>

          <div className="results-grid" style={{ marginTop: "1.25rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
            <dl className="result-metric">
              <dt>Secondary Metric</dt>
              <dd>{formatMoney(presentation.secondaryValue)}</dd>
            </dl>
          </div>
        </div>
      ) : (
        <div style={{ padding: "1.5rem 0" }}>
          <p className="field__error">Please resolve the input issues to see results.</p>
        </div>
      )}

      <aside className="illustration-note" aria-label="Illustration disclaimer">
        <p>
          <strong>Illustration only.</strong> Not investment, tax, or financial advice. Returns, fees, inflation, and outcomes can differ.
        </p>
      </aside>
    </div>
  </div>

  {/* 3. 底部进度明细表 */}
  <section className="annual-card" style={{ marginTop: "2rem" }}>
    <div className="card-heading">
      <div>
        <p className="eyebrow">SCHEDULE</p>
        <h2>Annual Progression Schedule</h2>
      </div>
      <p style={{ textAlign: "right", margin: 0 }}>Amounts shown in {currency}.</p>
    </div>
    <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", margin: "0.5rem 0 1rem" }}>
      ← Scroll the table horizontally to see every column.
    </p>
    <div className="annual-table-scroll" style={{ overflowX: "auto" }}>
      <table className="annual-table">
        {/* 表格内容 */}
      </table>
    </div>
  </section>
</section>
```

---

## 3. 四阶段交付流程 (Execution Pipeline)

```
[Phase 1] 纯数学引擎与核心测试 (lib/calculators/<name>/engine.ts)
                          ↓
[Phase 2] Schema 校验与适配层 (lib/calculators/<name>/schema.ts & presentation.ts)
                          ↓
[Phase 3] Workspace 交互组件 (components/<name>-workspace.tsx)
                          ↓
[Phase 4] 页面装配与全站路由 (app/calculators/<name>/page.tsx)
```

---

## 4. 上线前核验清单 (Checklist)

* [ ] `npm test`：全部 Vitest 测试套件 100% 绿灯通过。
* [ ] `npm run typecheck`：双重 TypeScript 零类型错误。
* [ ] `npm run build:app`：静态预渲染（SSG）全部页面无警告通过。
* [ ] **UI 核对**：
  * [ ] 左侧表单卡片与右侧结果卡片顶部水平对齐。
  * [ ] 控件无原生上下箭头，带统一货币/单位装饰徽标与聚焦高光。
  * [ ] 按钮鼠标悬停时文字保持纯白色，呈现 3D 微浮立体质感。
  * [ ] 页面底部的 FAQ 折叠卡片与计算器左侧边缘平齐。

"use client";

import React, { useMemo } from "react";
import { StepperButtons } from "../stepper-buttons.js";

export interface NumericFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (() => void) | undefined;
  prefix?: string | undefined;
  suffix?: string | undefined;
  step?: number | undefined;
  min?: number | undefined;
  decimals?: number | undefined;
  helpText?: string | undefined;
  errorText?: string | undefined;
  optional?: boolean | undefined;
}

export function NumericField({
  id,
  name,
  label,
  value,
  onChange,
  onBlur,
  prefix,
  suffix,
  step = 100,
  min = 0,
  decimals = 0,
  helpText,
  errorText,
  optional,
}: NumericFieldProps) {
  const handleStep = (delta: number) => {
    const current = parseFloat(value) || 0;
    const nextVal = Math.max(min, current + delta);
    const formatted = decimals > 0 ? nextVal.toFixed(decimals) : String(Math.round(nextVal));
    onChange(formatted);
  };

  const hasPrefix = Boolean(prefix);
  const hasSuffix = Boolean(suffix);

  // 动态内联计算左内边距，根据前缀字符数精确留白，彻底免疫单字符($)与多字符(USD)冲突
  const calculatedPaddingLeft = useMemo(() => {
    if (!hasPrefix || !prefix) return undefined;
    return prefix.length > 1 ? `${prefix.length * 0.75 + 1.25}rem` : "2.4rem";
  }, [hasPrefix, prefix]);

  return (
    <div className="field">
      <div className="field__header">
        <label htmlFor={id} className="field__label">{label}</label>
        {optional && <span className="field__optional">Optional</span>}
      </div>
      <div className="control-wrap">
        {hasPrefix && (
          <span className="control-adornment control-adornment--prefix" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              handleStep(step);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              handleStep(-step);
            }
          }}
          style={{
            ...(calculatedPaddingLeft ? { paddingLeft: calculatedPaddingLeft } : {}),
            ...(hasSuffix ? { paddingRight: "2.5rem" } : {}),
          }}
          className={`control-input ${hasPrefix ? "has-prefix" : ""} ${hasSuffix ? "has-suffix" : ""} ${!hasSuffix ? "has-stepper" : ""}`.trim()}
          aria-describedby={
            [
              helpText ? `${id}-help` : null,
              errorText ? `${id}-error` : null,
            ].filter(Boolean).join(" ") || undefined
          }
          aria-invalid={Boolean(errorText) || undefined}
        />
        {hasSuffix && (
          <span className="control-adornment control-adornment--suffix" aria-hidden="true">
            {suffix}
          </span>
        )}
        {!hasSuffix && (
          <StepperButtons
            onStepUp={() => handleStep(step)}
            onStepDown={() => handleStep(-step)}
          />
        )}
      </div>
      {helpText && <p className="field__help" id={`${id}-help`}>{helpText}</p>}
      {errorText && <p className="field__error" id={`${id}-error`}>{errorText}</p>}
    </div>
  );
}

"use client";

interface StepperButtonsProps {
  onStepUp: () => void;
  onStepDown: () => void;
  className?: string;
}

export function StepperButtons({ onStepUp, onStepDown, className = "" }: StepperButtonsProps) {
  return (
    <div className={`stepper-wrap ${className}`.trim()} aria-hidden="true">
      <button
        type="button"
        tabIndex={-1}
        className="stepper-btn"
        aria-label="Increase value"
        onClick={(e) => {
          e.preventDefault();
          onStepUp();
        }}
      >
        ▲
      </button>
      <button
        type="button"
        tabIndex={-1}
        className="stepper-btn"
        aria-label="Decrease value"
        onClick={(e) => {
          e.preventDefault();
          onStepDown();
        }}
      >
        ▼
      </button>
    </div>
  );
}

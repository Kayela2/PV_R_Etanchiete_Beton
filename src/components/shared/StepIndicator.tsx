interface StepIndicatorProps {
  currentStep: number;
  totalSteps:  number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => (
  <div className="step-indicator">
    {Array.from({ length: totalSteps }).map((_, i) => (
      <div
        key={i}
        className={[
          "step-indicator__bar",
          i < currentStep ? "step-indicator__bar--filled" : "step-indicator__bar--unfilled",
        ].join(" ")}
      />
    ))}
  </div>
);
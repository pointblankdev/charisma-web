import { Card } from '@components/ui/card';
import { StepIndicator } from '@components/dexterity/step-indicator';

type ContractStepperProps = {
  currentStepIndex: number;
};

export function ContractStepper({ currentStepIndex }: ContractStepperProps) {
  return (
    <div className="p-2">
      <div className="px-8 pb-8">
        <StepIndicator
          steps={['Select Token A', 'Select Token B', 'Configure Pool']}
          currentStep={currentStepIndex}
        />
      </div>
    </div>
  );
}

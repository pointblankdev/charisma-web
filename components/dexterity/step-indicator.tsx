import { Check } from 'lucide-react';
import { Progress } from '@components/ui/progress';
import { cn } from '@lib/utils';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const progress = (currentStep / (steps.length - 1)) * 100;

  return (
    <div className="mb-8 space-y-4">
      {/* Progress Bar */}
      <Progress value={progress} className="h-2" />

      {/* Steps */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isComplete = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={step}
              className={cn(
                'absolute top-0',
                index === 0 && 'left-0',
                index === steps.length - 1 && 'right-0',
                index !== 0 && index !== steps.length - 1 && 'left-1/2 -translate-x-1/2'
              )}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                  isComplete && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary/20 text-primary ring-2 ring-primary',
                  !isComplete && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="absolute -translate-x-1/2 -bottom-8 left-1/2 whitespace-nowrap">
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-primary',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

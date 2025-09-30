import React from 'react';
import { Step, ProgressStepsProps } from '@/types/booking';

const ProgressSteps: React.FC<ProgressStepsProps> = ({
  steps,
  currentStep,
  onStepClick,
  canNavigateToStep
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">

        {/* Mobile Layout - Horizontal without text */}
        <div className="md:hidden flex justify-center">
          <div className="flex items-center space-x-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => onStepClick(step.number)}
                  disabled={step.number > currentStep && !canNavigateToStep(step.number) || (currentStep === 5 && step.number <= currentStep)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shadow-lg transition-all duration-300 ${
                    (step.number > currentStep && !canNavigateToStep(step.number)) || (currentStep === 5 && step.number <= currentStep)
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:scale-105'
                  } ${
                    currentStep === 5 && step.number <= 4
                      ? 'bg-secondary text-white shadow-secondary/20'
                      : step.active
                        ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
                        : step.number < currentStep
                          ? 'bg-secondary text-white shadow-secondary/20 hover:bg-secondary/90'
                          : canNavigateToStep(step.number)
                            ? 'bg-white text-gray-600 border-2 border-gray-300 hover:border-orange-300 hover:text-orange-600'
                            : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {currentStep === 5 && step.number <= 4 ? '✓' : step.number}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-4 h-1 mx-1 rounded-full transition-all duration-300 ${
                    currentStep === 5 || step.number < currentStep ? 'bg-secondary' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Layout - Horizontal */}
        <div className="hidden md:flex items-center justify-center space-x-4 lg:space-x-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick(step.number)}
                  disabled={step.number > currentStep && !canNavigateToStep(step.number) || (currentStep === 5 && step.number <= currentStep)}
                  className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-sm font-semibold shadow-lg transition-all duration-300 ${
                    (step.number > currentStep && !canNavigateToStep(step.number)) || (currentStep === 5 && step.number <= currentStep)
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:scale-105'
                  } ${
                    currentStep === 5 && step.number <= 4
                      ? 'bg-secondary text-white shadow-secondary/20'
                      : step.active
                        ? 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'
                        : step.number < currentStep
                          ? 'bg-secondary text-white shadow-secondary/20 hover:bg-secondary/90'
                          : canNavigateToStep(step.number)
                            ? 'bg-white text-gray-600 border-2 border-gray-300 hover:border-orange-300 hover:text-orange-600'
                            : 'bg-white text-gray-400 border-2 border-gray-200'
                  }`}
                >
                  {currentStep === 5 && step.number <= 4 ? '✓' : step.number}
                </button>
                <span className={`text-center text-xs mt-2 font-medium max-w-20 leading-tight ${
                  currentStep === 5 && step.number <= 4
                    ? 'text-secondary'
                    : step.active
                      ? 'text-primary'
                      : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 lg:w-12 xl:w-16 h-1 mx-2 lg:mx-4 rounded-full transition-all duration-300 ${
                  currentStep === 5 || step.number < currentStep ? 'bg-secondary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressSteps;
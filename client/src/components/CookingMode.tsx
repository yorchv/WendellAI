
import { X, ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface CookingModeProps {
  instructions: string[];
  onClose: () => void;
}

export function CookingMode({ instructions, onClose }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goToNextStep = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <span className="text-muted-foreground">
          Step {currentStep + 1} of {instructions.length}
        </span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <div className="flex-1 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
          className="flex-shrink-0 ml-2"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <div className="flex flex-col items-center gap-6 px-4 max-w-[85%]">
          <div className="bg-primary/10 rounded-full px-4 py-1 text-primary font-medium">
            Step {currentStep + 1} of {instructions.length}
          </div>
          <p className="text-2xl font-serif">
            {instructions[currentStep]}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextStep}
          disabled={currentStep === instructions.length - 1}
          className="flex-shrink-0"
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

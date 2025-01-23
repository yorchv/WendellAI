
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
      
      <div className="flex-1 flex items-center justify-center p-8">
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4"
          onClick={goToPreviousStep}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <p className="text-3xl text-center max-w-3xl font-serif">
          {instructions[currentStep]}
        </p>
        
        <Button
          variant="ghost"
          size="icon"
          className="fixed right-4"
          onClick={goToNextStep}
          disabled={currentStep === instructions.length - 1}
        >
          <ArrowRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}

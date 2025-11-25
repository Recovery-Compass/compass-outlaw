import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WizardSteps } from "@/components/wizard/WizardSteps";
import { CaseDetailsStep } from "@/components/wizard/CaseDetailsStep";
import { StrategyEvidenceStep } from "@/components/wizard/StrategyEvidenceStep";
import { ReviewStep } from "@/components/wizard/ReviewStep";
import { Scale, ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CaseData {
  caseName: string;
  hearingDate: string;
  opposingCounsel: string;
  keyObjectives: string;
  strategy: "aggressive" | "collaborative";
  evidenceFiles: Array<{ id: string; name: string; linkedParagraph?: string }>;
}

const Index = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [caseData, setCaseData] = useState<CaseData>({
    caseName: "",
    hearingDate: "",
    opposingCounsel: "",
    keyObjectives: "",
    strategy: "collaborative",
    evidenceFiles: [],
  });

  const steps = ["Case Details", "Strategy & Evidence", "Review & Export"];

  const handleFieldChange = (field: string, value: any) => {
    setCaseData((prev) => ({ ...prev, [field]: value }));
  };

  const canProceedFromStep = (step: number): boolean => {
    if (step === 0) {
      return !!(caseData.caseName && caseData.hearingDate && caseData.keyObjectives);
    }
    return true;
  };

  const handleNext = () => {
    if (canProceedFromStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    } else {
      toast({
        title: "Required fields missing",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleExport = () => {
    const exportData = {
      ...caseData,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${caseData.caseName.replace(/\s+/g, "_")}_filing.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Case data exported",
      description: "Your filing data has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Pro Per Filing Wizard</h1>
              <p className="text-sm text-muted-foreground">California Probate</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Prepare Your Filing</CardTitle>
            <CardDescription>
              Complete each step to organize your case and generate a structured filing document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WizardSteps currentStep={currentStep} steps={steps} />

            <div className="mt-8 min-h-[400px]">
              {currentStep === 0 && (
                <CaseDetailsStep data={caseData} onChange={handleFieldChange} />
              )}
              {currentStep === 1 && (
                <StrategyEvidenceStep data={caseData} onChange={handleFieldChange} />
              )}
              {currentStep === 2 && <ReviewStep data={caseData} onExport={handleExport} />}
            </div>

            {currentStep < 2 && (
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;

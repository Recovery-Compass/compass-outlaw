import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react"; // Import icons

interface EvidenceFile {
  id: string;
  name: string;
  linkedParagraph?: string;
}

interface ReviewStepProps {
  data: {
    caseName: string;
    hearingDate: string;
    opposingCounsel: string;
    keyObjectives: string;
    strategy: "aggressive" | "collaborative";
    evidenceFiles: EvidenceFile[];
  };
  onExport: () => void;
}

export const ReviewStep = ({ data, onExport }: ReviewStepProps) => {
  const sanityChecks = [
    {
      label: "Case details completed",
      passed: !!(data.caseName && data.hearingDate && data.keyObjectives),
    },
    {
      label: "Strategy selected",
      passed: !!data.strategy,
    },
    {
      label: "Evidence documented",
      passed: data.evidenceFiles.length > 0,
    },
    {
      label: "Ready for filing",
      passed:
        !!(data.caseName && data.hearingDate && data.keyObjectives) && data.evidenceFiles.length > 0,
    },
  ];

  const allChecksPassed = sanityChecks.every((check) => check.passed);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-gradient-to-br from-background/60 to-background/30 border-primary/20 text-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Sanity Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sanityChecks.map((check, index) => (
              <div key={index} className="flex items-center space-x-3">
                {check.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="text-sm font-medium text-foreground/80">{check.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background/60 to-background/30 border-primary/20 text-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Case Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-foreground/90">Case Name</Label>
            <p className="text-sm text-foreground/70">{data.caseName || "Not provided"}</p>
          </div>

          <div>
            <Label className="text-foreground/90">Hearing Date</Label>
            <p className="text-sm text-foreground/70">{data.hearingDate || "Not set"}</p>
          </div>

          <div>
            <Label className="text-foreground/90">Opposing Counsel</Label>
            <p className="text-sm text-foreground/70">{data.opposingCounsel || "None specified"}</p>
          </div>

          <div>
            <Label className="text-foreground/90">Key Objectives</Label>
            <p className="text-sm text-foreground/70 break-words whitespace-pre-wrap">{data.keyObjectives || "Not provided"}</p>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div>
              <Label className="text-foreground/90">Filing Strategy</Label>
              <p className={`text-sm font-semibold ${data.strategy === "aggressive" ? "text-red-400" : "text-blue-400"}`}>
                {data.strategy === "aggressive" ? "Aggressive" : "Collaborative"}
              </p>
            </div>
            <div>
              <Label className="text-foreground/90">Evidence Files</Label>
              <p className="text-sm text-foreground/70">{data.evidenceFiles.length} uploaded</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onExport}
        disabled={!allChecksPassed}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {allChecksPassed ? "Export Filing Data (JSON)" : "Complete all checks to export"}
      </Button>
    </div>
  );
};
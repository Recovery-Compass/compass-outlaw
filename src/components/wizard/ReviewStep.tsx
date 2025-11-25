import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, FileText, Calendar, Scale, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewStepProps {
  data: {
    caseName: string;
    hearingDate: string;
    opposingCounsel: string;
    keyObjectives: string;
    strategy: "aggressive" | "collaborative";
    evidenceFiles: Array<{ id: string; name: string; linkedParagraph?: string }>;
  };
  onExport: () => void;
}

export const ReviewStep = ({ data, onExport }: ReviewStepProps) => {
  const sanityChecks = [
    {
      label: "Case details completed",
      passed: data.caseName && data.hearingDate && data.keyObjectives,
    },
    {
      label: "Strategy selected",
      passed: data.strategy,
    },
    {
      label: "Evidence documented",
      passed: data.evidenceFiles.length > 0,
    },
    {
      label: "Ready for filing",
      passed:
        data.caseName && data.hearingDate && data.keyObjectives && data.evidenceFiles.length > 0,
    },
  ];

  const allChecksPassed = sanityChecks.every((check) => check.passed);

  return (
    <div className="space-y-6">
      <Card className="border-warning/50 bg-warning/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="w-5 h-5 text-warning" />
            Sanity Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sanityChecks.map((check, index) => (
            <div key={index} className="flex items-center gap-2">
              {check.passed ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className={check.passed ? "text-foreground" : "text-muted-foreground"}>
                {check.label}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Case Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm text-muted-foreground">Case Name</p>
              <p className="mt-1">{data.caseName || "Not provided"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm text-muted-foreground">Hearing Date</p>
              <p className="mt-1">{data.hearingDate || "Not set"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Scale className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm text-muted-foreground">Opposing Counsel</p>
              <p className="mt-1">{data.opposingCounsel || "None specified"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Target className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-sm text-muted-foreground">Key Objectives</p>
              <p className="mt-1 whitespace-pre-wrap">{data.keyObjectives || "Not provided"}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-sm text-muted-foreground">Filing Strategy</p>
              <Badge variant={data.strategy === "aggressive" ? "default" : "secondary"}>
                {data.strategy === "aggressive" ? "Aggressive" : "Collaborative"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Evidence Files: {data.evidenceFiles.length} uploaded
            </p>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onExport}
        disabled={!allChecksPassed}
        className="w-full"
        size="lg"
      >
        Export Case Data (JSON)
      </Button>
    </div>
  );
};

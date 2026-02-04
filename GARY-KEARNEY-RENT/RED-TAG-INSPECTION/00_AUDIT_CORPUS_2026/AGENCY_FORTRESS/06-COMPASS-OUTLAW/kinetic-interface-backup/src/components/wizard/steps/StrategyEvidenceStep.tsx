import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, XCircle } from "lucide-react";

interface EvidenceFile {
  id: string;
  name: string;
  linkedParagraph?: string;
}

interface StrategyEvidenceStepProps {
  data: {
    strategy: "aggressive" | "collaborative";
    evidenceFiles: EvidenceFile[];
  };
  onChange: (field: string, value: any) => void;
}

export const StrategyEvidenceStep = ({ data, onChange }: StrategyEvidenceStepProps) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles: EvidenceFile[] = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
      }));
      onChange("evidenceFiles", [...data.evidenceFiles, ...newFiles]);
    }
  };

  const handleRemoveFile = (id: string) => {
    onChange(
      "evidenceFiles",
      data.evidenceFiles.filter((f) => f.id !== id)
    );
  };

  const handleLinkParagraph = (id: string, paragraph: string) => {
    onChange(
      "evidenceFiles",
      data.evidenceFiles.map((f) => (f.id === id ? { ...f, linkedParagraph: paragraph } : f))
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="bg-gradient-to-br from-background/60 to-background/30 border-primary/20 text-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Filing Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1">
              <Label htmlFor="strategy-switch" className="text-foreground/90">
                {data.strategy === "aggressive" ? "Aggressive" : "Collaborative"}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {data.strategy === "aggressive"
                  ? "Assert your position with strong legal arguments"
                  : "Seek mutual agreement and compromise solutions"}
              </p>
            </div>
            <Switch
              id="strategy-switch"
              checked={data.strategy === "aggressive"}
              onCheckedChange={(checked) =>
                onChange("strategy", checked ? "aggressive" : "collaborative")
              }
              className="ml-4"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background/60 to-background/30 border-primary/20 text-foreground">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-primary">Evidence Mapper</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              id="evidence-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Label
              htmlFor="evidence-upload"
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground py-2 px-4 rounded-md cursor-pointer flex items-center justify-center space-x-2 transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span>Upload Evidence Files</span>
            </Label>
            <p className="text-xs text-muted-foreground">PDF, DOC, or image files</p>
          </div>

          <div className="mt-6 space-y-4">
            {data.evidenceFiles.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 bg-background/70 p-3 rounded-md border border-input/30">
                <FileText className="h-5 w-5 text-primary" />
                <span className="flex-1 text-sm text-foreground/90">{file.name}</span>
                <Input
                  value={file.linkedParagraph || ""}
                  onChange={(e) => handleLinkParagraph(file.id, e.target.value)}
                  placeholder="Link to specific paragraph"
                  className="w-1/2 bg-background/50 border-input/50"
                />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(file.id)} className="text-muted-foreground hover:text-red-500">
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
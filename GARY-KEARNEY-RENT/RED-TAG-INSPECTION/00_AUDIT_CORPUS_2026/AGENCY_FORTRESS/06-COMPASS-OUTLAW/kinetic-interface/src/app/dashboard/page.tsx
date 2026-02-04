import { CaseHeader } from "@/components/command-center/CaseHeader";
import { CorrespondenceTracker } from "@/components/command-center/CorrespondenceTracker";
import { FilingTimeline } from "@/components/command-center/FilingTimeline";
import { LegalBriefView } from "@/components/command-center/LegalBriefView";
import { FilingPacketStatus } from "@/components/command-center/FilingPacketStatus";
import { AlertTriangle, Scale } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CommandCenterPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
        <CaseHeader 
            caseName="Estate of Judy Brakebill Jones"
            hearingDate="2026-01-15"
            opposingCounsel="Jacqueline Nicora"
        />

        {/* Action Required Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
             <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
             <div>
                <h3 className="font-semibold text-red-900">Action Required: Petition for Probate Filed</h3>
                <p className="text-sm text-red-800 mt-1">
                    Review the filing timeline and prepare your objections immediately. 
                    You have asserted Pro Per status; ensure all communications are logged.
                </p>
             </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="legal">Legal Strategy</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <CorrespondenceTracker />
                    <div className="border border-dashed rounded-lg p-8 text-center bg-muted/20">
                        <h3 className="text-lg font-medium text-muted-foreground">Asset Reconciliation</h3>
                        <p className="text-sm text-muted-foreground mt-2">Coming next - Schedule A comparison view</p>
                    </div>
                </div>
                <div className="space-y-6">
                    <FilingPacketStatus />
                    <FilingTimeline />
                </div>
            </div>
          </TabsContent>

          <TabsContent value="legal" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                 <LegalBriefView />
              </div>
              <div className="space-y-6">
                 <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Scale className="w-5 h-5 text-amber-600" />
                      <h3 className="font-semibold">Strategy Summary</h3>
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">1.</span>
                        <span>Assert Pro Per status to stop Opposing Counsel from claiming non-responsiveness.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">2.</span>
                        <span>File <b>Probate Code § 850 Petition</b> to confirm Trust assets.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">3.</span>
                        <span>Argue <i>Heggstad/Ukkestad</i> precedents using the Attorney Instruction Letter as key evidence.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-primary">4.</span>
                        <span>Move to dismiss the full Probate Petition as moot.</span>
                      </li>
                    </ul>
                 </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
    </div>
  );
}
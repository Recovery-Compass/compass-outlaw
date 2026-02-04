import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, DollarSign, TrendingDown, Shield } from "lucide-react";

// Verified subscriptions from bank statements
const subscriptions = [
  // Wells Fargo - High Priority
  { id: 1, vendor: "MANUS AI", amount: 234.00, account: "Wells Fargo", category: "AI Tools", priority: "high", isProtected: true, notes: "Nov 3 charge, prorated refund possible $179.40", potentialSavings: 234.00 },
  { id: 2, vendor: "Otter.AI", amount: 90.00, account: "Wells Fargo", category: "AI Tools", priority: "high", isProtected: true, notes: "Oct 19 charge, downgrade to free tier option", potentialSavings: 90.00 },
  { id: 3, vendor: "Google Workspace", amount: 392.11, account: "Wells Fargo", category: "Productivity", priority: "high", isProtected: true, notes: "Nov 3 charge, audit seats - remove 10 inactive users for $180/mo savings", potentialSavings: 180.00 },
  { id: 4, vendor: "Scribd", amount: 11.99, account: "Wells Fargo", category: "Media", priority: "medium", isProtected: true, notes: "DUPLICATE - charged 2x on Oct 27, cancel one", potentialSavings: 11.99 },
  { id: 5, vendor: "Scribd (duplicate)", amount: 11.99, account: "Wells Fargo", category: "Media", priority: "high", isProtected: false, notes: "DUPLICATE - charged 2x on Oct 27, cancel this one", potentialSavings: 11.99 },
  { id: 6, vendor: "Adobe Creative Cloud", amount: 57.00, account: "Wells Fargo", category: "Design Tools", priority: "medium", isProtected: false, notes: "Multiple charges, consolidate to Photography Plan", potentialSavings: 30.00 },
  { id: 7, vendor: "Vercel", amount: 20.00, account: "Wells Fargo", category: "Web Hosting", priority: "low", isProtected: true, notes: "Keep this, cancel Netlify instead", potentialSavings: 0 },
  { id: 8, vendor: "Figma", amount: 24.00, account: "Wells Fargo", category: "Design Tools", priority: "medium", isProtected: false, notes: "Downgrade to Free tier", potentialSavings: 24.00 },
  { id: 9, vendor: "KnowledgeOwl", amount: 187.50, account: "Wells Fargo", category: "Documentation", priority: "medium", isProtected: false, notes: "Reversed Nov 4, re-billed Nov 5, monitor for issues", potentialSavings: 187.50 },
  { id: 10, vendor: "WIX.com", amount: 40.00, account: "Wells Fargo", category: "Web Hosting", priority: "medium", isProtected: false, notes: "Redundant with Vercel, cancel if not in use", potentialSavings: 40.00 },
  
  // Capital One - Critical Issues
  { id: 11, vendor: "BLACKBOX SUBSCRIPTION", amount: 4.99, account: "Capital One", category: "AI Code Tool", priority: "high", isProtected: false, notes: "BILLING ERROR - charged 3x in Oct, request $25-75 refund", potentialSavings: 4.99, refundPotential: 50.00 },
  { id: 12, vendor: "BLACKBOX SUBSCRIPTION (dup 2)", amount: 4.99, account: "Capital One", category: "AI Code Tool", priority: "high", isProtected: false, notes: "DUPLICATE 2 - cancel immediately", potentialSavings: 4.99 },
  { id: 13, vendor: "BLACKBOX SUBSCRIPTION (dup 3)", amount: 4.99, account: "Capital One", category: "AI Code Tool", priority: "high", isProtected: false, notes: "DUPLICATE 3 - cancel immediately", potentialSavings: 4.99 },
  { id: 14, vendor: "Apple.com/Bill", amount: 200.00, account: "Capital One", category: "Unknown", priority: "high", isProtected: false, notes: "MYSTERY CHARGE 1 - $200, urgent audit at appleid.apple.com", potentialSavings: 200.00 },
  { id: 15, vendor: "Apple.com/Bill (2)", amount: 200.00, account: "Capital One", category: "Unknown", priority: "high", isProtected: false, notes: "MYSTERY CHARGE 2 - $200, urgent audit at appleid.apple.com", potentialSavings: 200.00 },
  { id: 16, vendor: "Apple.com/Bill (3)", amount: 18.99, account: "Capital One", category: "Apple Services", priority: "medium", isProtected: false, notes: "Likely iCloud+ or Apple One", potentialSavings: 0 },
  { id: 17, vendor: "Claude.AI", amount: 20.00, account: "Capital One", category: "AI Assistant", priority: "low", isProtected: true, notes: "Review usage, keep if essential", potentialSavings: 0 },
  { id: 18, vendor: "PADDLE.NET* APPBANTER", amount: 50.00, account: "Capital One", category: "Unknown", priority: "high", isProtected: false, notes: "UNKNOWN SERVICE - research what this is", potentialSavings: 50.00 },
  { id: 19, vendor: "Cloudflare", amount: 7.20, account: "Capital One", category: "Web Services", priority: "medium", isProtected: false, notes: "Charge 1 of 3, consolidate domains", potentialSavings: 7.20 },
  { id: 20, vendor: "Cloudflare (2)", amount: 7.19, account: "Capital One", category: "Web Services", priority: "medium", isProtected: false, notes: "Charge 2 of 3, consolidate domains", potentialSavings: 7.19 },
  { id: 21, vendor: "Cloudflare (3)", amount: 2.03, account: "Capital One", category: "Web Services", priority: "medium", isProtected: false, notes: "Charge 3 of 3, consolidate domains", potentialSavings: 2.03 },
  { id: 22, vendor: "Netlify", amount: 20.00, account: "Capital One", category: "Web Hosting", priority: "high", isProtected: false, notes: "REDUNDANT with Vercel, cancel this", potentialSavings: 20.00 },
  { id: 23, vendor: "Canva", amount: 21.99, account: "Capital One", category: "Design Tools", priority: "low", isProtected: true, notes: "Keep or downgrade to Free", potentialSavings: 0 },
  { id: 24, vendor: "Bito Inc.", amount: 13.57, account: "Capital One", category: "AI Code Tool", priority: "medium", isProtected: false, notes: "Review usage vs BLACKBOX/Copilot", potentialSavings: 13.57 },
  { id: 25, vendor: "Amazon Prime", amount: 7.67, account: "Capital One", category: "Streaming", priority: "low", isProtected: true, notes: "Keep", potentialSavings: 0 },
  { id: 26, vendor: "Prime Video", amount: 3.79, account: "Capital One", category: "Streaming", priority: "low", isProtected: false, notes: "Add-on channel, review if needed", potentialSavings: 3.79 },
];

export default function Dashboard() {
  const [selectedSubs, setSelectedSubs] = useState<number[]>([]);
  const [filter, setFilter] = useState<"all" | "high" | "protected">("all");

  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
  const totalAnnual = totalMonthly * 12;
  const potentialMonthlySavings = subscriptions
    .filter(sub => !sub.isProtected)
    .reduce((sum, sub) => sum + sub.potentialSavings, 0);
  const potentialAnnualSavings = potentialMonthlySavings * 12;
  const refundOpportunity = subscriptions
    .filter(sub => sub.refundPotential)
    .reduce((sum, sub) => sum + (sub.refundPotential || 0), 0);

  const filteredSubs = subscriptions
    .filter(sub => {
      if (filter === "high") return sub.priority === "high";
      if (filter === "protected") return sub.isProtected;
      return true;
    })
    .sort((a, b) => b.amount - a.amount);

  const toggleSelection = (id: number) => {
    setSelectedSubs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedSavings = subscriptions
    .filter(sub => selectedSubs.includes(sub.id))
    .reduce((sum, sub) => sum + sub.potentialSavings, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Subscription Audit
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Verified from Wells Fargo and Capital One statements
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Monthly</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalMonthly.toFixed(2)}</div>
              <p className="text-xs text-slate-500">${totalAnnual.toFixed(2)}/year</p>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Potential Savings</CardTitle>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                ${potentialMonthlySavings.toFixed(2)}/mo
              </div>
              <p className="text-xs text-green-600 dark:text-green-500">
                ${potentialAnnualSavings.toFixed(2)}/year
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refund Opportunity</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                ${refundOpportunity.toFixed(2)}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-500">One-time recovery</p>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protected Tools</CardTitle>
              <Shield className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
                {subscriptions.filter(s => s.isProtected).length}
              </div>
              <p className="text-xs text-amber-600 dark:text-amber-500">Essential workflows</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
          >
            All ({subscriptions.length})
          </Button>
          <Button
            variant={filter === "high" ? "default" : "outline"}
            onClick={() => setFilter("high")}
            size="sm"
          >
            High Priority ({subscriptions.filter(s => s.priority === "high").length})
          </Button>
          <Button
            variant={filter === "protected" ? "default" : "outline"}
            onClick={() => setFilter("protected")}
            size="sm"
          >
            Protected ({subscriptions.filter(s => s.isProtected).length})
          </Button>
        </div>

        {/* Selection Summary */}
        {selectedSubs.length > 0 && (
          <Card className="border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                    {selectedSubs.length} subscription{selectedSubs.length > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">
                    ${selectedSavings.toFixed(2)}/mo potential savings
                  </p>
                </div>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Generate Cancellation Emails
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscriptions List */}
        <div className="space-y-3">
          {filteredSubs.map(sub => (
            <Card
              key={sub.id}
              className={`transition-all cursor-pointer hover:shadow-md ${
                selectedSubs.includes(sub.id)
                  ? "ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/30"
                  : sub.isProtected
                  ? "border-amber-200 dark:border-amber-800"
                  : "border-slate-200 dark:border-slate-700"
              }`}
              onClick={() => !sub.isProtected && toggleSelection(sub.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{sub.vendor}</h3>
                      {sub.isProtected && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                          <Shield className="w-3 h-3 mr-1" />
                          Protected
                        </Badge>
                      )}
                      {sub.priority === "high" && !sub.isProtected && (
                        <Badge variant="destructive">High Priority</Badge>
                      )}
                      {sub.refundPotential && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          Refund: ${sub.refundPotential}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{sub.account}</span>
                      <span>•</span>
                      <span>{sub.category}</span>
                    </div>

                    <p className="text-sm text-slate-700 dark:text-slate-300">{sub.notes}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="text-2xl font-bold">${sub.amount.toFixed(2)}</div>
                    <div className="text-xs text-slate-500">/month</div>
                    {sub.potentialSavings > 0 && (
                      <div className="text-sm font-medium text-green-600 dark:text-green-400">
                        Save ${sub.potentialSavings.toFixed(2)}/mo
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

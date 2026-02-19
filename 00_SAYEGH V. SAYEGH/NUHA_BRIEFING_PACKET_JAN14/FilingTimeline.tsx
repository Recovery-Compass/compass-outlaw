"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, AlertCircle, XCircle, Clock, Scale, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type MilestoneStatus = "completed" | "current" | "upcoming" | "blocked";
type ActorType = "nicora" | "self" | "court";

interface FilingMilestone {
  id: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  date?: string;
  dueDate?: string;
  actor: ActorType;
  notes?: string;
  daysRemaining?: number;
}

const mockMilestones: FilingMilestone[] = [
  {
    id: "1",
    title: "Petition for Probate Filed",
    description: "Nicora filed Petition for Probate of the Trust",
    status: "completed",
    date: "2025-11-20",
    actor: "nicora",
    notes: "Filed in Sacramento County Superior Court",
  },
  {
    id: "2",
    title: "Notice of Hearing Issued",
    description: "Court issues notice with hearing date",
    status: "completed",
    date: "2025-11-22",
    actor: "court",
  },
  {
    id: "3",
    title: "Pro Per Appearance Asserted",
    description: "Self-representation formally communicated",
    status: "completed",
    date: "2025-11-25",
    actor: "self",
    notes: "Email sent to Nicora asserting Pro Per status",
  },
  {
    id: "4",
    title: "Objection Deadline",
    description: "Deadline to file objections to the Petition",
    status: "current",
    dueDate: "2025-12-25",
    actor: "self",
    daysRemaining: 30,
    notes: "CRITICAL: Must file written objections before this date",
  },
  {
    id: "5",
    title: "Hearing Date",
    description: "Court hearing on Petition for Probate",
    status: "upcoming",
    dueDate: "2026-01-15",
    actor: "court",
    daysRemaining: 51,
  },
  {
    id: "6",
    title: "Court Order Issued",
    description: "Judge issues ruling on the Petition",
    status: "upcoming",
    actor: "court",
  },
];

const statusConfig: Record<MilestoneStatus, { icon: React.ReactNode; color: string; bgColor: string }> = {
  completed: {
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  current: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
  upcoming: {
    icon: <Circle className="w-4 h-4" />,
    color: "text-gray-400",
    bgColor: "bg-gray-100",
  },
  blocked: {
    icon: <XCircle className="w-4 h-4" />,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

const actorConfig: Record<ActorType, { label: string; color: string }> = {
  nicora: { label: "Opposing Counsel", color: "text-red-600" },
  self: { label: "You (Pro Per)", color: "text-green-600" },
  court: { label: "Court", color: "text-blue-600" },
};

export function FilingTimeline() {
  const currentMilestone = mockMilestones.find((m) => m.status === "current");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                <CardTitle>Filing Timeline</CardTitle>
            </div>
            <CardDescription>Petition for Probate</CardDescription>
            <p className="text-xs text-muted-foreground">Track procedural milestones and deadlines</p>
        </CardHeader>
        <CardContent>
            {/* Critical Deadline Banner */}
            {currentMilestone && currentMilestone.daysRemaining && (
                 <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h4 className="font-semibold text-amber-800">Your Next Deadline</h4>
                    </div>
                    <p className="text-sm font-medium text-amber-900">{currentMilestone.title}</p>
                    <div className="flex items-center justify-between mt-2">
                        <Badge variant="warning">{currentMilestone.daysRemaining} days remaining</Badge>
                        {currentMilestone.dueDate && (
                            <span className="text-xs text-amber-700">Due: {formatDate(currentMilestone.dueDate)}</span>
                        )}
                    </div>
                 </div>
            )}

            <div className="relative pl-4 border-l ml-3">
                {mockMilestones.map((milestone, index) => {
                    const config = statusConfig[milestone.status];
                    const actorInfo = actorConfig[milestone.actor];
                    
                    return (
                        <div key={milestone.id} className="mb-8 relative pl-6">
                            {/* Status Icon */}
                            <div className={cn("absolute -left-[27px] bg-background rounded-full p-1 border", config.color)}>
                                {config.icon}
                            </div>
                            
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-semibold">{milestone.title}</h4>
                                    <Badge variant="outline" className="text-[10px]">{actorInfo.label}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{milestone.description}</p>
                                
                                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                                    {milestone.date && (
                                        <span>{formatDate(milestone.date)}</span>
                                    )}
                                    {milestone.dueDate && milestone.status !== "completed" && (
                                         <span className="text-amber-600 font-medium">Due: {formatDate(milestone.dueDate)}</span>
                                    )}
                                </div>
                                
                                {milestone.notes && (
                                    <div className="mt-2 text-xs bg-muted p-2 rounded">
                                        📝 {milestone.notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </CardContent>
    </Card>
  );
}

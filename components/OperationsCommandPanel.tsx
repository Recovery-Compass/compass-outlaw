import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, Clock, AlertTriangle, Calendar, ArrowRight } from 'lucide-react';
import { DEC_1_VERIFICATION_PROTOCOL } from '../constants';
import { VerificationTask } from '../types';
import { getDaysUntilHearing } from '../config/glassHouseConfig';

const OperationsCommandPanel: React.FC = () => {
  const [tasks, setTasks] = useState<Record<string, VerificationTask>>({...DEC_1_VERIFICATION_PROTOCOL});
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTaskStatus = (taskKey: string) => {
    setTasks(prev => ({
      ...prev,
      [taskKey]: {
        ...prev[taskKey],
        status: prev[taskKey].status === 'COMPLETE' ? 'INCOMPLETE' : 'COMPLETE'
      }
    }));
  };

  const getStatusIcon = (status: VerificationTask['status']) => {
    switch (status) {
      case 'COMPLETE':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'IN_PROGRESS':
        return <Clock className="w-5 h-5 text-amber-500 animate-pulse" />;
      case 'BLOCKED':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
    }
  };

  const getTaskColor = (taskKey: string) => {
    if (taskKey.startsWith('C1')) return 'red';
    if (taskKey.startsWith('C2')) return 'emerald';
    if (taskKey.startsWith('C3')) return 'amber';
    if (taskKey.startsWith('C4') || taskKey.startsWith('C5')) return 'indigo';
    return 'slate';
  };

  const getBorderColor = (taskKey: string, status: VerificationTask['status']) => {
    if (status === 'COMPLETE') return 'border-emerald-500/50';
    const color = getTaskColor(taskKey);
    return `border-${color}-500/30`;
  };

  const taskEntries = Object.entries(tasks) as [string, VerificationTask][];
  const completedCount = taskEntries.filter(([, t]) => t.status === 'COMPLETE').length;
  const progressPercent = (completedCount / taskEntries.length) * 100;
  const daysUntilHearing = getDaysUntilHearing();

  return (
    <div className="bg-void-light/50 border border-slate-800 rounded-sm p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-red-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              December 1 Operations Command
            </h3>
            <p className="text-xs font-mono text-slate-500">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' • '}
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Jan 6 Countdown */}
          <div className="bg-red-950/30 border border-red-500/30 px-3 py-2 rounded-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red-500" />
              <span className="text-xs font-mono text-red-400">JAN 6 HEARING</span>
            </div>
            <p className="text-lg font-bold text-red-500 text-center">
              {daysUntilHearing} <span className="text-xs font-normal">DAYS</span>
            </p>
          </div>
          
          {/* Progress */}
          <div className="text-right">
            <p className="text-xs font-mono text-slate-500 uppercase">Progress</p>
            <p className="text-2xl font-bold text-slate-100">
              {completedCount}<span className="text-slate-500">/{taskEntries.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Task Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {taskEntries.map(([key, task]) => {
          const color = getTaskColor(key);
          const isComplete = task.status === 'COMPLETE';
          
          return (
            <div 
              key={key}
              className={`relative bg-void border rounded-sm p-4 transition-all cursor-pointer hover:bg-void-light/30 ${getBorderColor(key, task.status)} ${isComplete ? 'opacity-70' : ''}`}
              onClick={() => toggleTaskStatus(key)}
            >
              {/* Task ID Badge */}
              <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold uppercase bg-${color}-500/20 text-${color}-500 rounded-bl-sm`}>
                {key.split('_')[0]}
              </div>
              
              {/* Status Icon */}
              <div className="flex items-start gap-3 mb-3">
                {getStatusIcon(task.status)}
                <h4 className={`text-sm font-bold ${isComplete ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                  {task.task}
                </h4>
              </div>
              
              {/* Verification Requirement */}
              <div className="space-y-2 mb-3">
                <label className="text-[10px] text-slate-600 font-bold uppercase tracking-zen">
                  Verification Required
                </label>
                <p className={`text-xs ${isComplete ? 'text-slate-600' : 'text-slate-400'} border-l-2 border-slate-700 pl-2`}>
                  {task.verification}
                </p>
              </div>
              
              {/* Blocker Warning */}
              {!isComplete && (
                <div className="flex items-center gap-2 text-[10px] text-amber-500">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-mono">{task.blocker_if_false}</span>
                </div>
              )}
              
              {/* Action Indicator */}
              <div className="absolute bottom-3 right-3">
                {isComplete ? (
                  <span className="text-[10px] font-bold text-emerald-500 uppercase">✓ Verified</span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-600 flex items-center gap-1">
                    Click to complete <ArrowRight className="w-3 h-3" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <span className="text-[10px] text-slate-500 uppercase">C1 Family</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
            <span className="text-[10px] text-slate-500 uppercase">C2 Probate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
            <span className="text-[10px] text-slate-500 uppercase">C3 Elder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500/50" />
            <span className="text-[10px] text-slate-500 uppercase">C4/C5 State Bar</span>
          </div>
        </div>
        
        {completedCount === taskEntries.length && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-sm">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
              All Tasks Verified – Mission Ready
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OperationsCommandPanel;

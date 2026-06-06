import React from "react";
import { Shield, CheckCircle, AlertTriangle, Clock, History, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface SecurityLog {
  date: string;
  findings: string[];
  patches: string[];
}

interface SecurityStatus {
  lastRun: string;
  nextRun: string;
  status: string;
  logs: SecurityLog[];
}

export default function SecurityDashboard() {
  const [status, setStatus] = React.useState<SecurityStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/security-status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Failed to fetch security status", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1E40AF]"></div>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="space-y-8">
      <div className="bg-card dark:bg-card p-8 rounded-3xl border border-border dark:border-border shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground dark:text-foreground">System Security Status</h3>
              <p className="text-muted-foreground dark:text-muted-foreground text-sm">Automated vulnerability assessment & patching active</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm font-bold flex items-center space-x-2">
            <CheckCircle size={16} />
            <span>{status.status}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-muted dark:bg-muted rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-[#1E40AF] dark:text-blue-400">
              <History size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Last Assessment</span>
            </div>
            <p className="text-xl font-bold text-foreground dark:text-foreground">{new Date(status.lastRun).toLocaleDateString()} at {new Date(status.lastRun).toLocaleTimeString()}</p>
          </div>
          <div className="p-6 bg-muted dark:bg-muted rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-[#1E40AF] dark:text-blue-400">
              <Clock size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">Next Scheduled Run</span>
            </div>
            <p className="text-xl font-bold text-foreground dark:text-foreground">{new Date(status.nextRun).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-serif text-2xl font-bold flex items-center space-x-2 text-foreground dark:text-foreground">
          <History className="text-[#1E40AF] dark:text-blue-400" />
          <span>Assessment History</span>
        </h4>
        
        <div className="space-y-4">
          {status.logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground dark:text-muted-foreground bg-card dark:bg-card rounded-3xl border border-dashed border-border dark:border-border">
              No assessment logs available yet.
            </div>
          ) : (
            status.logs.map((log, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card dark:bg-card p-6 rounded-3xl border border-border dark:border-border space-y-4"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#1E40AF] dark:text-blue-400">{new Date(log.date).toLocaleDateString()}</span>
                  <span className="text-xs font-bold px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full uppercase">Success</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest flex items-center space-x-1">
                      <AlertTriangle size={12} />
                      <span>Findings</span>
                    </p>
                    <ul className="space-y-1">
                      {log.findings.map((f, i) => (
                        <li key={i} className="text-sm text-foreground dark:text-foreground">• {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-widest flex items-center space-x-1">
                      <Shield size={12} />
                      <span>Patches Applied</span>
                    </p>
                    <ul className="space-y-1">
                      {log.patches.map((p, i) => (
                        <li key={i} className="text-sm text-foreground dark:text-foreground">• {p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

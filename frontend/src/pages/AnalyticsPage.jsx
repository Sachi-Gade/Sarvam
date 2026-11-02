import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  Languages, 
  AlertTriangle, 
  PieChart as PieIcon, 
  FileSpreadsheet,
  CheckCircle
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { api } from '../api';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const [charts, setCharts] = useState(null);
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const [chartsData, overviewData] = await Promise.all([
        api.getAnalyticsCharts(),
        api.getAnalyticsOverview()
      ]);
      setCharts(chartsData);
      setOverview(overviewData);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Generate simple client-side CSV download
    const headers = "Patient ID,Name,Age,Language,Diagnosis,Adherence Rate,Status\n";
    const rows = [
      "PT-2026-101,Rameshwar Patil,62,Marathi,Post-CABG,100%,Active",
      "PT-2026-102,Kamla Devi,58,Hindi,Type 2 Diabetes,90%,Active",
      "PT-2026-103,Gurpreet Singh,45,Punjabi,Femur Fracture,65%,Active",
      "PT-2026-104,Sunita Sharma,34,Hindi,Post-Partum Pre-Eclampsia,100%,Active",
      "PT-2026-105,Rajesh Verma,52,English,Post-Stent PCI,85%,Escalated"
    ].join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `aarogya_followup_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Top Bar with Export Action */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">Population Health & Adherence Analytics</h3>
            <p className="text-xs text-slate-500">Longitudinal recovery metrics, adherence patterns, and native language distribution</p>
          </div>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Follow-Up Report (CSV)</span>
        </button>
      </div>

      {/* Grid of Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Native Language Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Patient Cohort by Preferred Language</h4>
            <p className="text-xs text-slate-500">Distribution across vernacular dialects for voice calls</p>
          </div>

          <div className="h-64 flex items-center justify-center">
            {charts?.languages ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.languages} layout="vertical">
                  <XAxis type="number" fontSize={11} stroke="#94a3b8" />
                  <YAxis type="category" dataKey="name" fontSize={11} stroke="#94a3b8" width={110} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#0284c7" radius={[0, 8, 8, 0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Loading chart...</div>
            )}
          </div>
        </div>

        {/* Chart 2: Common Symptoms Reported */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800">Reported Symptoms Breakdown</h4>
            <p className="text-xs text-slate-500">Post-discharge non-diagnostic patient symptom frequency</p>
          </div>

          <div className="h-64">
            {charts?.symptoms_breakdown ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.symptoms_breakdown}>
                  <XAxis dataKey="symptom" fontSize={10} stroke="#94a3b8" interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} name="Reports" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-400">Loading chart...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


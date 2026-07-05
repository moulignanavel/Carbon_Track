import { useState, useEffect } from 'react';
import { TrendingUp, Users, Leaf, Download, RefreshCw } from 'lucide-react';
import { getDashboardMetrics, getCSRReport } from '@/api/organisationApi';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/organisation/DashboardHeader';
import MetricsCards from '@/components/organisation/MetricsCards';
import MonthlyEmissionsChart from '@/components/organisation/MonthlyEmissionsChart';
import DepartmentComparison from '@/components/organisation/DepartmentComparison';
import EmployeeTable from '@/components/organisation/EmployeeTable';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';

/**
 * OrganisationDashboardPage
 * ─────────────────────────────────────────────────────────────
 * Admin-level dashboard for organization-wide metrics:
 *   - Total employees & emissions
 *   - Monthly emissions trend
 *   - Department comparison
 *   - Top employee performers
 *   - CSR report export
 */

export default function OrganisationDashboardPage() {
  const { user: currentUser } = useAuth();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExportingReport, setIsExportingReport] = useState(false);

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // For now, hardcode org ID - in production, get from user context
        const organisationId = 1;
        const data = await getDashboardMetrics(organisationId);
        setDashboardData(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard');
        console.error('Dashboard error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Handle CSR report export
  const handleExportCSR = async () => {
    try {
      setIsExportingReport(true);
      const organisationId = 1; // Same as above
      const report = await getCSRReport(organisationId);
      
      // Create blob and download
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
      element.setAttribute('download', `CSR-Report-${dashboardData?.organisationName}-${new Date().toISOString().split('T')[0]}.txt`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (err) {
      setError('Failed to export CSR report');
      console.error('Export error:', err);
    } finally {
      setIsExportingReport(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const organisationId = 1;
      const data = await getDashboardMetrics(organisationId);
      setDashboardData(data);
    } catch (err) {
      setError('Failed to refresh dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !dashboardData) {
    return <Spinner fullPage label="Loading dashboard…" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-50">
                Organization Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                {dashboardData?.organisationName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCSR}
              disabled={isExportingReport || !dashboardData}
            >
              <Download className="w-4 h-4" />
              {isExportingReport ? 'Exporting…' : 'CSR Report'}
            </Button>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor your organization's sustainability progress and employee engagement.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6">
          <Alert variant="danger" title="Error" message={error} />
        </div>
      )}

      {/* Metrics Cards */}
      {dashboardData && (
        <>
          <MetricsCards 
            data={{
              totalEmployees: dashboardData.totalEmployees,
              totalEmissionsCO2: dashboardData.totalEmissionsCO2,
              metrics: dashboardData.metrics
            }}
          />

          {/* Charts Section */}
          <div className="max-w-7xl mx-auto mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Emissions Chart */}
            <div className="lg:col-span-2">
              <MonthlyEmissionsChart monthlyEmissions={dashboardData.monthlyEmissions} />
            </div>

            {/* Department Comparison */}
            <div>
              <DepartmentComparison departments={dashboardData.departmentComparison} />
            </div>
          </div>

          {/* Employee Table */}
          <div className="max-w-7xl mx-auto">
            <EmployeeTable employees={dashboardData.topEmployees} />
          </div>
        </>
      )}

      {/* Last Updated */}
      {dashboardData && (
        <div className="max-w-7xl mx-auto mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Last updated: {new Date(dashboardData.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}

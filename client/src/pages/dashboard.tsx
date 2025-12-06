import { useEffect, useState, Suspense, lazy } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import SystemStatus from "@/components/dashboard/SystemStatus";
import HourlyChart from "@/components/dashboard/HourlyChart";
import QueueStatus from "@/components/dashboard/QueueStatus";
import FloatingActionMenu from "@/components/dashboard/FloatingActionMenu";
import { CommandPalette } from "@/components/dashboard/CommandPalette";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { DashboardCustomizer } from "@/components/dashboard/DashboardCustomizer";
import { useWebSocketContext } from "@/contexts/WebSocketContext";
import { Loader2 } from "lucide-react";

// Lazy Load Heavy Components
const ContentGeneration = lazy(() => import("@/components/dashboard/ContentGeneration"));
const LogsViewer = lazy(() => import("@/components/dashboard/LogsViewer"));
const FileManagement = lazy(() => import("@/components/dashboard/FileManagement"));
const HealthMonitor = lazy(() => import("@/components/dashboard/HealthMonitor"));
const ContentConfiguration = lazy(() => import("@/components/dashboard/ContentConfiguration"));
const DataSourceManager = lazy(() => import("@/components/dashboard/DataSourceManager"));
const OutputConfiguration = lazy(() => import("@/components/dashboard/OutputConfiguration"));
const ScheduleManager = lazy(() => import("@/components/dashboard/ScheduleManager"));
const ApiSettings = lazy(() => import("@/components/dashboard/ApiSettings"));
const Terminal = lazy(() => import("@/components/dashboard/Terminal"));
const SystemHealthDashboard = lazy(() => import("@/components/dashboard/SystemHealthDashboard"));
const LicenseManagement = lazy(() => import("@/components/dashboard/LicenseManagement"));
const OllamaSetup = lazy(() => import("@/components/dashboard/OllamaSetup"));
const ReviewQueue = lazy(() => import("@/components/dashboard/ReviewQueue"));
const CredentialsManager = lazy(() => import("@/components/dashboard/CredentialsManager"));
const EnvironmentManager = lazy(() => import("@/components/dashboard/EnvironmentManager"));
const AgentConfigurator = lazy(() => import("@/components/dashboard/AgentConfigurator"));
const SMSCommands = lazy(() => import("@/components/dashboard/SMSCommands"));
const SystemTesting = lazy(() => import("@/components/dashboard/SystemTesting"));
const DeploymentGuide = lazy(() => import("@/components/dashboard/DeploymentGuide"));
const DatabaseConfiguration = lazy(() => import("@/components/dashboard/DatabaseConfiguration"));
const CodeModification = lazy(() => import("@/components/dashboard/CodeModification"));
const SocialAutomator = lazy(() => import("@/components/organelles/SocialAutomator"));
const ColonyManager = lazy(() => import("@/components/dashboard/ColonyManager"));

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeView, setActiveView] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { layout, toggleWidget, resetLayout } = useDashboardLayout();

  const renderActiveView = () => {
    switch (activeView) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Metrics Grid */}
            {layout.metrics && <MetricsGrid />}

            {/* Terminal Console */}
            {layout.terminal && <Terminal />}

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Live Activity Feed */}
              {layout.activity && (
                <div className={layout.status ? "lg:col-span-2" : "lg:col-span-3"}>
                  <LiveActivityFeed />
                </div>
              )}
              {/* System Status */}
              {layout.status && (
                <div className={layout.activity ? "" : "lg:col-span-3"}>
                  <SystemStatus />
                </div>
              )}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {layout.charts && <HourlyChart />}
              {layout.queue && <QueueStatus />}
            </div>
          </div>
        );
      case "health":
        return <SystemHealthDashboard />;
      case "generation":
        return <ContentGeneration />;
      case "content-config":
        return <ContentConfiguration />;
      case "data-sources":
        return <DataSourceManager />;
      case "output-config":
        return <OutputConfiguration />;
      case "schedule":
        return <ScheduleManager />;
      case "astronomy":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <i className="fas fa-satellite text-primary"></i>
              Astronomy Data
            </h2>
            <p className="text-muted-foreground">
              Real-time astronomical data and planetary positions.
            </p>
            {/* Future astronomy data components will go here */}
            <div className="text-center py-12 text-muted-foreground">
              <i className="fas fa-satellite text-4xl mb-4"></i>
              <p>Astronomy data interface coming soon...</p>
            </div>
          </div>
        );
      case "queue":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <i className="fas fa-clock text-primary"></i>
              Queue Monitor
            </h2>
            <p className="text-muted-foreground">
              Monitor and manage the content generation queue and background jobs.
            </p>
            <QueueStatus />
          </div>
        );
      case "logs":
        return <LogsViewer />;
      case "files":
        return <FileManagement />;

      case "api-settings":
        return <ApiSettings />;
      case "configuration":
      case "settings":
        return <EnvironmentManager />;
      case "ai-credentials":
      case "email-credentials":
      case "phone-credentials":
      case "credentials":
        return <CredentialsManager />;
      case "agent-config":
      case "agent-configurator":
        return <AgentConfigurator />;
      case "reviews":
      case "review-queue":
        return <ReviewQueue />;
      case "sms-commands":
      case "remote-control":
        return <SMSCommands />;
      case "testing":
      case "tests":
        return <SystemTesting />;
      case "deployment":
      case "deploy":
        return <DeploymentGuide />;
      case "database":
      case "db-config":
        return <DatabaseConfiguration />;
      case "code-modification":
      case "self-modify":
        return <CodeModification />;
      case "license":
        return <LicenseManagement />;
      case "ollama":
        return <OllamaSetup />;
      case "social-automator":
        return <SocialAutomator />;
      case "colony":
        return <ColonyManager />;
      default:
        return (
          <div className="space-y-6">
            <MetricsGrid />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LiveActivityFeed />
              </div>
              <SystemStatus />
            </div>
          </div>
        );
    }
  };

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // WebSocket connection for real-time updates
  const { subscribe } = useWebSocketContext();

  useEffect(() => {
    const unsubscribe = subscribe((message) => {
      switch (message.type) {
        case 'metrics_update':
          // Handle real-time metrics updates
          console.log('Metrics updated:', message.data);
          break;
        case 'new_activity':
          // Show notification for new activity
          toast({
            title: "New Activity",
            description: message.message,
          });
          break;
        default:
          console.log('Unknown WebSocket message:', message);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto animate-pulse">
            <i className="fas fa-atom text-primary-foreground"></i>
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="flex min-h-screen bg-background" data-testid="dashboard-container">
      <CommandPalette />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={(view) => {
          setActiveView(view);
          setSidebarOpen(false); // Close sidebar on mobile after selection
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">

        {/* Top Bar */}
        <TopBar onMenuClick={() => setSidebarOpen(true)} />

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Amoeba AI Content Platform
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Universal AI content generation and dissemination platform
              </p>
            </div>
            {activeView === "overview" && (
              <DashboardCustomizer
                layout={layout}
                onToggle={toggleWidget}
                onReset={resetLayout}
              />
            )}
          </div>

          {/* Dynamic Content Based on Active View */}
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            {renderActiveView()}
          </Suspense>
        </div>
      </main>

      {/* Floating Action Menu */}
      <FloatingActionMenu />
    </div>
  );
}

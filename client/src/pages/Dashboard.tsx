import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, Globe, Key, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: sessions, isLoading: sessionsLoading } = trpc.sessions.list.useQuery();
  const { data: apiKeys, isLoading: keysLoading } = trpc.apiKeys.list.useQuery();

  const activeSessions = sessions?.filter(s => s.status === 'active').length || 0;
  const totalSessions = sessions?.length || 0;
  const totalApiKeys = apiKeys?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your browser automation sessions and tasks
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionsLoading ? "..." : totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Browser automation sessions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{sessionsLoading ? "..." : activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Keys</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keysLoading ? "..." : totalApiKeys}</div>
              <p className="text-xs text-muted-foreground">
                For n8n integration
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button size="sm" asChild className="w-full">
                <Link href="/sessions">Create Session</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Guide */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
          <CardHeader>
            <CardTitle>Quick Start Guide</CardTitle>
            <CardDescription>Get started with browser automation in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create a Session</h3>
                <p className="text-sm text-muted-foreground">
                  Set up a browser session with custom configuration (OS, locale, proxy settings)
                </p>
                <Button size="sm" variant="link" asChild className="px-0 h-auto mt-2">
                  <Link href="/sessions">Go to Sessions →</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create Automation Tasks</h3>
                <p className="text-sm text-muted-foreground">
                  Add tasks like navigation, clicking, form filling, screenshots, or custom JavaScript
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Integrate with n8n</h3>
                <p className="text-sm text-muted-foreground">
                  Generate an API key and use our REST API endpoints in your n8n workflows
                </p>
                <Button size="sm" variant="link" asChild className="px-0 h-auto mt-2">
                  <Link href="/api-keys">Manage API Keys →</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions */}
        {sessions && sessions.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Sessions</CardTitle>
                  <CardDescription>Your latest browser automation sessions</CardDescription>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/sessions">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        session.status === 'active' ? 'bg-primary animate-pulse' :
                        session.status === 'error' ? 'bg-destructive' :
                        'bg-muted-foreground'
                      }`} />
                      <div>
                        <p className="font-medium">{session.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'active' ? 'bg-primary/20 text-primary' :
                        session.status === 'error' ? 'bg-destructive/20 text-destructive' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {session.status}
                      </span>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/sessions/${session.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

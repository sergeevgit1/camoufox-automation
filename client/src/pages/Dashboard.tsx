import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, Fingerprint, Globe, Key } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: sessions, isLoading: sessionsLoading } = trpc.sessions.list.useQuery();
  const { data: apiKeys, isLoading: keysLoading } = trpc.apiKeys.list.useQuery();
  const { data: profiles, isLoading: profilesLoading } = trpc.profiles.list.useQuery();

  const activeSessions = sessions?.filter(s => s.status === 'active').length || 0;
  const totalSessions = sessions?.length || 0;
  const totalApiKeys = apiKeys?.length || 0;
  const totalProfiles = profiles?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Панель управления</h1>
          <p className="text-muted-foreground">
            Управляйте сессиями браузера и задачами автоматизации
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего сессий</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessionsLoading ? "..." : totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                Сессии автоматизации браузера
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные сессии</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{sessionsLoading ? "..." : activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                Сейчас работают
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Профили</CardTitle>
              <Fingerprint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profilesLoading ? "..." : totalProfiles}</div>
              <p className="text-xs text-muted-foreground">
                Профили браузера
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API ключи</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{keysLoading ? "..." : totalApiKeys}</div>
              <p className="text-xs text-muted-foreground">
                Для интеграции с n8n
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Guide */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
          <CardHeader>
            <CardTitle>Быстрый старт</CardTitle>
            <CardDescription>Начните работу с автоматизацией браузера в 3 простых шага</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Создать профиль</h3>
                <p className="text-sm text-muted-foreground">
                  Настройте профиль браузера с уникальным отпечатком (ОС, локаль, прокси)
                </p>
                <Button size="sm" variant="link" asChild className="px-0 h-auto mt-2">
                  <Link href="/profiles">Перейти к профилям →</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Создать сессию</h3>
                <p className="text-sm text-muted-foreground">
                  Запустите сессию браузера и добавьте задачи автоматизации
                </p>
                <Button size="sm" variant="link" asChild className="px-0 h-auto mt-2">
                  <Link href="/sessions">Перейти к сессиям →</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Интеграция с n8n</h3>
                <p className="text-sm text-muted-foreground">
                  Сгенерируйте API ключ и используйте REST API в ваших n8n workflow
                </p>
                <Button size="sm" variant="link" asChild className="px-0 h-auto mt-2">
                  <Link href="/api-keys">Управление API ключами →</Link>
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
                  <CardTitle>Последние сессии</CardTitle>
                  <CardDescription>Ваши недавние сессии автоматизации браузера</CardDescription>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/sessions">Показать все</Link>
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
                          {new Date(session.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === 'active' ? 'bg-primary/20 text-primary' :
                        session.status === 'error' ? 'bg-destructive/20 text-destructive' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {session.status === 'active' ? 'активна' : session.status === 'stopped' ? 'остановлена' : 'ошибка'}
                      </span>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/sessions/${session.id}`}>Открыть</Link>
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

import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { ArrowRight, Bot, Fingerprint, Globe, Key, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8" />
            )}
            <h1 className="text-xl font-bold">{APP_TITLE}</h1>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>Войти</a>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Bot className="w-4 h-4" />
            Автоматизация браузера на основе Camoufox
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Мощная платформа для{" "}
            <span className="text-primary">автоматизации браузера</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Управляйте множеством профилей браузера, автоматизируйте задачи и интегрируйтесь с n8n. 
            Полный функционал Playwright с защитой от обнаружения.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild className="group">
              <a href={getLoginUrl()}>
                Начать работу
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/docs")}>
              Документация API
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Всё необходимое для автоматизации
            </h2>
            <p className="text-muted-foreground text-lg">
              Профессиональные инструменты для управления браузерными сессиями
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Fingerprint className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Мультиаккаунтинг</h3>
              <p className="text-muted-foreground">
                Создавайте уникальные профили браузера с изолированными отпечатками, cookies и настройками. 
                Как в Dolphin или GoLogin.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Управление сессиями</h3>
              <p className="text-muted-foreground">
                Запускайте и управляйте множеством браузерных сессий с различными конфигурациями и профилями.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Playwright API</h3>
              <p className="text-muted-foreground">
                Полный доступ к функциям Playwright: навигация, клики, скриншоты, cookies, localStorage и многое другое.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">API для n8n</h3>
              <p className="text-muted-foreground">
                REST API с аутентификацией для интеграции с n8n и другими системами автоматизации.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Защита от обнаружения</h3>
              <p className="text-muted-foreground">
                Camoufox обеспечивает защиту от систем обнаружения автоматизации с человекоподобным поведением.
              </p>
            </div>

            <div className="p-6 rounded-lg border border-border/50 bg-card/30 backdrop-blur hover:border-primary/30 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Прокси и геолокация</h3>
              <p className="text-muted-foreground">
                Настройка прокси, часовых поясов, локалей и геолокации для каждого профиля отдельно.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Готовы начать автоматизацию?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Создайте свой первый профиль браузера и начните автоматизировать задачи прямо сейчас
          </p>
          <Button size="lg" asChild>
            <a href={getLoginUrl()}>
              Начать бесплатно
              <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 {APP_TITLE}. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}

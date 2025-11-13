import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Activity, Code, Globe, Key, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {APP_TITLE}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/docs">Documentation</Link>
              </Button>
              <Button asChild>
                <a href={getLoginUrl()}>Get Started</a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-foreground text-sm font-medium">
              Powered by Camoufox Anti-Detect Browser
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Browser Automation{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Without Detection
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Automate browser tasks with advanced anti-fingerprinting technology. 
            Perfect for web scraping, testing, and automation workflows with n8n integration.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild className="text-lg px-8">
              <a href={getLoginUrl()}>
                Start Automating
                <Zap className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8">
              <Link href="/docs">View Docs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground text-lg">Everything you need for browser automation</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>Anti-Detection</CardTitle>
              <CardDescription>
                Advanced fingerprint spoofing and anti-bot detection bypass using Camoufox technology
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Create and manage multiple browser sessions with custom configurations and fingerprints
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>n8n Integration</CardTitle>
              <CardDescription>
                RESTful API endpoints for seamless integration with n8n workflows and automation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Task Automation</CardTitle>
              <CardDescription>
                Execute navigation, clicking, form filling, screenshots, and custom JavaScript
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-primary" />
              </div>
              <CardTitle>API Key Management</CardTitle>
              <CardDescription>
                Generate and manage API keys for secure programmatic access from external tools
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-accent" />
              </div>
              <CardTitle>Real-time Status</CardTitle>
              <CardDescription>
                Monitor task execution status in real-time with detailed results and error handling
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 border-primary/20">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Start Automating?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create your account and start building powerful browser automation workflows today
            </p>
            <Button size="lg" asChild className="text-lg px-8">
              <a href={getLoginUrl()}>
                Get Started Now
                <Zap className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              <span>{APP_TITLE}</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/docs" className="hover:text-foreground transition-colors">
                Documentation
              </Link>
              <a href="https://camoufox.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Camoufox
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

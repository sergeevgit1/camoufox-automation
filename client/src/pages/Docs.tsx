import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE } from "@/const";
import { ArrowLeft, Code, Globe } from "lucide-react";
import { Link } from "wouter";

export default function Docs() {
  const apiBaseUrl = window.location.origin + "/api/trpc";

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
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
            <p className="text-lg text-muted-foreground">
              Complete guide for integrating Camoufox Browser Automation with n8n and other tools
            </p>
          </div>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication</CardTitle>
              <CardDescription>All API requests require authentication using an API key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm mb-2">Include your API key in the Authorization header:</p>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </div>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Note:</strong> Generate API keys from the dashboard after logging in.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Base URL */}
          <Card>
            <CardHeader>
              <CardTitle>Base URL</CardTitle>
              <CardDescription>All API endpoints are relative to this base URL</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-4 font-mono text-sm break-all">
                {apiBaseUrl}
              </div>
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Sessions
              </CardTitle>
              <CardDescription>Manage browser automation sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* List Sessions */}
              <div>
                <h3 className="font-semibold mb-2">List Sessions</h3>
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="font-mono text-sm">
                    <span className="text-primary">GET</span> /sessions.list
                  </div>
                </div>
              </div>

              {/* Create Session */}
              <div>
                <h3 className="font-semibold mb-2">Create Session</h3>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="font-mono text-sm">
                    <span className="text-primary">POST</span> /sessions.create
                  </div>
                  <div>
                    <p className="text-sm mb-2">Request Body:</p>
                    <pre className="text-xs font-mono bg-card p-3 rounded overflow-x-auto">
{`{
  "name": "My Session",
  "browserConfig": {
    "headless": true,
    "humanize": false,
    "os": "linux",
    "block_images": false
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Delete Session */}
              <div>
                <h3 className="font-semibold mb-2">Delete Session</h3>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="font-mono text-sm">
                    <span className="text-destructive">DELETE</span> /sessions.delete
                  </div>
                  <div>
                    <p className="text-sm mb-2">Request Body:</p>
                    <pre className="text-xs font-mono bg-card p-3 rounded overflow-x-auto">
{`{
  "id": 1
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Tasks
              </CardTitle>
              <CardDescription>Execute browser automation tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* List Tasks */}
              <div>
                <h3 className="font-semibold mb-2">List Tasks</h3>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="font-mono text-sm">
                    <span className="text-primary">GET</span> /tasks.list
                  </div>
                  <div>
                    <p className="text-sm mb-2">Query Parameters:</p>
                    <pre className="text-xs font-mono bg-card p-3 rounded overflow-x-auto">
{`{
  "sessionId": 1
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Create Task */}
              <div>
                <h3 className="font-semibold mb-2">Create Task</h3>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="font-mono text-sm">
                    <span className="text-primary">POST</span> /tasks.create
                  </div>
                  <div>
                    <p className="text-sm mb-2">Available Actions:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li><code className="bg-card px-1 rounded">navigate</code> - Navigate to a URL</li>
                      <li><code className="bg-card px-1 rounded">screenshot</code> - Take a screenshot</li>
                      <li><code className="bg-card px-1 rounded">get_content</code> - Get page HTML content</li>
                      <li><code className="bg-card px-1 rounded">click</code> - Click an element</li>
                      <li><code className="bg-card px-1 rounded">fill</code> - Fill a form field</li>
                      <li><code className="bg-card px-1 rounded">evaluate</code> - Execute JavaScript</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm mb-2">Example - Navigate:</p>
                    <pre className="text-xs font-mono bg-card p-3 rounded overflow-x-auto">
{`{
  "sessionId": 1,
  "action": "navigate",
  "parameters": {
    "url": "https://example.com"
  }
}`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm mb-2">Example - Screenshot:</p>
                    <pre className="text-xs font-mono bg-card p-3 rounded overflow-x-auto">
{`{
  "sessionId": 1,
  "action": "screenshot",
  "parameters": {
    "url": "https://example.com",
    "full_page": true
  }
}`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm mb-2">Example - Click:</p>
                    <pre className="text-xs font-mono bg-card p-3 rounded overflow-x-auto">
{`{
  "sessionId": 1,
  "action": "click",
  "parameters": {
    "selector": "#submit-button"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Get Task */}
              <div>
                <h3 className="font-semibold mb-2">Get Task Status</h3>
                <div className="bg-muted rounded-lg p-4 space-y-3">
                  <div className="font-mono text-sm">
                    <span className="text-primary">GET</span> /tasks.get
                  </div>
                  <div>
                    <p className="text-sm mb-2">Query Parameters:</p>
                    <pre className="text-xs font-mono bg-card p-3 rounded overflow-x-auto">
{`{
  "id": 1
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* n8n Integration */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
            <CardHeader>
              <CardTitle>n8n Integration Example</CardTitle>
              <CardDescription>How to use these endpoints in n8n workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">1. Add HTTP Request Node</p>
                <p className="text-sm text-muted-foreground mb-3">
                  In your n8n workflow, add an HTTP Request node
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">2. Configure the Request</p>
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Method: POST</li>
                  <li>• URL: {apiBaseUrl}/tasks.create</li>
                  <li>• Authentication: Header Auth</li>
                  <li>• Header Name: Authorization</li>
                  <li>• Header Value: Bearer YOUR_API_KEY</li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">3. Set Request Body</p>
                <pre className="text-xs font-mono bg-card p-3 rounded overflow-x-auto">
{`{
  "sessionId": 1,
  "action": "navigate",
  "parameters": {
    "url": "https://example.com"
  }
}`}
                </pre>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Tip:</strong> Use n8n's built-in expressions to dynamically set parameters from previous nodes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 mt-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span>{APP_TITLE} - Browser Automation API</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

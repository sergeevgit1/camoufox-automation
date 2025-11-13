import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Clock, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useParams } from "wouter";

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const sessionId = parseInt(id || "0");
  
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"navigate" | "screenshot" | "get_content" | "click" | "fill" | "evaluate">("navigate");
  const [url, setUrl] = useState("");
  const [selector, setSelector] = useState("");
  const [value, setValue] = useState("");
  const [script, setScript] = useState("");

  const utils = trpc.useUtils();
  const { data: tasks, isLoading } = trpc.tasks.list.useQuery({ sessionId }, {
    refetchInterval: 2000, // Poll every 2 seconds for updates
  });

  const createMutation = trpc.tasks.create.useMutation({
    onSuccess: () => {
      toast.success("Task created and queued for execution");
      utils.tasks.list.invalidate();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });

  const resetForm = () => {
    setUrl("");
    setSelector("");
    setValue("");
    setScript("");
  };

  const handleCreate = () => {
    const parameters: any = {};

    if (action === "navigate" || action === "screenshot" || action === "get_content") {
      if (!url.trim()) {
        toast.error("Please enter a URL");
        return;
      }
      parameters.url = url;
    }

    if (action === "click") {
      if (!selector.trim()) {
        toast.error("Please enter a selector");
        return;
      }
      parameters.selector = selector;
      if (url.trim()) parameters.url = url;
    }

    if (action === "fill") {
      if (!selector.trim() || !value.trim()) {
        toast.error("Please enter both selector and value");
        return;
      }
      parameters.selector = selector;
      parameters.value = value;
      if (url.trim()) parameters.url = url;
    }

    if (action === "evaluate") {
      if (!script.trim()) {
        toast.error("Please enter a script");
        return;
      }
      parameters.script = script;
      if (url.trim()) parameters.url = url;
    }

    createMutation.mutate({
      sessionId,
      action,
      parameters,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case "failed":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-accent animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-primary/20 text-primary";
      case "failed":
        return "bg-destructive/20 text-destructive";
      case "running":
        return "bg-accent/20 text-accent";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Session Tasks</h1>
            <p className="text-muted-foreground">
              Manage automation tasks for this session
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Automation Task</DialogTitle>
                <DialogDescription>
                  Add a new browser automation task to this session
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="action">Action Type</Label>
                  <Select value={action} onValueChange={(v: any) => setAction(v)}>
                    <SelectTrigger id="action">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="navigate">Navigate to URL</SelectItem>
                      <SelectItem value="screenshot">Take Screenshot</SelectItem>
                      <SelectItem value="get_content">Get Page Content</SelectItem>
                      <SelectItem value="click">Click Element</SelectItem>
                      <SelectItem value="fill">Fill Form Field</SelectItem>
                      <SelectItem value="evaluate">Execute JavaScript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(action === "navigate" || action === "screenshot" || action === "get_content") && (
                  <div className="space-y-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                    />
                  </div>
                )}

                {(action === "click" || action === "fill") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="url">URL (optional)</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to use current page
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="selector">CSS Selector</Label>
                      <Input
                        id="selector"
                        placeholder="#submit-button or .form-input"
                        value={selector}
                        onChange={(e) => setSelector(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {action === "fill" && (
                  <div className="space-y-2">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      placeholder="Text to fill"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                    />
                  </div>
                )}

                {action === "evaluate" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="url">URL (optional)</Label>
                      <Input
                        id="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="script">JavaScript Code</Label>
                      <Textarea
                        id="script"
                        placeholder="document.title"
                        value={script}
                        onChange={(e) => setScript(e.target.value)}
                        rows={4}
                        className="font-mono text-sm"
                      />
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tasks List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tasks && tasks.length > 0 ? (
          <div className="space-y-4">
            {tasks.map((task) => {
              let params: any = {};
              let result: any = null;
              try {
                params = task.parameters ? JSON.parse(task.parameters) : {};
                result = task.result ? JSON.parse(task.result) : null;
              } catch {}

              return (
                <Card key={task.id} className="bg-card/50 backdrop-blur border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <h3 className="font-semibold capitalize">{task.action.replace(/_/g, " ")}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(task.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>

                    {params.url && (
                      <div className="mb-3">
                        <span className="text-sm text-muted-foreground">URL: </span>
                        <span className="text-sm font-mono">{params.url}</span>
                      </div>
                    )}

                    {params.selector && (
                      <div className="mb-3">
                        <span className="text-sm text-muted-foreground">Selector: </span>
                        <span className="text-sm font-mono">{params.selector}</span>
                      </div>
                    )}

                    {result && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border/50">
                        <p className="text-sm font-medium mb-2">Result:</p>
                        <pre className="text-xs font-mono overflow-x-auto">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    )}

                    {task.error && (
                      <div className="mt-4 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                        <p className="text-sm font-medium text-destructive mb-2">Error:</p>
                        <p className="text-sm text-destructive">{task.error}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Create your first automation task for this session
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

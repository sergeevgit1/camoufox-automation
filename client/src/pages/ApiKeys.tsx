import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Check, Copy, Key, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ApiKeys() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: apiKeys, isLoading } = trpc.apiKeys.list.useQuery();
  
  const createMutation = trpc.apiKeys.create.useMutation({
    onSuccess: (data) => {
      toast.success("API key created successfully");
      setNewKey(data.key);
      utils.apiKeys.list.invalidate();
      setName("");
    },
    onError: (error) => {
      toast.error(`Failed to create API key: ${error.message}`);
    },
  });

  const deleteMutation = trpc.apiKeys.delete.useMutation({
    onSuccess: () => {
      toast.success("API key deleted successfully");
      utils.apiKeys.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete API key: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a key name");
      return;
    }
    createMutation.mutate({ name });
  };

  const handleDelete = (id: number, keyName: string) => {
    if (confirm(`Are you sure you want to delete API key "${keyName}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const closeDialog = () => {
    setOpen(false);
    setNewKey(null);
    setName("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">API Keys</h1>
            <p className="text-muted-foreground">
              Manage API keys for n8n and external integrations
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New API Key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {newKey ? "API Key Created" : "Create API Key"}
                </DialogTitle>
                <DialogDescription>
                  {newKey 
                    ? "Copy your API key now. You won't be able to see it again!"
                    : "Create a new API key for external integrations"}
                </DialogDescription>
              </DialogHeader>
              
              {newKey ? (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Your API Key</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        value={newKey}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(newKey, 'new')}
                      >
                        {copiedKey === 'new' ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <p className="text-sm text-accent-foreground">
                      <strong>Important:</strong> Store this key securely. You won't be able to view it again after closing this dialog.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Key Name</Label>
                    <Input
                      id="name"
                      placeholder="n8n Production Workflow"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Give your API key a descriptive name to identify its purpose
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={closeDialog}>
                  {newKey ? "Close" : "Cancel"}
                </Button>
                {!newKey && (
                  <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Key"}
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* API Keys List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : apiKeys && apiKeys.length > 0 ? (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <Card key={apiKey.id} className="bg-card/50 backdrop-blur border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Key className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{apiKey.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Created {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                          {apiKey.lastUsedAt && (
                            <span>Last used {new Date(apiKey.lastUsedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                        <code className="text-xs font-mono text-muted-foreground">
                          {apiKey.key.substring(0, 8)}...{apiKey.key.substring(apiKey.key.length - 8)}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(apiKey.key, apiKey.id.toString())}
                        >
                          {copiedKey === apiKey.id.toString() ? (
                            <Check className="w-3 h-3 text-primary" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(apiKey.id, apiKey.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No API keys yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Create an API key to integrate with n8n and other automation tools
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create API Key
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Usage Guide */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5">
          <CardHeader>
            <CardTitle>Using API Keys in n8n</CardTitle>
            <CardDescription>
              Add your API key to n8n HTTP Request nodes for authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-card/80 rounded-lg p-4 border border-border/50">
              <p className="text-sm font-medium mb-2">HTTP Request Header</p>
              <code className="text-xs font-mono bg-muted px-2 py-1 rounded block">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
            <div className="text-sm text-muted-foreground space-y-2">
              <p>1. In n8n, add an HTTP Request node</p>
              <p>2. Set the URL to your API endpoint</p>
              <p>3. Add a header: <code className="bg-muted px-1 rounded">Authorization</code></p>
              <p>4. Set the value to: <code className="bg-muted px-1 rounded">Bearer YOUR_API_KEY</code></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

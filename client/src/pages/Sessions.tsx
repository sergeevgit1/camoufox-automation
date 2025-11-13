import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { Globe, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

export default function Sessions() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [headless, setHeadless] = useState(true);
  const [humanize, setHumanize] = useState(false);
  const [os, setOs] = useState<"windows" | "macos" | "linux">("linux");
  const [blockImages, setBlockImages] = useState(false);
  const [profileId, setProfileId] = useState<number | undefined>(undefined);

  const utils = trpc.useUtils();
  const { data: sessions, isLoading } = trpc.sessions.list.useQuery();
  const { data: profiles } = trpc.profiles.list.useQuery();
  
  const createMutation = trpc.sessions.create.useMutation({
    onSuccess: () => {
      toast.success("Session created successfully");
      utils.sessions.list.invalidate();
      setOpen(false);
      setName("");
      setHeadless(true);
      setHumanize(false);
      setOs("linux");
      setBlockImages(false);
      setProfileId(undefined);
    },
    onError: (error) => {
      toast.error(`Failed to create session: ${error.message}`);
    },
  });

  const deleteMutation = trpc.sessions.delete.useMutation({
    onSuccess: () => {
      toast.success("Session deleted successfully");
      utils.sessions.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete session: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a session name");
      return;
    }

    createMutation.mutate({
      name,
      profileId,
      browserConfig: {
        headless,
        humanize,
        os,
        block_images: blockImages,
      },
    });
  };

  const handleDelete = (id: number, sessionName: string) => {
    if (confirm(`Are you sure you want to delete session "${sessionName}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browser Sessions</h1>
            <p className="text-muted-foreground">
              Manage your browser automation sessions
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Browser Session</DialogTitle>
                <DialogDescription>
                  Configure a new browser automation session with custom settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Session Name</Label>
                  <Input
                    id="name"
                    placeholder="My Automation Session"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile">Browser Profile (Optional)</Label>
                  <Select value={profileId?.toString() || "none"} onValueChange={(v) => setProfileId(v === "none" ? undefined : Number(v))}>
                    <SelectTrigger id="profile">
                      <SelectValue placeholder="No profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No profile</SelectItem>
                      {profiles?.map((profile) => (
                        <SelectItem key={profile.id} value={profile.id.toString()}>
                          {profile.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select a profile to use its fingerprint and settings
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="os">Operating System</Label>
                  <Select value={os} onValueChange={(v: any) => setOs(v)}>
                    <SelectTrigger id="os">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linux">Linux</SelectItem>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="macos">macOS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Headless Mode</Label>
                    <p className="text-sm text-muted-foreground">Run browser without GUI</p>
                  </div>
                  <Switch checked={headless} onCheckedChange={setHeadless} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Humanize Cursor</Label>
                    <p className="text-sm text-muted-foreground">Simulate human-like mouse movement</p>
                  </div>
                  <Switch checked={humanize} onCheckedChange={setHumanize} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Block Images</Label>
                    <p className="text-sm text-muted-foreground">Save bandwidth by blocking images</p>
                  </div>
                  <Switch checked={blockImages} onCheckedChange={setBlockImages} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Session"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sessions Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <Card key={session.id} className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Globe className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{session.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {new Date(session.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(session.id, session.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        session.status === 'active' ? 'bg-primary/20 text-primary' :
                        session.status === 'error' ? 'bg-destructive/20 text-destructive' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {session.status}
                      </span>
                    </div>
                    
                    {session.browserConfig && (() => {
                      try {
                        const config = JSON.parse(session.browserConfig);
                        return (
                          <div className="space-y-2 pt-2 border-t border-border/50">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">OS</span>
                              <span className="font-medium">{config.os || 'auto'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Headless</span>
                              <span className="font-medium">{config.headless ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Humanize</span>
                              <span className="font-medium">{config.humanize ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                    
                    <div className="pt-3 border-t border-border/50">
                      <Button size="sm" variant="outline" className="w-full" asChild>
                        <Link href={`/sessions/${session.id}`}>View Tasks</Link>
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
              <Globe className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Create your first browser automation session to get started
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

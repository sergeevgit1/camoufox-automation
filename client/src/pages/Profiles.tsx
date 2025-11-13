import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Copy, Fingerprint, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Profiles() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [tags, setTags] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const [viewport, setViewport] = useState("1920x1080");
  const [timezone, setTimezone] = useState("Europe/Moscow");
  const [locale, setLocale] = useState("ru-RU");
  const [geolocation, setGeolocation] = useState("");
  const [proxyServer, setProxyServer] = useState("");
  const [proxyUsername, setProxyUsername] = useState("");
  const [proxyPassword, setProxyPassword] = useState("");
  const [notes, setNotes] = useState("");

  const utils = trpc.useUtils();
  const { data: profiles, isLoading } = trpc.profiles.list.useQuery();
  
  const createMutation = trpc.profiles.create.useMutation({
    onSuccess: () => {
      toast.success("Profile created successfully");
      utils.profiles.list.invalidate();
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create profile: ${error.message}`);
    },
  });

  const deleteMutation = trpc.profiles.delete.useMutation({
    onSuccess: () => {
      toast.success("Profile deleted successfully");
      utils.profiles.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete profile: ${error.message}`);
    },
  });

  const cloneMutation = trpc.profiles.clone.useMutation({
    onSuccess: () => {
      toast.success("Profile cloned successfully");
      utils.profiles.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to clone profile: ${error.message}`);
    },
  });

  const resetForm = () => {
    setName("");
    setTags("");
    setUserAgent("");
    setViewport("1920x1080");
    setTimezone("Europe/Moscow");
    setLocale("ru-RU");
    setGeolocation("");
    setProxyServer("");
    setProxyUsername("");
    setProxyPassword("");
    setNotes("");
  };

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Please enter a profile name");
      return;
    }

    const profileData: any = {
      name,
      tags: tags || undefined,
      userAgent: userAgent || undefined,
      viewport: viewport || undefined,
      timezone: timezone || undefined,
      locale: locale || undefined,
      geolocation: geolocation || undefined,
      notes: notes || undefined,
    };

    if (proxyServer) {
      profileData.proxy = {
        server: proxyServer,
        username: proxyUsername || undefined,
        password: proxyPassword || undefined,
      };
    }

    createMutation.mutate(profileData);
  };

  const handleDelete = (id: number, profileName: string) => {
    if (confirm(`Are you sure you want to delete profile "${profileName}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleClone = (id: number, originalName: string) => {
    const newName = prompt(`Enter name for cloned profile:`, `${originalName} (Copy)`);
    if (newName && newName.trim()) {
      cloneMutation.mutate({ id, name: newName.trim() });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browser Profiles</h1>
            <p className="text-muted-foreground">
              Manage browser profiles for multi-accounting (like Dolphin/GoLogin)
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Browser Profile</DialogTitle>
                <DialogDescription>
                  Configure a new browser profile with unique fingerprint and settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Profile Name *</Label>
                  <Input
                    id="name"
                    placeholder="My Profile"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="work, personal, testing"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated tags for organizing profiles
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="viewport">Viewport</Label>
                    <Input
                      id="viewport"
                      placeholder="1920x1080"
                      value={viewport}
                      onChange={(e) => setViewport(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      placeholder="Europe/Moscow"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="locale">Locale</Label>
                    <Input
                      id="locale"
                      placeholder="ru-RU"
                      value={locale}
                      onChange={(e) => setLocale(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="geolocation">Geolocation</Label>
                    <Input
                      id="geolocation"
                      placeholder="55.7558,37.6173"
                      value={geolocation}
                      onChange={(e) => setGeolocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="userAgent">User Agent</Label>
                  <Input
                    id="userAgent"
                    placeholder="Leave empty for auto-generation"
                    value={userAgent}
                    onChange={(e) => setUserAgent(e.target.value)}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">Proxy Settings (Optional)</h3>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="proxyServer">Proxy Server</Label>
                      <Input
                        id="proxyServer"
                        placeholder="http://proxy.example.com:8080"
                        value={proxyServer}
                        onChange={(e) => setProxyServer(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="proxyUsername">Username</Label>
                        <Input
                          id="proxyUsername"
                          value={proxyUsername}
                          onChange={(e) => setProxyUsername(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="proxyPassword">Password</Label>
                        <Input
                          id="proxyPassword"
                          type="password"
                          value={proxyPassword}
                          onChange={(e) => setProxyPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes about this profile..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Profile"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profiles Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profiles && profiles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => {
              let proxy: any = null;
              try {
                proxy = profile.proxy ? JSON.parse(profile.proxy) : null;
              } catch {}

              return (
                <Card key={profile.id} className="bg-card/50 backdrop-blur border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Fingerprint className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{profile.name}</CardTitle>
                          {profile.tags && (
                            <CardDescription className="text-xs">
                              {profile.tags}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleClone(profile.id, profile.name)}
                          title="Clone profile"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(profile.id, profile.name)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {profile.viewport && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Viewport</span>
                          <span className="font-mono text-xs">{profile.viewport}</span>
                        </div>
                      )}
                      {profile.timezone && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Timezone</span>
                          <span className="font-mono text-xs">{profile.timezone}</span>
                        </div>
                      )}
                      {profile.locale && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Locale</span>
                          <span className="font-mono text-xs">{profile.locale}</span>
                        </div>
                      )}
                      {proxy && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Proxy</span>
                          <span className="text-xs text-primary">Configured</span>
                        </div>
                      )}
                      {profile.lastUsedAt && (
                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-muted-foreground">Last used</span>
                          <span className="text-xs">{new Date(profile.lastUsedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Fingerprint className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No profiles yet</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Create your first browser profile with unique fingerprint for multi-accounting
              </p>
              <Button onClick={() => setOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

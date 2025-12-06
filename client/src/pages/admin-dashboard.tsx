import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Server, ShieldAlert, Activity, Trash2, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

interface AdminStats {
    users: { total: number; active: number };
    licenses: { total: number; active: number };
    system: { uptime: number; nodeVersion: string; dbSize: string };
}

interface AdminUser {
    id: string;
    username: string;
    email: string;
    isAdmin: boolean;
    subscriptionTier: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Redirect if not admin
    useEffect(() => {
        if (!authLoading && (!user || !(user as any).isAdmin)) {
            setLocation("/");
            toast({
                title: "Access Denied",
                description: "You need admin privileges to view this page.",
                variant: "destructive",
            });
        }
    }, [user, authLoading, setLocation, toast]);

    const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
        queryKey: ["/api/admin/stats"],
    });

    const { data: users, isLoading: usersLoading } = useQuery<AdminUser[]>({
        queryKey: ["/api/admin/users"],
    });

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error(await res.text());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
            toast({ title: "User deleted successfully" });
        },
        onError: (error: Error) => {
            toast({
                title: "Failed to delete user",
                description: error.message,
                variant: "destructive"
            });
        },
    });

    if (authLoading || statsLoading || usersLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!(user as any)?.isAdmin) return null;

    return (
        <div className="min-h-screen bg-background p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Master Dashboard</h1>
                    <p className="text-muted-foreground">System oversight and control center</p>
                </div>
                <Button variant="outline" onClick={() => setLocation("/")}>
                    Exit God Mode
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.users?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.users?.active || 0} active now
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Licenses</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.licenses?.active || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats?.licenses?.total || 0} total generated
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.system?.uptime ? `${Math.floor(stats.system.uptime / 3600)}h ${Math.floor((stats.system.uptime % 3600) / 60)}m` : '0h 0m'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Node {stats?.system?.nodeVersion}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Database Size</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.system?.dbSize}</div>
                        <p className="text-xs text-muted-foreground">
                            PostgreSQL
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="users" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="system">System Health</TabsTrigger>
                    <TabsTrigger value="mothership">Mothership</TabsTrigger>
                    <TabsTrigger value="logs">Audit Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Registered Users</CardTitle>
                            <CardDescription>
                                Manage user access and permissions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Subscription</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users?.map((u: any) => (
                                        <TableRow key={u.id}>
                                            <TableCell>
                                                <div className="font-medium">{u.username}</div>
                                                <div className="text-sm text-muted-foreground">{u.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                {u.isAdmin ? (
                                                    <Badge variant="default">Admin</Badge>
                                                ) : (
                                                    <Badge variant="secondary">User</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{u.subscriptionTier}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!u.isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive/90"
                                                        onClick={() => {
                                                            if (confirm("Are you sure you want to ban/delete this user?")) {
                                                                deleteUserMutation.mutate(u.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="system">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Control</CardTitle>
                            <CardDescription>
                                Manage server processes and configurations.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="space-y-1">
                                    <h4 className="font-medium">Restart Server</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Reloads all configurations and restarts the Node.js process.
                                    </p>
                                </div>
                                <Button variant="outline" disabled>
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Restart
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="mothership">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ecosystem Telemetry</CardTitle>
                            <CardDescription>
                                Live heartbeats from all connected Amoeba instances.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Waiting for telemetry signals...</p>
                                <p className="text-sm mt-2">
                                    (This tab will populate when external instances send heartbeats to /api/mothership/telemetry)
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

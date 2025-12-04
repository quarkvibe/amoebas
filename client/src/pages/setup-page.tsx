import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SetupPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { loginMutation } = useAuth();

    const handleSetup = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: "Password too weak",
                description: "Password must be at least 8 characters long.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // 1. Register the Admin User
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const error = await res.text();
                throw new Error(error);
            }

            // 2. Auto-login
            await loginMutation.mutateAsync({ username, password });

            toast({
                title: "Setup Complete!",
                description: "Welcome to your new Amoeba instance.",
            });

            setLocation("/");
        } catch (error: any) {
            toast({
                title: "Setup Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to Amoeba</h1>
                    <p className="text-muted-foreground">
                        Let's set up your admin account to get started.
                    </p>
                </div>

                <Card className="border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>Create Admin Account</CardTitle>
                        <CardDescription>
                            This will be the only account with full system access.
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSetup}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm">Confirm Password</Label>
                                <Input
                                    id="confirm"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Setting up...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="mr-2 h-4 w-4" />
                                        Complete Setup
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}

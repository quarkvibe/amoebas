import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Sparkles, Key, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function SetupPage() {
    const [step, setStep] = useState<1 | 2>(1);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const { loginMutation } = useAuth();

    const handleCreateAdmin = async (e: React.FormEvent) => {
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
                title: "Account Created",
                description: "Admin account created successfully. Now activate your license.",
            });

            setStep(2);
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

    const handleActivateCommunity = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/licenses/activate/community", {
                method: "POST",
            });

            if (!res.ok) {
                throw new Error("Failed to activate community license");
            }

            const data = await res.json();

            toast({
                title: "License Activated!",
                description: `Community License: ${data.license.key}`,
            });

            setLocation("/");
        } catch (error: any) {
            toast({
                title: "Activation Failed",
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
                        {step === 1 ? "Let's set up your admin account." : "Activate your license to continue."}
                    </p>
                </div>

                <Card className="border-border/50 shadow-lg">
                    <CardHeader>
                        <CardTitle>{step === 1 ? "Create Admin Account" : "License Activation"}</CardTitle>
                        <CardDescription>
                            {step === 1
                                ? "This will be the only account with full system access."
                                : "Choose a license type to activate your instance."}
                        </CardDescription>
                    </CardHeader>

                    {step === 1 ? (
                        <form onSubmit={handleCreateAdmin}>
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
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="mr-2 h-4 w-4" />
                                            Create Account
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    ) : (
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid gap-4">
                                <Button
                                    variant="outline"
                                    className="h-auto p-4 flex flex-col items-start gap-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                                    onClick={handleActivateCommunity}
                                    disabled={isLoading}
                                >
                                    <div className="flex items-center gap-2 font-semibold text-primary">
                                        <CheckCircle2 className="h-5 w-5" />
                                        Community License (Free)
                                    </div>
                                    <p className="text-xs text-muted-foreground text-left">
                                        For personal use, development, and small businesses.
                                        Includes all core features.
                                    </p>
                                </Button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Enterprise License Key</Label>
                                    <div className="flex gap-2">
                                        <Input placeholder="AMEOBA-V1-XXXX-..." disabled />
                                        <Button disabled variant="secondary">
                                            <Key className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">
                                        Contact sales to purchase an Enterprise license.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}

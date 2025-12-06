import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Pricing() {
    const { toast } = useToast();
    const [loading, setLoading] = useState<string | null>(null);

    const handleCheckout = async (tier: string, billingPeriod: string) => {
        try {
            setLoading(tier);
            const response = await fetch('/api/checkout/session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tier, billingPeriod }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to start checkout');
            }

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error: any) {
            toast({
                title: "Checkout Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-20 px-4">
            <div className="max-w-5xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-foreground">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Choose the plan that fits your needs. All self-hosted licenses include 1 year of updates and support.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8">

                    {/* Professional Tier */}
                    <Card className="bg-card/50 border-border backdrop-blur-sm flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">Professional</CardTitle>
                            <CardDescription>For individuals and freelancers</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <span className="text-4xl font-bold">$49</span>
                                <span className="text-muted-foreground">/year</span>
                            </div>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    Unlimited Projects
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    Bring Your Own Keys (BYOK)
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    Standard Email Support
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    1 Year of Updates
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={() => handleCheckout('pro', 'yearly')}
                                disabled={loading === 'pro'}
                            >
                                {loading === 'pro' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Get Started
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Team Tier */}
                    <Card className="bg-card border-primary shadow-lg scale-105 flex flex-col relative">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                            Most Popular
                        </div>
                        <CardHeader>
                            <CardTitle className="text-2xl">Team</CardTitle>
                            <CardDescription>For small teams and startups</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <span className="text-4xl font-bold">$149</span>
                                <span className="text-muted-foreground">/year</span>
                            </div>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    Everything in Professional
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    Priority Support
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    Team Management (Coming Soon)
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    Advanced Usage Analytics
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                size="lg"
                                variant="default"
                                onClick={() => handleCheckout('business', 'yearly')}
                                disabled={loading === 'business'}
                            >
                                {loading === 'business' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Get Team License
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Enterprise Tier */}
                    <Card className="bg-card/50 border-border backdrop-blur-sm flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl">Enterprise</CardTitle>
                            <CardDescription>For large organizations</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <div className="space-y-2">
                                <span className="text-4xl font-bold">Custom</span>
                            </div>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    Custom Integrations
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    SLA & Dedicated Support
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    On-premise Deployment Options
                                </li>
                                <li className="flex items-center gap-2">
                                    <Check className="w-4 h-4 text-primary" />
                                    Audit Logs & SSO
                                </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" size="lg" variant="outline" onClick={() => window.location.href = '/contact-sales'}>
                                Contact Sales
                            </Button>
                        </CardFooter>
                    </Card>

                </div>

                {/* FAQ or Additional Info could go here */}
                <div className="text-center pt-8">
                    <p className="text-muted-foreground">
                        Have questions? <a href="mailto:support@amoeba.com" className="text-primary hover:underline">Contact us</a>
                    </p>
                    <div className="mt-4">
                        <Button variant="link" onClick={() => window.location.href = '/'}>
                            Back to Home
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}

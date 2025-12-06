import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function ContactSales() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        company: "",
        message: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // For now, we'll just simulate a successful submission
            // In a real app, this would POST to /api/contact
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast({
                title: "Inquiry Sent",
                description: "Thanks for reaching out! Our sales team will contact you shortly.",
            });

            // Reset form
            setFormData({ name: "", email: "", company: "", message: "" });

            // Redirect back to pricing after a delay
            setTimeout(() => setLocation("/pricing"), 2000);

        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send inquiry. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-20 px-4 flex items-center justify-center">
            <Card className="w-full max-w-lg bg-card/50 border-border backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-4">
                        <Button variant="ghost" size="sm" onClick={() => setLocation("/pricing")}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Pricing
                        </Button>
                    </div>
                    <CardTitle className="text-2xl">Contact Enterprise Sales</CardTitle>
                    <CardDescription>
                        Tell us about your organization's needs and we'll build a custom plan for you.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Work Email</Label>
                            <Input
                                id="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                placeholder="john@company.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="company">Company Name</Label>
                            <Input
                                id="company"
                                required
                                value={formData.company}
                                onChange={e => setFormData({ ...formData, company: e.target.value })}
                                placeholder="Acme Corp"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">How can we help?</Label>
                            <Textarea
                                id="message"
                                required
                                value={formData.message}
                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                placeholder="We need custom integrations for..."
                                className="min-h-[100px]"
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Send Inquiry
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Play, Globe, MessageSquare, Share2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SocialAutomator() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [sourceUrl, setSourceUrl] = useState("https://jsonplaceholder.typicode.com/posts/1");
    const [platform, setPlatform] = useState("twitter");
    const [instructions, setInstructions] = useState("");
    const [result, setResult] = useState<any>(null);

    const handleRun = async (dryRun: boolean) => {
        setIsLoading(true);
        setResult(null);

        try {
            const res = await fetch('/api/social-automator/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceUrl,
                    platform,
                    instructions,
                    dryRun
                })
            });

            const data = await res.json();

            if (!data.success) throw new Error(data.error);

            setResult(data);
            toast({
                title: dryRun ? "Dry Run Complete" : "Posted Successfully",
                description: dryRun ? "Content generated but not posted." : `Content posted to ${platform}.`,
            });

        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Social Automator</h2>
                    <p className="text-muted-foreground">Turn API data into social media content automatically.</p>
                </div>
                <Badge variant="outline" className="h-8">v1.0.0</Badge>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-500" />
                            1. Source Data
                        </CardTitle>
                        <CardDescription>Where should we fetch the content from?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>API Endpoint URL</Label>
                            <Input
                                value={sourceUrl}
                                onChange={(e) => setSourceUrl(e.target.value)}
                                placeholder="https://api.example.com/data"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-purple-500" />
                            2. Target Platform
                        </CardTitle>
                        <CardDescription>Where should we post this?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Platform</Label>
                            <Select value={platform} onValueChange={setPlatform}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="twitter">Twitter / X</SelectItem>
                                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="mastodon">Mastodon</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-green-500" />
                        3. AI Instructions
                    </CardTitle>
                    <CardDescription>How should the AI process this data?</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="e.g. Summarize the key points, use 3 hashtags, and make it sound professional."
                        className="h-32"
                    />
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t p-4 bg-muted/20">
                    <Button
                        variant="outline"
                        onClick={() => handleRun(true)}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
                        Dry Run (Preview)
                    </Button>
                    <Button
                        onClick={() => handleRun(false)}
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                        Run Automation
                    </Button>
                </CardFooter>
            </Card>

            {result && (
                <Card className="border-green-500/50 bg-green-500/5">
                    <CardHeader>
                        <CardTitle>Execution Result</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Generated Content</Label>
                            <div className="p-4 bg-background rounded-md border whitespace-pre-wrap">
                                {result.generatedContent}
                            </div>
                        </div>
                        {result.dryRun && (
                            <div className="space-y-2">
                                <Label>Source Data (Preview)</Label>
                                <div className="p-4 bg-background rounded-md border font-mono text-xs overflow-auto max-h-40">
                                    {JSON.stringify(result.sourceData, null, 2)}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

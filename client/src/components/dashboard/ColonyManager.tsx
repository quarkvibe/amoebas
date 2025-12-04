import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, ExternalLink, Trash2, RefreshCw, Dna } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Instance {
    name: string;
    branch: string;
    port: number;
    status: string;
    url: string;
    created: string;
}

export default function ColonyManager() {
    const { toast } = useToast();
    const [instances, setInstances] = useState<Instance[]>([]);
    const [species, setSpecies] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSpawning, setIsSpawning] = useState(false);

    // Spawn Form
    const [selectedSpecies, setSelectedSpecies] = useState("");
    const [newInstanceName, setNewInstanceName] = useState("");

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [instRes, specRes] = await Promise.all([
                fetch('/api/colony/instances'),
                fetch('/api/colony/species')
            ]);

            const instData = await instRes.json();
            const specData = await specRes.json();

            setInstances(instData);
            setSpecies(specData);
        } catch (error) {
            console.error("Failed to fetch colony data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll for updates every 5 seconds
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSpawn = async () => {
        if (!selectedSpecies || !newInstanceName) return;

        setIsSpawning(true);
        try {
            const res = await fetch('/api/colony/spawn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    species: selectedSpecies,
                    name: newInstanceName
                })
            });

            if (!res.ok) throw new Error(await res.text());

            toast({
                title: "Spawning Initiated",
                description: `${newInstanceName} is being created. This may take a minute.`,
            });

            setNewInstanceName("");
            fetchData();

        } catch (error: any) {
            toast({
                title: "Spawn Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsSpawning(false);
        }
    };

    const handleKill = async (name: string) => {
        if (!confirm(`Are you sure you want to terminate ${name}?`)) return;

        try {
            await fetch('/api/colony/kill', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name })
            });

            toast({ title: "Terminated", description: `${name} has been removed.` });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">The Colony</h2>
                    <p className="text-muted-foreground">Manage your ecosystem of independent Amoeba instances.</p>
                </div>
                <Button variant="outline" onClick={fetchData} disabled={isLoading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Spawn Area */}
            <Card className="bg-muted/30 border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Dna className="w-5 h-5 text-primary" />
                        Spawn New Organism
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1">
                        <Label>Species (Git Branch)</Label>
                        <Select value={selectedSpecies} onValueChange={setSelectedSpecies}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select DNA..." />
                            </SelectTrigger>
                            <SelectContent>
                                {species.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 flex-1">
                        <Label>Organism Name</Label>
                        <Input
                            value={newInstanceName}
                            onChange={(e) => setNewInstanceName(e.target.value)}
                            placeholder="e.g. marketing-bot-1"
                        />
                    </div>
                    <Button onClick={handleSpawn} disabled={isSpawning || !selectedSpecies || !newInstanceName}>
                        {isSpawning ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Spawn
                    </Button>
                </CardContent>
            </Card>

            {/* Instance Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {instances.map((instance) => (
                    <Card key={instance.name} className="overflow-hidden">
                        <div className={`h-2 w-full ${instance.status === 'running' ? 'bg-green-500' :
                                instance.status === 'error' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                            }`} />
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{instance.name}</CardTitle>
                                <Badge variant={instance.status === 'running' ? 'default' : 'secondary'}>
                                    {instance.status}
                                </Badge>
                            </div>
                            <CardDescription className="font-mono text-xs">
                                {instance.branch} • Port {instance.port}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                Created: {new Date(instance.created).toLocaleDateString()}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between bg-muted/20 p-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-100"
                                onClick={() => handleKill(instance.name)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Terminate
                            </Button>
                            <Button
                                size="sm"
                                disabled={instance.status !== 'running'}
                                onClick={() => window.open(instance.url, '_blank')}
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Dashboard
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {instances.length === 0 && !isLoading && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Dna className="w-6 h-6" />
                        </div>
                        <p>The petri dish is empty. Spawn your first organism!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

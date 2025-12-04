import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, Terminal, FileCode, Shield, Server, FolderTree, Info, Play, AlertTriangle } from "lucide-react";
import { FileTree } from "./FileTree";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Highlight, themes } from "prism-react-renderer";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, AlertCircle, Download, CheckCircle2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Message {
    role: 'user' | 'assistant' | 'tool';
    content: string;
    toolName?: string;
    timestamp: Date;
}

export default function CodeModification() {
    const { toast } = useToast();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [organelles, setOrganelles] = useState<any[]>([]);
    const [registryItems, setRegistryItems] = useState<any[]>([]);
    const [mcpServers, setMcpServers] = useState<any[]>([]);
    const [fileTree, setFileTree] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState("files");
    const [installingId, setInstallingId] = useState<string | null>(null);
    const [isDryRun, setIsDryRun] = useState(false);
    const [showOrganelleDialog, setShowOrganelleDialog] = useState(false);
    const [organelleName, setOrganelleName] = useState("");
    const [organelleDesc, setOrganelleDesc] = useState("");
    const [selectedFile, setSelectedFile] = useState<string | null>(null); // Added for handleSubmit context
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchOrganelles();
        fetchRegistry();
        fetchMcpServers();
        fetchFileTree();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchOrganelles = async () => {
        try {
            const res = await fetch('/api/organelles');
            if (res.ok) {
                const data = await res.json();
                setOrganelles(data);
            }
        } catch (error) {
            console.error("Failed to fetch organelles", error);
        }
    };

    const fetchRegistry = async () => {
        try {
            const res = await fetch('/api/registry');
            if (res.ok) {
                const data = await res.json();
                setRegistryItems(data);
            }
        } catch (error) {
            console.error("Failed to fetch registry", error);
        }
    };

    const fetchMcpServers = async () => {
        try {
            const res = await fetch('/api/mcp');
            if (res.ok) {
                const data = await res.json();
                setMcpServers(data.tools || []);
            }
        } catch (error) {
            console.error("Failed to fetch MCP servers", error);
        }
    };

    const fetchFileTree = async () => {
        try {
            const res = await fetch('/api/files');
            if (res.ok) {
                const data = await res.json();
                setFileTree(data);
            }
        } catch (error) {
            console.error("Failed to fetch file tree", error);
            toast({
                title: "Error",
                description: "Failed to load file tree",
                variant: "destructive",
            });
        }
    };

    const apiRequest = async (method: string, url: string, body?: any) => {
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) {
            throw new Error(`API request failed: ${res.statusText}`);
        }
        return res;
    };

    const handleFileSelect = async (path: string) => {
        setSelectedFile(path); // Set selected file
        setInput(prev => prev + (prev ? " " : "") + `Read file: ${path}`);
    };

    const renderMessageContent = (content: string) => {
        // Simple regex to detect code blocks ```language ... ```
        const parts = content.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            if (part.startsWith('```') && part.endsWith('```')) {
                const match = part.match(/```(\w+)?\n([\s\S]*?)```/);
                const language = match ? match[1] || 'tsx' : 'tsx';
                const code = match ? match[2] : part.slice(3, -3);

                return (
                    <div key={index} className="my-4 rounded-md overflow-hidden border border-border/50 shadow-sm">
                        <div className="bg-muted px-4 py-1 text-xs font-mono text-muted-foreground border-b border-border/50 flex justify-between">
                            <span>{language}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 text-[10px] px-2"
                                onClick={() => navigator.clipboard.writeText(code)}
                            >
                                Copy
                            </Button>
                        </div>
                        <Highlight
                            theme={themes.vsDark}
                            code={code.trim()}
                            language={language}
                        >
                            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                <pre style={style} className="p-4 overflow-x-auto text-sm font-mono">
                                    {tokens.map((line, i) => (
                                        <div key={i} {...getLineProps({ line })}>
                                            <span className="inline-block w-8 select-none opacity-30 text-right mr-4 text-xs">{i + 1}</span>
                                            {line.map((token, key) => (
                                                <span key={key} {...getTokenProps({ token })} />
                                            ))}
                                        </div>
                                    ))}
                                </pre>
                            )}
                        </Highlight>
                    </div>
                );
            }
            return <span key={index} className="whitespace-pre-wrap">{part}</span>;
        });
    };

    const handleCreateOrganelle = async () => {
        if (!organelleName || !organelleDesc) return;

        const command = `Create a new organelle named '${organelleName}' that is ${organelleDesc}`;
        setInput(command);
        setShowOrganelleDialog(false);
        setOrganelleName("");
        setOrganelleDesc("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
        setIsLoading(true);

        try {
            // Add dry run context if enabled
            const messageToSend = isDryRun
                ? `[DRY RUN MODE - DO NOT EXECUTE CHANGES, ONLY PROPOSE] ${userMessage}`
                : userMessage;

            const response = await apiRequest('POST', '/api/agent/coding', {
                message: messageToSend,
                context: {
                    currentFile: selectedFile,
                    isDryRun
                }
            });

            const data = await response.json();

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.message,
                toolResults: data.toolResults,
                timestamp: new Date()
            }]);

            // Refresh file tree if changes were made (and not dry run)
            if (!isDryRun && data.toolResults?.some((t: any) => t.name === 'write_file' || t.name === 'create_organelle')) {
                fetchFileTree();
            }

        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Error",
                description: "Failed to process request",
                variant: "destructive"
            });
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I encountered an error processing your request. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteOrganelle = async (name: string) => {
        try {
            const res = await apiRequest('DELETE', `/api/organelles/${name}`);
            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Organelle Deleted",
                    description: data.message,
                });
                fetchOrganelles();
                fetchFileTree();
            } else {
                toast({
                    title: "Error",
                    description: data.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Failed to delete organelle", error);
            toast({
                title: "Error",
                description: "Failed to delete organelle",
                variant: "destructive",
            });
        }
    };

    const handleInstallOrganelle = async (id: string, name: string) => {
        setInstallingId(id);
        toast({
            title: "Installing Organelle",
            description: `Starting installation of ${name}... this may take a moment.`,
        });

        try {
            const res = await apiRequest('POST', '/api/registry/install', { id });
            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Installation Complete",
                    description: data.message,
                });
                fetchOrganelles();
                fetchFileTree();
            } else {
                toast({
                    title: "Installation Failed",
                    description: data.message,
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Failed to install organelle", error);
            toast({
                title: "Error",
                description: "Failed to install organelle",
                variant: "destructive",
            });
        } finally {
            setInstallingId(null);
        }
    };

    return (
        <div className="h-[calc(100vh-120px)]">
            <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
                <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                    <div className="h-full flex flex-col bg-card">
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <FolderTree className="w-4 h-4" />
                                Explorer
                            </h3>
                            <Button variant="ghost" size="icon" onClick={fetchFileTree} title="Refresh">
                                <Loader2 className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                        <Tabs defaultValue="files" className="flex-1 flex flex-col">
                            <TabsList className="w-full justify-start px-4 pt-2 bg-transparent border-b rounded-none h-auto">
                                <TabsTrigger value="files" className="data-[state=active]:bg-muted">Files</TabsTrigger>
                                <TabsTrigger value="organelles" className="data-[state=active]:bg-muted">Organelles</TabsTrigger>
                                <TabsTrigger value="registry" className="data-[state=active]:bg-muted">Registry</TabsTrigger>
                                <TabsTrigger value="mcp" className="data-[state=active]:bg-muted">MCP</TabsTrigger>
                                <TabsTrigger value="info" className="data-[state=active]:bg-muted">Info</TabsTrigger>
                            </TabsList>
                            <TabsContent value="files" className="flex-1 p-0 m-0">
                                <FileTree
                                    data={fileTree}
                                    onSelect={handleFileSelect}
                                    className="p-2"
                                />
                            </TabsContent>
                            <TabsContent value="organelles" className="flex-1 p-4 m-0">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Server className="w-4 h-4" />
                                        <span>{organelles.length} organelles active</span>
                                    </div>
                                    <ScrollArea className="h-[calc(100vh-300px)]">
                                        <div className="space-y-2">
                                            {organelles.map((org, i) => (
                                                <div key={i} className="flex items-center justify-between p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-medium text-sm">{org.name}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">{org.description || "No description"}</span>
                                                    </div>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Organelle?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will permanently delete the <strong>{org.name}</strong> organelle and all associated files. This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteOrganelle(org.name)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            ))}
                                            {organelles.length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground text-sm">
                                                    No organelles found.
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </TabsContent>
                            <TabsContent value="registry" className="flex-1 p-4 m-0">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Download className="w-4 h-4" />
                                        <span>{registryItems.length} available to install</span>
                                    </div>
                                    <ScrollArea className="h-[calc(100vh-300px)]">
                                        <div className="space-y-3">
                                            {registryItems.map((item, i) => {
                                                const isInstalled = organelles.some(o => o.name.toLowerCase() === item.name.toLowerCase().replace(/\s+/g, ''));
                                                return (
                                                    <div key={i} className="p-3 rounded-md border bg-card hover:bg-accent/50 transition-colors">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                                                                    {/* Dynamic icon rendering could go here, using fallback for now */}
                                                                    <Download className="w-4 h-4" />
                                                                </div>
                                                                <span className="font-medium text-sm">{item.name}</span>
                                                            </div>
                                                            {isInstalled ? (
                                                                <Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">
                                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Installed
                                                                </Badge>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    className="h-7 text-xs"
                                                                    onClick={() => handleInstallOrganelle(item.id, item.name)}
                                                                    disabled={!!installingId}
                                                                >
                                                                    {installingId === item.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                                                    ) : (
                                                                        <Download className="w-3 h-3 mr-1" />
                                                                    )}
                                                                    {installingId === item.id ? "Installing..." : "Install"}
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </TabsContent>
                            <TabsContent value="mcp" className="flex-1 p-4 m-0">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Server className="w-4 h-4" />
                                        <span>{mcpServers.length} tools available</span>
                                    </div>
                                    <ScrollArea className="h-[calc(100vh-300px)]">
                                        {/* MCP Tools list could go here */}
                                        <div className="text-xs text-muted-foreground">
                                            MCP tools will appear here.
                                        </div>
                                    </ScrollArea>
                                </div>
                            </TabsContent>
                            <TabsContent value="info" className="flex-1 p-4 m-0">
                                <div className="text-sm text-muted-foreground space-y-2">
                                    <p>Amoeba Builder v2.0</p>
                                    <p>Connected to local environment.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={75}>
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b bg-card">
                            <h2 className="font-semibold flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-primary" />
                                Builder Chat
                            </h2>
                        </div>
                        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                            <div className="space-y-4 max-w-3xl mx-auto">
                                {messages.length === 0 && (
                                    <div className="text-center text-muted-foreground py-12">
                                        <Terminal className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Ready to build. Select a file or describe what you want to create.</p>
                                    </div>
                                )}
                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-lg p-4 shadow-sm ${msg.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : msg.role === 'tool'
                                                    ? 'bg-muted font-mono text-xs border'
                                                    : 'bg-card border'
                                                }`}
                                        >
                                            {msg.toolName && (
                                                <div className="flex items-center gap-1 mb-2 opacity-70 border-b pb-1 border-border/50">
                                                    <Server className="w-3 h-3" />
                                                    <span className="font-semibold">Executed: {msg.toolName}</span>
                                                </div>
                                            )}
                                            <div className="text-sm leading-relaxed">
                                                {renderMessageContent(msg.content)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-card border rounded-lg p-4 shadow-sm">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-4 bg-card border-t space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="dry-run"
                                        checked={isDryRun}
                                        onCheckedChange={setIsDryRun}
                                    />
                                    <Label htmlFor="dry-run" className="text-xs flex items-center gap-1 cursor-pointer">
                                        {isDryRun ? <Shield className="w-3 h-3 text-green-500" /> : <Play className="w-3 h-3 text-orange-500" />}
                                        {isDryRun ? "Dry Run Active" : "Live Mode"}
                                    </Label>
                                </div>

                                <Dialog open={showOrganelleDialog} onOpenChange={setShowOrganelleDialog}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            <Server className="w-3 h-3 mr-1" />
                                            New Organelle
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Create New Organelle</DialogTitle>
                                            <DialogDescription>
                                                Scaffold a new microservice with UI and API components.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Organelle Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="e.g. Notes, Tasks, Calendar"
                                                    value={organelleName}
                                                    onChange={(e) => setOrganelleName(e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="desc">Description</Label>
                                                <Input
                                                    id="desc"
                                                    placeholder="What does this organelle do?"
                                                    value={organelleDesc}
                                                    onChange={(e) => setOrganelleDesc(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setShowOrganelleDialog(false)}>Cancel</Button>
                                            <Button onClick={handleCreateOrganelle} disabled={!organelleName || !organelleDesc}>
                                                Generate Command
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto flex gap-2">
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Describe what you want to build..."
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                <Button type="submit" disabled={isLoading}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

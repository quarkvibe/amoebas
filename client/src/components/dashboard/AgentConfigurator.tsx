import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Save, RefreshCw, Wand2, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Agent Configurator
 * Visual editor for AI agent system prompts, tools, and behavior
 * 
 * Users can tweak:
 * - System prompts (the AI's "personality" and instructions)
 * - Tool availability (which tools the AI can use)
 * - Model parameters (temperature, max tokens, etc.)
 * - Safety settings (output control pipeline)
 * - Auto-approval rules
 * 
 * All changes are immediately visible and testable
 */

export default function AgentConfigurator() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("instructions");
  const [previewMode, setPreviewMode] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Agent Configuration</h2>
          <p className="text-muted-foreground mt-1">
            Configure your AI agent's behavior, tools, and output controls
          </p>
        </div>
        
        <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
          <Eye className="h-4 w-4 mr-2" />
          {previewMode ? 'Edit Mode' : 'Preview Mode'}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="instructions">📝 Instructions</TabsTrigger>
          <TabsTrigger value="tools">🔧 Tools</TabsTrigger>
          <TabsTrigger value="parameters">⚙️ Parameters</TabsTrigger>
          <TabsTrigger value="safety">🛡️ Safety</TabsTrigger>
        </TabsList>
        
        <TabsContent value="instructions" className="mt-6">
          <SystemPromptEditor />
        </TabsContent>
        
        <TabsContent value="tools" className="mt-6">
          <ToolsConfiguration />
        </TabsContent>
        
        <TabsContent value="parameters" className="mt-6">
          <ModelParameters />
        </TabsContent>
        
        <TabsContent value="safety" className="mt-6">
          <SafetyConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// SYSTEM PROMPT EDITOR
// ============================================================================

function SystemPromptEditor() {
  const { toast } = useToast();
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  
  const saveMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('PUT', '/api/agent/system-prompt', { prompt });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "System prompt updated successfully" });
    },
  });
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>System Prompt</CardTitle>
          <CardDescription>
            This defines your AI agent's personality, capabilities, and guidelines
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="h-[400px] font-mono text-sm"
            placeholder="You are a helpful AI assistant..."
          />
          
          <div className="flex gap-2">
            <Button onClick={() => saveMutation.mutate(systemPrompt)}>
              <Save className="h-4 w-4 mr-2" />
              Save System Prompt
            </Button>
            <Button variant="outline" onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
          </div>
          
          <Alert>
            <AlertDescription>
              <strong>Tips:</strong> Be specific about the AI's role, tone, and constraints. Include examples of good output.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      {/* Template Defaults */}
      <Card>
        <CardHeader>
          <CardTitle>Template Defaults</CardTitle>
          <CardDescription>Default settings for new templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default AI Model</Label>
            <Select defaultValue="gpt-4o-mini">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fast & Cheap)</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o (Balanced)</SelectItem>
                <SelectItem value="gpt-4">GPT-4 (Most Capable)</SelectItem>
                <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label>Default Output Format</Label>
            <Select defaultValue="text">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Plain Text</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// TOOLS CONFIGURATION
// ============================================================================

function ToolsConfiguration() {
  const { toast } = useToast();
  
  const tools = [
    { id: 'fetch_rss_feed', name: 'Fetch RSS Feed', description: 'Get articles from RSS feeds', enabled: true },
    { id: 'fetch_webpage', name: 'Fetch Webpage', description: 'Read web content', enabled: true },
    { id: 'extract_text', name: 'Extract Text', description: 'Parse HTML to clean text', enabled: true },
    { id: 'fetch_json', name: 'Fetch JSON API', description: 'Call JSON APIs', enabled: true },
    { id: 'extract_data', name: 'Extract Data', description: 'JSONPath extraction', enabled: true },
    { id: 'optimize_for_sms', name: 'Optimize for SMS', description: 'Format for text messages', enabled: true },
    { id: 'optimize_for_voice', name: 'Optimize for Voice', description: 'Format for TTS', enabled: true },
  ];
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Available AI Tools</CardTitle>
          <CardDescription>
            Control which tools the AI agent can use. All tools are native (no extra API keys required).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">{tool.name}</div>
                  <div className="text-sm text-muted-foreground">{tool.description}</div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={tool.enabled ? "default" : "secondary"}>
                    {tool.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch checked={tool.enabled} />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Tool Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tool Limits</CardTitle>
          <CardDescription>Control AI tool usage to manage costs</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Max Tool Calls Per Generation</Label>
            <Input type="number" defaultValue={10} min={1} max={50} />
            <p className="text-xs text-muted-foreground mt-1">
              Prevents infinite loops and controls token costs
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// MODEL PARAMETERS
// ============================================================================

function ModelParameters() {
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Default Model Parameters</CardTitle>
          <CardDescription>
            These settings apply to all new templates (can be overridden per template)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>Temperature: {temperature[0].toFixed(2)}</Label>
            <Slider
              value={temperature}
              onValueChange={setTemperature}
              min={0}
              max={2}
              step={0.1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Lower = more focused and deterministic | Higher = more creative and random
            </p>
          </div>
          
          <div>
            <Label>Max Tokens: {maxTokens[0]}</Label>
            <Slider
              value={maxTokens}
              onValueChange={setMaxTokens}
              min={100}
              max={4000}
              step={100}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Maximum length of generated content (~1 token = 0.75 words)
            </p>
          </div>
          
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Parameters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// SAFETY CONFIGURATION
// ============================================================================

function SafetyConfiguration() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Output Pipeline Controls</CardTitle>
          <CardDescription>
            Configure quality checks and review workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Quality Scoring</div>
              <div className="text-sm text-muted-foreground">Score all output 0-100</div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Enable Safety Checks</div>
              <div className="text-sm text-muted-foreground">Detect PII, harmful content</div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto-Cleanup Output</div>
              <div className="text-sm text-muted-foreground">Remove formatting artifacts</div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Require Human Review</div>
              <div className="text-sm text-muted-foreground">All content goes to review queue</div>
            </div>
            <Switch />
          </div>
          
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Safety Settings
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Auto-Approval Rules</CardTitle>
          <CardDescription>
            Automatically approve high-quality content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Minimum Quality Score for Auto-Approval</Label>
            <Input type="number" defaultValue={80} min={0} max={100} />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto-Approve if No Safety Flags</div>
              <div className="text-sm text-muted-foreground">Only approve safe content</div>
            </div>
            <Switch defaultChecked />
          </div>
          
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Auto-Approval Rules
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// DEFAULT SYSTEM PROMPT
// ============================================================================

const DEFAULT_SYSTEM_PROMPT = `You are an AI assistant integrated into the Amoeba content generation platform.

Your capabilities:
- Generate high-quality content based on user templates
- Fetch data from RSS feeds, web pages, and APIs using available tools
- Optimize content for different delivery channels (email, SMS, voice)
- Follow user instructions precisely

Guidelines:
1. Be concise and focused
2. Use tools when you need external data
3. Format output according to the specified outputFormat
4. Avoid placeholders like TODO or FIXME in final output
5. Be factual and accurate
6. Respect length constraints specified in templates

Available tools:
- fetch_rss_feed: Get articles from RSS feeds
- fetch_webpage: Read web content
- extract_text: Parse HTML
- fetch_json: Call JSON APIs
- extract_data: Extract specific data from JSON
- optimize_for_sms: Format for SMS delivery
- optimize_for_voice: Format for voice/TTS delivery

When generating content:
- Use provided variables from the template
- Maintain the requested tone and style
- Follow any specific instructions in the user prompt
- If you need data, use the appropriate tool
- Optimize for the target delivery channel

Your output will be processed through a quality pipeline that checks for safety, quality, and compliance.
Aim for high-quality, error-free content.`;


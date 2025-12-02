import { storage } from '../storage';
import { organelleService } from './organelleService';
import { mcpService } from './mcpService';
import { activityMonitor } from './activityMonitor';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

// Specialized agent for coding tasks
export class CodingAgentService {
    private openai: OpenAI;
    private systemPrompt = `You are the Amoeba Builder, a specialized AI coding agent.
Your goal is to help users modify and extend the Amoeba platform.

PRINCIPLES:
1. "Anything Microservice": Everything in Amoeba is an "Organelle" (a microservice).
2. "Easily Modified": You have FULL ACCESS to the codebase. Use it responsibly.
3. "Safety": While you have full access, try not to break the build.

Your capabilities:
1. Read/Write ANY file in the project.
2. Create new Organelles (Microservices) using the 'create_organelle' tool.
3. Use MCP tools.

When writing code:
- Follow the existing project structure.
- Use TypeScript.
- If creating a new feature, consider making it a new Organelle.
`;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "",
        });
    }

    /**
     * Process a coding request
     */
    async processRequest(userId: string, message: string, context?: any) {
        try {
            activityMonitor.logActivity('info', `🏗️ Builder processing: "${message}"`);

            // 1. Get available tools (File Ops + MCP)
            const tools = await this.getTools(userId);

            // 2. Call AI
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o", // Use a capable model for coding
                messages: [
                    { role: "system", content: this.systemPrompt },
                    { role: "user", content: message }
                ],
                tools,
                tool_choice: "auto",
            });

            const choice = response.choices[0];
            const toolCalls = choice.message.tool_calls;

            if (toolCalls && toolCalls.length > 0) {
                const results = [];

                for (const toolCall of toolCalls) {
                    // Cast to any to avoid strict type checking issues with OpenAI types
                    const tc = toolCall as any;
                    const functionName = tc.function.name;
                    const args = JSON.parse(tc.function.arguments);

                    activityMonitor.logActivity('info', `🏗️ Builder executing: ${functionName}`);

                    let result;
                    try {
                        // Check for Dry Run
                        if (context?.isDryRun && (functionName === 'write_file' || functionName === 'create_organelle' || functionName.startsWith('mcp_'))) {
                            result = {
                                success: true,
                                message: `[DRY RUN] Would execute '${functionName}' with args: ${JSON.stringify(args)}`
                            };
                            activityMonitor.logActivity('info', `🛡️ Dry Run: Skipped execution of ${functionName}`);
                        } else {
                            if (functionName.startsWith('mcp_')) {
                                // Handle MCP tool
                                const mcpToolName = functionName.replace('mcp_', '');
                                result = await mcpService.executeTool(userId, mcpToolName, args);
                            } else if (functionName === 'create_organelle') {
                                // Handle specialized scaffolding tool
                                result = await this.createOrganelle(args);
                            } else {
                                // Handle native file tool
                                result = await this.executeNativeTool(userId, functionName, args);
                            }
                        }
                    } catch (error: any) {
                        result = { error: error.message };
                        activityMonitor.logError(error, `Builder Tool: ${functionName}`);
                    }

                    results.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: functionName,
                        content: JSON.stringify(result),
                    });
                }

                // 3. Follow up with tool results
                const followUp = await this.openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        { role: "system", content: this.systemPrompt },
                        { role: "user", content: message },
                        choice.message,
                        ...results as any
                    ],
                });

                return {
                    message: followUp.choices[0].message.content,
                    toolResults: results,
                };
            }

            return {
                message: choice.message.content,
            };

        } catch (error: any) {
            activityMonitor.logError(error, 'Coding Agent');
            throw error;
        }
    }

    /**
     * Get tools definition
     */
    private async getTools(userId: string) {
        // Native File Tools
        const nativeTools: any[] = [
            {
                type: "function",
                function: {
                    name: "list_files",
                    description: "List files in a directory",
                    parameters: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "Relative path to list" },
                        },
                        required: ["path"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "read_file",
                    description: "Read file content",
                    parameters: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "Relative path to read" },
                        },
                        required: ["path"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "write_file",
                    description: "Write content to a file",
                    parameters: {
                        type: "object",
                        properties: {
                            path: { type: "string", description: "Relative path to write" },
                            content: { type: "string", description: "Content to write" },
                        },
                        required: ["path", "content"],
                    },
                },
            },
            {
                type: "function",
                function: {
                    name: "create_organelle",
                    description: "Scaffold a new Organelle (Microservice) with UI and API",
                    parameters: {
                        type: "object",
                        properties: {
                            name: { type: "string", description: "Name of the organelle (e.g., 'notes', 'tasks')" },
                            description: { type: "string", description: "Description of what it does" },
                        },
                        required: ["name", "description"],
                    },
                },
            },
        ];

        // MCP Tools
        const mcpTools = await mcpService.getTools(userId);

        // Prefix MCP tools to avoid collisions
        const formattedMcpTools = mcpTools.map((tool: any) => ({
            type: "function",
            function: {
                ...tool.function,
                name: `mcp_${tool.function.name}`,
            },
        }));

        return [...nativeTools, ...formattedMcpTools];
    }

    /**
     * Scaffold a new Organelle
     */
    private async createOrganelle(args: { name: string, description: string }) {
        const { name, description } = args;
        const pascalName = name.charAt(0).toUpperCase() + name.slice(1);
        const camelName = name.toLowerCase();

        // 1. Create Server Route
        const routeContent = `
import { Router } from 'express';

const router = Router();

// ${description}
router.get('/', (req, res) => {
    res.json({ message: 'Hello from ${pascalName} Organelle!' });
});

export default router;
`;
        const routePath = `server/routes/${camelName}.ts`;
        await fs.mkdir(path.dirname(path.join(process.cwd(), routePath)), { recursive: true });
        await fs.writeFile(path.join(process.cwd(), routePath), routeContent);

        // 2. Create Client Component
        const componentContent = `
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ${pascalName}() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>${pascalName}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>${description}</p>
                <p className="text-muted-foreground mt-2">This is a newly generated Organelle.</p>
            </CardContent>
        </Card>
    );
}
`;
        const componentPath = `client/src/components/organelles/${pascalName}.tsx`;
        await fs.mkdir(path.dirname(path.join(process.cwd(), componentPath)), { recursive: true });
        await fs.writeFile(path.join(process.cwd(), componentPath), componentContent);

        return {
            success: true,
            message: `Created Organelle '${name}'.\nFiles created:\n- ${routePath}\n- ${componentPath}\n\nYou still need to register the route in server/routes.ts and the component in the Dashboard.`
        };
    }

    /**
     * Execute native file tools
     */
    private async executeNativeTool(userId: string, name: string, args: any) {
        const { path: filePath, content } = args;

        // Validate Access
        const operation = name === 'write_file' ? 'write' : 'read';
        const hasAccess = await organelleService.validateAccess(userId, filePath, operation);

        if (!hasAccess) {
            throw new Error(`Access denied: ${filePath} is not in an allowed Organelle.`);
        }

        const fullPath = path.join(process.cwd(), filePath);

        switch (name) {
            case 'list_files':
                const files = await fs.readdir(fullPath);
                return { files };

            case 'read_file':
                const fileContent = await fs.readFile(fullPath, 'utf-8');
                return { content: fileContent };

            case 'write_file':
                // Ensure directory exists
                await fs.mkdir(path.dirname(fullPath), { recursive: true });
                await fs.writeFile(fullPath, content);
                return { success: true, message: `File written to ${filePath}` };

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
}

export const codingAgentService = new CodingAgentService();

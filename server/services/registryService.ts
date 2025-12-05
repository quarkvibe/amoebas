import { codingAgentService } from "./codingAgentService";

export interface RegistryItem {
    id: string;
    name: string;
    description: string;
    icon: string;
    scaffoldPrompt: string;
}

const OFFICIAL_REGISTRY: RegistryItem[] = [
    {
        id: "kanban-board",
        name: "Kanban Board",
        description: "A drag-and-drop project management board with columns for Todo, In Progress, and Done.",
        icon: "Kanban",
        scaffoldPrompt: "Create a new organelle named 'Kanban'. It should be a Kanban board with columns for 'Todo', 'In Progress', and 'Done'. Allow users to add tasks to columns and drag them between columns. Use 'dnd-kit' or similar for drag and drop if possible, or simple state management if not. Persist tasks to the database."
    },
    {
        id: "notes-app",
        name: "Notes App",
        description: "A simple markdown-enabled note-taking application.",
        icon: "Notebook",
        scaffoldPrompt: "Create a new organelle named 'Notes'. It should allow users to create, edit, and delete notes. Notes should have a title and content. Support markdown rendering for the content. Persist notes to the database."
    },
    {
        id: "chat-room",
        name: "Team Chat",
        description: "A real-time chat room for team collaboration.",
        icon: "MessageSquare",
        scaffoldPrompt: "Create a new organelle named 'TeamChat'. It should be a real-time chat interface. Users can send messages which are broadcast to all connected users. Persist message history to the database."
    },
    {
        id: "social-automator",
        name: "Social Automator",
        description: "Automate your social media presence with AI-generated content and scheduling.",
        icon: "Share2",
        scaffoldPrompt: "Create a new organelle named 'SocialAutomator'. It should allow users to connect social accounts, generate posts using AI, and schedule them."
    }
];

export class RegistryService {

    async getRegistry(): Promise<RegistryItem[]> {
        return OFFICIAL_REGISTRY;
    }

    async installOrganelle(id: string, userId: string): Promise<{ success: boolean; message: string }> {
        const item = OFFICIAL_REGISTRY.find(i => i.id === id);
        if (!item) {
            throw new Error(`Organelle with ID '${id}' not found in registry.`);
        }

        // Trigger the coding agent to scaffold the organelle
        // We wrap this in a "user request" format for the agent
        const prompt = `INSTALLATION REQUEST: ${item.scaffoldPrompt}`;

        try {
            await codingAgentService.processRequest(userId, prompt, {
                isDryRun: false, // Force execution
                currentFile: null
            });

            return { success: true, message: `Successfully installed ${item.name}` };
        } catch (error: any) {
            console.error(`Failed to install organelle ${item.name}:`, error);
            return { success: false, message: `Installation failed: ${error.message}` };
        }
    }
}

export const registryService = new RegistryService();

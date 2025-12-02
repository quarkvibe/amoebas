import fs from 'fs/promises';
import path from 'path';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
}

export class FileService {
    private rootDir: string;
    private excludePatterns: string[];

    constructor(rootDir: string) {
        this.rootDir = path.resolve(rootDir);
        this.excludePatterns = [
            'node_modules',
            '.git',
            '.DS_Store',
            'dist',
            '.env',
            '.env.local',
            'package-lock.json'
        ];
    }

    async getFileTree(dirPath: string = ''): Promise<FileNode[]> {
        const fullPath = path.join(this.rootDir, dirPath);

        // Security check to prevent directory traversal out of root
        if (!fullPath.startsWith(this.rootDir)) {
            throw new Error('Access denied');
        }

        try {
            const entries = await fs.readdir(fullPath, { withFileTypes: true });
            const nodes: FileNode[] = [];

            for (const entry of entries) {
                if (this.excludePatterns.includes(entry.name)) continue;

                const relativePath = path.join(dirPath, entry.name);

                if (entry.isDirectory()) {
                    // Recursively get children
                    const children = await this.getFileTree(relativePath);
                    nodes.push({
                        name: entry.name,
                        path: '/' + relativePath, // Ensure absolute-like path for UI
                        type: 'directory',
                        children
                    });
                } else {
                    nodes.push({
                        name: entry.name,
                        path: '/' + relativePath,
                        type: 'file'
                    });
                }
            }

            // Sort directories first, then files
            return nodes.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'directory' ? -1 : 1;
            });
        } catch (error) {
            console.error(`Error reading directory ${fullPath}:`, error);
            return [];
        }
    }

    async readFile(filePath: string): Promise<string> {
        // Remove leading slash if present
        const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
        const fullPath = path.join(this.rootDir, normalizedPath);

        if (!fullPath.startsWith(this.rootDir)) {
            throw new Error('Access denied');
        }

        try {
            return await fs.readFile(fullPath, 'utf-8');
        } catch (error) {
            throw new Error(`Failed to read file: ${error}`);
        }
    }
}

export const fileService = new FileService(process.cwd());

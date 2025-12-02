
import { useState } from "react";
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    File,
    FileCode,
    FileJson,
    FileType,
    Image as ImageIcon,
    LayoutTemplate
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
}

interface FileTreeProps {
    data: FileNode[];
    onSelect: (path: string) => void;
    className?: string;
}

const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'ts':
        case 'tsx':
        case 'js':
        case 'jsx':
            return <FileCode className="h-4 w-4 text-blue-500" />;
        case 'json':
            return <FileJson className="h-4 w-4 text-yellow-500" />;
        case 'css':
        case 'scss':
            return <FileType className="h-4 w-4 text-pink-500" />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'svg':
            return <ImageIcon className="h-4 w-4 text-purple-500" />;
        case 'md':
            return <LayoutTemplate className="h-4 w-4 text-gray-500" />;
        default:
            return <File className="h-4 w-4 text-gray-400" />;
    }
};

function TreeNode({ node, level, onSelect }: { node: FileNode; level: number; onSelect: (path: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.type === 'directory') {
            setIsOpen(!isOpen);
        } else {
            onSelect(node.path);
        }
    };

    return (
        <div>
            <div
                className={cn(
                    "flex items-center py-1 px-2 hover:bg-accent/50 cursor-pointer text-sm select-none transition-colors",
                    level > 0 && "ml-4"
                )}
                onClick={handleClick}
            >
                <span className="mr-1 opacity-70">
                    {node.type === 'directory' ? (
                        hasChildren ? (
                            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                        ) : (
                            <div className="w-4" />
                        )
                    ) : (
                        <div className="w-4" />
                    )}
                </span>

                <span className="mr-2">
                    {node.type === 'directory' ? (
                        isOpen ? <FolderOpen className="h-4 w-4 text-blue-400" /> : <Folder className="h-4 w-4 text-blue-400" />
                    ) : (
                        getFileIcon(node.name)
                    )}
                </span>

                <span className="truncate">{node.name}</span>
            </div>
            {isOpen && hasChildren && (
                <div>
                    {node.children!.map((child) => (
                        <TreeNode key={child.path} node={child} level={level + 1} onSelect={onSelect} />
                    ))}
                </div>
            )}
        </div>
    );
}

export function FileTree({ data, onSelect, className }: FileTreeProps) {
    return (
        <ScrollArea className={cn("h-full", className)}>
            <div className="pb-4">
                {data.map((node) => (
                    <TreeNode key={node.path} node={node} level={0} onSelect={onSelect} />
                ))}
            </div>
        </ScrollArea>
    );
}

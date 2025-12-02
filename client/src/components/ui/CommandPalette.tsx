import * as React from "react";
import { Command } from "cmdk";
import { useLocation } from "wouter";
import {
    LayoutDashboard,
    Settings,
    FileCode,
    Moon,
    Sun,
    LogOut,
    Search,
    Command as CommandIcon
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const [, setLocation] = useLocation();
    const { logout } = useAuth();
    const [theme, setTheme] = React.useState<"light" | "dark">("dark"); // Default to dark for now, should sync with real theme context

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    // Toggle theme helper (placeholder for real theme context)
    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        document.documentElement.classList.toggle("dark");
    };

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[640px] bg-popover/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden z-50 p-0 animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="flex items-center border-b border-border px-4 py-3">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <Command.Input
                    placeholder="Type a command or search..."
                    className="flex-1 bg-transparent outline-none text-lg placeholder:text-muted-foreground text-foreground"
                />
                <div className="flex items-center gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </div>
            </div>

            <Command.List className="max-h-[300px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                    No results found.
                </Command.Empty>

                <Command.Group heading="Navigation" className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-2">
                    <Command.Item
                        onSelect={() => runCommand(() => setLocation("/"))}
                        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground transition-colors"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => setLocation("/dashboard/settings"))}
                        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground transition-colors"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => setLocation("/dashboard/builder"))}
                        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground transition-colors"
                    >
                        <FileCode className="w-4 h-4" />
                        <span>Amoeba Builder</span>
                    </Command.Item>
                </Command.Group>

                <Command.Separator className="h-px bg-border mx-2 my-2" />

                <Command.Group heading="Actions" className="text-xs font-medium text-muted-foreground px-2 py-1.5 mb-2">
                    <Command.Item
                        onSelect={() => runCommand(toggleTheme)}
                        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground transition-colors"
                    >
                        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span>Toggle Theme</span>
                    </Command.Item>
                    <Command.Item
                        onSelect={() => runCommand(() => logout())}
                        className="flex items-center gap-2 px-2 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 cursor-pointer aria-selected:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                    </Command.Item>
                </Command.Group>
            </Command.List>
        </Command.Dialog>
    );
}

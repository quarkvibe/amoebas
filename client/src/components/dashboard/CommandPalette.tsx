import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
    Calculator,
    Calendar,
    CreditCard,
    Settings,
    Smile,
    User,
    Search,
    FileCode,
    Terminal,
    LayoutDashboard,
    LogOut,
    Plus,
    Zap,
    Server
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const { user, logout } = useAuth();
    const [, setLocation] = useLocation();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="p-0 overflow-hidden shadow-2xl max-w-2xl">
                <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                    <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Command.Input
                            placeholder="Type a command or search..."
                            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                        <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>

                        <Command.Group heading="Navigation">
                            <Command.Item onSelect={() => runCommand(() => setLocation("/"))}>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => setLocation("/generation"))}>
                                <Zap className="mr-2 h-4 w-4" />
                                <span>Content Generation</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => setLocation("/schedule"))}>
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Schedule</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => setLocation("/files"))}>
                                <FileCode className="mr-2 h-4 w-4" />
                                <span>File Manager</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => setLocation("/settings"))}>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="AI Tools">
                            <Command.Item onSelect={() => runCommand(() => setLocation("/code-modification"))}>
                                <Terminal className="mr-2 h-4 w-4" />
                                <span>Amoeba Builder</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => setLocation("/agent-config"))}>
                                <Smile className="mr-2 h-4 w-4" />
                                <span>Agent Configuration</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="System">
                            <Command.Item onSelect={() => runCommand(() => setLocation("/health"))}>
                                <Server className="mr-2 h-4 w-4" />
                                <span>System Health</span>
                            </Command.Item>
                            <Command.Item onSelect={() => runCommand(() => setLocation("/license"))}>
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>License & Billing</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Separator className="my-1 h-px bg-border" />

                        <Command.Group heading="Account">
                            <Command.Item onSelect={() => runCommand(() => logout())}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>
                </Command>
            </DialogContent>
        </Dialog>
    );
}

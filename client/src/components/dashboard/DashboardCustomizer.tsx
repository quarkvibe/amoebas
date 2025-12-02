import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings2, RotateCcw } from "lucide-react";
import { DashboardLayout, WidgetId } from "@/hooks/useDashboardLayout";

interface DashboardCustomizerProps {
    layout: DashboardLayout;
    onToggle: (id: WidgetId) => void;
    onReset: () => void;
}

export function DashboardCustomizer({ layout, onToggle, onReset }: DashboardCustomizerProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Settings2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Customize Layout</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Dashboard Layout</DialogTitle>
                    <DialogDescription>
                        Toggle visibility of dashboard widgets. Changes are saved automatically.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="metrics" className="flex flex-col space-y-1">
                            <span>Metrics Grid</span>
                            <span className="font-normal text-xs text-muted-foreground">Key performance indicators</span>
                        </Label>
                        <Switch
                            id="metrics"
                            checked={layout.metrics}
                            onCheckedChange={() => onToggle('metrics')}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="terminal" className="flex flex-col space-y-1">
                            <span>Terminal Console</span>
                            <span className="font-normal text-xs text-muted-foreground">System logs and command output</span>
                        </Label>
                        <Switch
                            id="terminal"
                            checked={layout.terminal}
                            onCheckedChange={() => onToggle('terminal')}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="activity" className="flex flex-col space-y-1">
                            <span>Activity Feed</span>
                            <span className="font-normal text-xs text-muted-foreground">Real-time system events</span>
                        </Label>
                        <Switch
                            id="activity"
                            checked={layout.activity}
                            onCheckedChange={() => onToggle('activity')}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="status" className="flex flex-col space-y-1">
                            <span>System Status</span>
                            <span className="font-normal text-xs text-muted-foreground">Service health indicators</span>
                        </Label>
                        <Switch
                            id="status"
                            checked={layout.status}
                            onCheckedChange={() => onToggle('status')}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="charts" className="flex flex-col space-y-1">
                            <span>Hourly Charts</span>
                            <span className="font-normal text-xs text-muted-foreground">Generation volume trends</span>
                        </Label>
                        <Switch
                            id="charts"
                            checked={layout.charts}
                            onCheckedChange={() => onToggle('charts')}
                        />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="queue" className="flex flex-col space-y-1">
                            <span>Queue Status</span>
                            <span className="font-normal text-xs text-muted-foreground">Job processing queue</span>
                        </Label>
                        <Switch
                            id="queue"
                            checked={layout.queue}
                            onCheckedChange={() => onToggle('queue')}
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={onReset} className="gap-2 text-muted-foreground hover:text-foreground">
                        <RotateCcw className="w-3 h-3" />
                        Reset to Default
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

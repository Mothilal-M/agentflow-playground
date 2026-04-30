import PropTypes from "prop-types"
import { Cpu, Server, Activity, Database, Zap, Layers, RefreshCw } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

/**
 * ViewMemorySheet component displays memory usage information
 * @returns {object} Sheet component displaying memory usage information
 */
const ViewMemorySheet = ({ isOpen, onClose }) => {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] px-0 pb-0 flex flex-col">
        <div className="px-6 pb-4">
            <SheetHeader>
            <div className="flex items-center justify-between">
                <div>
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        <Activity className="h-6 w-6 text-indigo-500" />
                        System Profiler
                    </SheetTitle>
                    <SheetDescription className="mt-1">
                        Real-time application memory and performance metrics
                    </SheetDescription>
                </div>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 px-3 py-1">
                    <span className="flex items-center gap-1.5 font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live
                    </span>
                </Badge>
            </div>
            </SheetHeader>
        </div>

        <Separator />
        
        <ScrollArea className="flex-1 px-6 pt-4 pb-12">
            <div className="space-y-6">
                
                {/* Core Memory Card */}
                <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Cpu className="h-32 w-32" />
                    </div>
                    <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                            <Server className="h-4 w-4" />
                            Heap Memory Allocation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5 pb-5">
                        <div className="flex justify-between items-end mb-2">
                            <div className="flex gap-2 items-baseline">
                                <span className="text-4xl font-extrabold tracking-tight">45.2</span>
                                <span className="text-sm text-muted-foreground font-medium">MB</span>
                            </div>
                            <div className="text-sm font-medium text-muted-foreground">
                                / 128 MB Limit
                            </div>
                        </div>
                        
                        <div className="mt-4 relative w-full h-3 bg-secondary rounded-full overflow-hidden">
                            <div 
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-1000 ease-in-out" 
                                style={{ width: "35.3%" }}
                            />
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-muted-foreground mt-3 font-medium">
                            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-indigo-500"></span> Used (35.3%)</span>
                            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-secondary"></span> Available (64.7%)</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Grid of Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="shadow-sm border-border/60 hover:border-primary/20 transition-colors">
                        <CardContent className="p-5 flex flex-col gap-3">
                            <div className="bg-primary/10 w-fit p-2.5 rounded-lg">
                                <Layers className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Active Components</p>
                                <p className="text-2xl font-bold mt-1">12</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/60 hover:border-violet-500/20 transition-colors">
                        <CardContent className="p-5 flex flex-col gap-3">
                            <div className="bg-violet-500/10 w-fit p-2.5 rounded-lg">
                                <Database className="h-5 w-5 text-violet-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Store Size</p>
                                <p className="text-2xl font-bold mt-1">1.4 <span className="text-sm font-normal text-muted-foreground">KB</span></p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/60 hover:border-amber-500/20 transition-colors">
                        <CardContent className="p-5 flex flex-col gap-3">
                            <div className="bg-amber-500/10 w-fit p-2.5 rounded-lg">
                                <Zap className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Re-renders/sec</p>
                                <p className="text-2xl font-bold mt-1">0.8</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/60 hover:border-emerald-500/20 transition-colors">
                        <CardContent className="p-5 flex flex-col gap-3">
                            <div className="bg-emerald-500/10 w-fit p-2.5 rounded-lg">
                                <RefreshCw className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                                <p className="text-2xl font-bold mt-1">45<span className="text-sm font-normal text-muted-foreground">m</span> 12<span className="text-sm font-normal text-muted-foreground">s</span></p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Application State Log (Mock) */}
                <Card className="shadow-sm border-border/60">
                    <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                        <CardTitle className="text-sm font-semibold flex justify-between items-center">
                            Event Log
                            <Badge variant="secondary" className="text-xs font-mono">Verbose</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="h-[200px] bg-slate-950 font-mono text-xs p-4 overflow-y-auto text-emerald-400/80 rounded-b-lg flex flex-col gap-2">
                            <div className="flex gap-3"><span className="text-slate-500">14:02:45.102</span><span>[INFO] Graph layout updated</span></div>
                            <div className="flex gap-3"><span className="text-slate-500">14:02:46.331</span><span className="text-blue-400">[DEBUG] State synchronization complete</span></div>
                            <div className="flex gap-3"><span className="text-slate-500">14:03:01.884</span><span>[INFO] User interaction: Node select</span></div>
                            <div className="flex gap-3"><span className="text-slate-500">14:03:02.120</span><span className="text-amber-400">[WARN] High execution duration in calculateLayout (24ms)</span></div>
                            <div className="flex gap-3"><span className="text-slate-500">14:03:05.441</span><span>[INFO] Auto-save triggered successfully</span></div>
                            <div className="flex gap-3"><span className="text-slate-500">14:03:10.992</span><span className="text-blue-400">[DEBUG] Cache hit on user_preferences</span></div>
                            <span className="inline-block w-2 h-4 bg-emerald-400/80 animate-pulse mt-1"></span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

ViewMemorySheet.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
}

export default ViewMemorySheet

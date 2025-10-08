/* eslint-disable max-lines-per-function */
import {
  CheckCircle,
  ExternalLink,
  MessageSquare,
  Settings,
  XCircle,
  Zap,
} from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import AnimatedGradientText from "@/components/magicui/animated-gradient-text"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { queryClient } from "@/lib/queryClient"
import ct from "@constants"

const DashboardUI = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const store = useSelector((st) => st[ct.store.SETTINGS_STORE])

  const { verification, name, backendUrl } = store

  const handleClearSettings = () => {
    dispatch({ type: "RESET" })
    queryClient.clear()
  }

  const handleStartChat = () => {
    navigate("/chat")
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Animated Header Section */}
        <div className="text-center space-y-6">
          <AnimatedGradientText
            className="text-4xl font-bold"
            speed={2}
            colorFrom="#6366f1"
            colorTo="#8b5cf6"
          >
            PyAgenity Playground
          </AnimatedGradientText>
          <div className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            PyAgenity is a Python framework for building, orchestrating, and
            managing multi-agent systems. Designed for flexibility and
            scalability, PyAgenity enables developers to create intelligent
            agents that collaborate, communicate, and solve complex tasks
            together.
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-indigo-600 border-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:border-indigo-400 dark:hover:bg-indigo-950"
            >
              <a
                href="https://10xhub.github.io/PyAgenity/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Documentation
              </a>
            </Button>
          </div>
        </div>

        {/* Verification Status Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Setup Status
              </CardTitle>
              {verification.isVerified && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSettings}
                  className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-950"
                >
                  RESET
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-4">
              {verification.isVerified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    Verified
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  >
                    Not Verified
                  </Badge>
                </>
              )}
            </div>
            {!verification.isVerified && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Setup Required
                    </h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Your agent is not configured yet. Click the{" "}
                      <span className="font-medium">Settings</span> icon in the
                      header to configure your backend connection and get
                      started.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {verification.isVerified && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Agent Name
                    </div>
                    <div className="p-3 bg-muted rounded-md font-mono text-sm">
                      {name || "Not set"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-muted-foreground">
                      Backend URL
                    </div>
                    <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                      {backendUrl || "Not set"}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button onClick={handleStartChat} className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                  <Button variant="outline" disabled className="flex-1">
                    <Zap className="h-4 w-4 mr-2" />
                    Realtime Chat
                    <span className="ml-2 text-xs opacity-70">
                      (Coming Soon)
                    </span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardUI

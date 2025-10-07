import { Card, CardContent } from "@/components/ui/card"

const QuickAction = () => {
  return (
    <div>
      <div className="w-full max-w-3xl">
        <div className="flex items-center mb-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
          <span className="text-sm font-medium text-foreground">Resources</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                <span className="text-sm font-medium text-foreground group-hover:text-blue-600">
                  PyAgenity Documentation
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                <span className="text-sm font-medium text-foreground group-hover:text-blue-600">
                  PyAgenity Deployment Guide
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                <span className="text-sm font-medium text-foreground group-hover:text-blue-600">
                  PyAgenity Prompt Library
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default QuickAction

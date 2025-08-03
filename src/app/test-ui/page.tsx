import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function TestUIPage() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-4xl font-bold gradient-text">UI组件测试页面</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover-card">
          <CardHeader>
            <CardTitle>测试卡片</CardTitle>
            <CardDescription>这是一个测试卡片组件</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="测试输入框" />
            <div className="flex gap-2">
              <Button>主要按钮</Button>
              <Button variant="outline">次要按钮</Button>
            </div>
            <div className="flex gap-2">
              <Badge>默认</Badge>
              <Badge variant="secondary">次要</Badge>
              <Badge variant="destructive">危险</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>玻璃态效果</CardTitle>
            <CardDescription>带有毛玻璃效果的卡片</CardDescription>
          </CardHeader>
          <CardContent>
            <p>这个卡片展示了玻璃态效果</p>
          </CardContent>
        </Card>

        <Card className="float-animation">
          <CardHeader>
            <CardTitle>浮动动画</CardTitle>
            <CardDescription>带有浮动动画效果</CardDescription>
          </CardHeader>
          <CardContent>
            <p>这个卡片会上下浮动</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            关于TravelSync
          </h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              TravelSync是一个基于AI技术的智能旅行规划平台，致力于为用户提供个性化、智能化的旅行规划服务。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              我们的使命
            </h2>
            <p className="text-gray-600 mb-6">
              让每个人都能轻松规划出完美的旅行计划，通过AI技术降低旅行规划的门槛，提升旅行体验的质量。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              核心功能
            </h2>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
              <li>AI智能行程规划</li>
              <li>3D地图可视化</li>
              <li>实时协作编辑</li>
              <li>数据分析报表</li>
              <li>智能推荐系统</li>
              <li>移动端支持</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              技术栈
            </h2>
            <p className="text-gray-600 mb-4">
              我们使用最新的技术栈来确保平台的性能和用户体验：
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="font-medium text-gray-900">Next.js 14</div>
                <div className="text-sm text-gray-600">前端框架</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="font-medium text-gray-900">TypeScript</div>
                <div className="text-sm text-gray-600">类型安全</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="font-medium text-gray-900">OpenAI GPT-4</div>
                <div className="text-sm text-gray-600">AI引擎</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="font-medium text-gray-900">Mapbox</div>
                <div className="text-sm text-gray-600">地图服务</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="font-medium text-gray-900">Prisma</div>
                <div className="text-sm text-gray-600">数据库ORM</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="font-medium text-gray-900">Socket.io</div>
                <div className="text-sm text-gray-600">实时通信</div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              联系我们
            </h2>
            <p className="text-gray-600">
              如果您有任何问题或建议，欢迎通过以下方式联系我们：
            </p>
            <div className="mt-4 space-y-2 text-gray-600">
              <p>邮箱: support@travelsync.com</p>
              <p>网站: https://travelsync.com</p>
              <p>微信: TravelSync官方</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

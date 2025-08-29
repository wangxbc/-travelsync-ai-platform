export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">隐私政策</h1>

          <div className="prose max-w-none text-gray-600">
            <p className="text-sm text-gray-500 mb-6">
              最后更新时间：2024年1月1日
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. 信息收集
            </h2>
            <p className="mb-4">我们收集以下类型的信息：</p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>账户信息：邮箱地址、用户名、头像等</li>
              <li>旅行偏好：目的地、预算、兴趣爱好等</li>
              <li>使用数据：页面访问、功能使用等</li>
              <li>设备信息：IP地址、浏览器类型等</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. 信息使用
            </h2>
            <p className="mb-4">我们使用收集的信息用于：</p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>提供个性化的旅行规划服务</li>
              <li>改进产品功能和用户体验</li>
              <li>发送服务通知和更新</li>
              <li>防止欺诈和滥用行为</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. 信息共享
            </h2>
            <p className="mb-4">
              我们不会向第三方出售、交易或转让您的个人信息，除非：
            </p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>获得您的明确同意</li>
              <li>法律法规要求</li>
              <li>保护我们的权利和安全</li>
              <li>与可信的服务提供商合作</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. 数据安全
            </h2>
            <p className="mb-6">
              我们采用行业标准的安全措施来保护您的个人信息，包括加密传输、访问控制、定期安全审计等。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Cookie使用
            </h2>
            <p className="mb-6">
              我们使用Cookie来改善用户体验、分析网站使用情况。您可以通过浏览器设置管理Cookie偏好。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. 用户权利
            </h2>
            <p className="mb-4">您有权：</p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>访问和更新您的个人信息</li>
              <li>删除您的账户和数据</li>
              <li>限制信息处理</li>
              <li>数据可携带性</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. 儿童隐私
            </h2>
            <p className="mb-6">
              我们的服务不面向13岁以下的儿童。如果我们发现收集了儿童的个人信息，将立即删除。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. 政策更新
            </h2>
            <p className="mb-6">
              我们可能会不时更新此隐私政策。重大变更将通过邮件或网站通知您。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. 联系我们
            </h2>
            <p className="mb-4">如果您对此隐私政策有任何问题，请联系我们：</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>邮箱: privacy@travelsync.com</p>
              <p>地址: 河南省 郑州市 金水区 金水区xxx路xxx号</p>
              <p>电话: 400-xxx-xxxx</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

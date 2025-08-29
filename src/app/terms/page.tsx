export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">服务条款</h1>

          <div className="prose max-w-none text-gray-600">
            <p className="text-sm text-gray-500 mb-6">
              最后更新时间：2024年1月1日
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. 服务说明
            </h2>
            <p className="mb-6">
              TravelSync是一个AI驱动的智能旅行规划平台，为用户提供个性化的旅行规划服务。通过使用我们的服务，您同意遵守这些条款。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. 用户账户
            </h2>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>您必须提供准确、完整的注册信息</li>
              <li>您有责任保护账户安全</li>
              <li>一个邮箱地址只能注册一个账户</li>
              <li>禁止创建虚假账户或冒充他人</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. 使用规范
            </h2>
            <p className="mb-4">使用我们的服务时，您不得：</p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>违反任何适用的法律法规</li>
              <li>侵犯他人的知识产权</li>
              <li>发布有害、威胁、诽谤的内容</li>
              <li>干扰或破坏服务的正常运行</li>
              <li>尝试未经授权访问系统</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. 知识产权
            </h2>
            <p className="mb-6">
              TravelSync平台的所有内容、功能和服务均受版权、商标和其他知识产权法律保护。未经许可，您不得复制、修改、分发或创建衍生作品。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. 用户内容
            </h2>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>您保留对自己创建内容的所有权</li>
              <li>您授予我们使用、存储、展示您内容的许可</li>
              <li>您承诺您的内容不侵犯第三方权利</li>
              <li>我们有权删除违规内容</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. 服务可用性
            </h2>
            <p className="mb-6">
              我们努力保持服务的可用性，但不保证服务不会中断。我们可能会因维护、升级或其他原因暂停服务。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. 免责声明
            </h2>
            <p className="mb-6">
              我们的服务按"现状"提供。我们不对服务的准确性、可靠性或适用性做出保证。您使用服务的风险由您自己承担。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. 责任限制
            </h2>
            <p className="mb-6">
              在法律允许的最大范围内，我们不对任何间接、偶然、特殊或后果性损害承担责任。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. 服务变更
            </h2>
            <p className="mb-6">
              我们保留随时修改、暂停或终止服务的权利。重大变更将提前通知用户。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. 争议解决
            </h2>
            <p className="mb-6">
              因使用本服务产生的争议，应首先通过友好协商解决。协商不成的，提交至北京市朝阳区人民法院解决。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. 条款修改
            </h2>
            <p className="mb-6">
              我们可能会不时更新这些条款。继续使用服务即表示您接受修改后的条款。
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. 联系信息
            </h2>
            <p className="mb-4">如果您对这些条款有任何问题，请联系我们：</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>邮箱: legal@travelsync.com</p>
              <p>地址: 北京市朝阳区xxx路xxx号</p>
              <p>电话: 400-xxx-xxxx</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

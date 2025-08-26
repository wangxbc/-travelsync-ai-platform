"use client";

import { useSession } from "next-auth/react";
import { useCurrentUser } from "@/lib/hooks/useAuth";
import { useState } from "react";

export default function DebugAvatarPage() {
  const { data: session, update } = useSession();
  const { user } = useCurrentUser();
  const [debugInfo, setDebugInfo] = useState("");

  const testSessionUpdate = async () => {
    try {
      setDebugInfo("开始测试session更新...");
      
      // 调用session更新
      const updatedSession = await update();
      
      setDebugInfo(prev => prev + "\n✅ Session更新成功");
      console.log("更新后的session:", updatedSession);
    } catch (error) {
      setDebugInfo(prev => prev + "\n❌ Session更新失败: " + error);
      console.error("Session更新失败:", error);
    }
  };

  const testUserAPI = async () => {
    try {
      setDebugInfo(prev => prev + "\n开始测试用户API...");
      
      const response = await fetch("/api/user/profile");
      const result = await response.json();
      
      setDebugInfo(prev => prev + "\n✅ 用户API响应: " + JSON.stringify(result, null, 2));
    } catch (error) {
      setDebugInfo(prev => prev + "\n❌ 用户API失败: " + error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">头像调试页面</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Session信息 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">NextAuth Session</h2>
            <div className="space-y-2">
              <p><strong>用户ID:</strong> {session?.user?.id || "未获取"}</p>
              <p><strong>用户邮箱:</strong> {session?.user?.email || "未获取"}</p>
              <p><strong>用户姓名:</strong> {session?.user?.name || "未获取"}</p>
              <p><strong>用户头像:</strong> {session?.user?.image || "未设置"}</p>
            </div>
            
            {session?.user?.image && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Session头像预览:</p>
                <img 
                  src={session.user.image} 
                  alt="Session头像" 
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    console.error("Session头像加载失败:", session.user.image);
                  }}
                />
              </div>
            )}
          </div>

          {/* Hook用户信息 */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">useCurrentUser Hook</h2>
            <div className="space-y-2">
              <p><strong>用户ID:</strong> {user?.id || "未获取"}</p>
              <p><strong>用户邮箱:</strong> {user?.email || "未获取"}</p>
              <p><strong>用户姓名:</strong> {user?.name || "未获取"}</p>
              <p><strong>用户头像:</strong> {user?.image || "未设置"}</p>
            </div>
            
            {user?.image && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Hook头像预览:</p>
                <img 
                  src={user.image} 
                  alt="Hook头像" 
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    console.error("Hook头像加载失败:", user.image);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 测试按钮 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">测试功能</h2>
          <div className="space-x-4">
            <button
              onClick={testSessionUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              测试Session更新
            </button>
            <button
              onClick={testUserAPI}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              测试用户API
            </button>
          </div>
        </div>

        {/* 调试信息 */}
        {debugInfo && (
          <div className="mt-8 bg-gray-900 text-green-400 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">调试信息</h2>
            <pre className="whitespace-pre-wrap text-sm">{debugInfo}</pre>
          </div>
        )}

        {/* 原始数据 */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">原始数据</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Session原始数据:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(session, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold">User Hook原始数据:</h3>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
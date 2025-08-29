"use client";

import { useState, useEffect } from "react";
import { getUserManager } from "@/lib/auth";

export default function DebugPage() {
  const [userManager, setUserManager] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [localStorageData, setLocalStorageData] = useState<any>({});
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    // 确保在客户端运行
    if (typeof window !== "undefined") {
      const manager = getUserManager();
      setUserManager(manager);
      setUsers(manager.getUsers());

      // 获取localStorage数据
      const keys = Object.keys(localStorage);
      const data: any = {};
      keys.forEach((key) => {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || "null");
        } catch {
          data[key] = localStorage.getItem(key);
        }
      });
      setLocalStorageData(data);
    }
  }, []);

  const handleRecoverUsers = () => {
    if (userManager) {
      const recoveredUsers = userManager.recoverUsers();
      setUsers(recoveredUsers);
      setMessage(`已恢复 ${recoveredUsers.length} 个用户`);

      // 刷新localStorage数据
      const keys = Object.keys(localStorage);
      const data: any = {};
      keys.forEach((key) => {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || "null");
        } catch {
          data[key] = localStorage.getItem(key);
        }
      });
      setLocalStorageData(data);
    }
  };

  const handleDebugLocalStorage = () => {
    if (userManager) {
      userManager.debugLocalStorage();
      setMessage("调试信息已输出到控制台");
    }
  };

  const handleResetUsers = () => {
    if (userManager && confirm("确定要重置所有用户数据吗？")) {
      userManager.resetUsers();
      setUsers([]);
      setMessage("已重置用户数据");
    }
  };

  const handleCreateDefaultUsers = () => {
    if (userManager) {
      userManager.createDefaultUsers();
      setUsers(userManager.getUsers());
      setMessage("已创建默认用户");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">
          用户数据调试工具
        </h1>

        {message && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={handleRecoverUsers}
            className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            恢复用户数据
          </button>
          <button
            onClick={handleDebugLocalStorage}
            className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            调试localStorage
          </button>
          <button
            onClick={handleCreateDefaultUsers}
            className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            创建默认用户
          </button>
          <button
            onClick={handleResetUsers}
            className="p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            重置用户数据
          </button>
        </div>

        {/* 当前用户列表 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            当前用户列表
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {users.length === 0 ? (
              <div className="p-8 text-center text-slate-500">暂无用户数据</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        姓名
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        邮箱
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        创建时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {users.map((user, index) => (
                      <tr key={user.id || index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {new Date(user.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.recovered ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              已恢复
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              正常
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* localStorage数据 */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            localStorage数据
          </h2>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="space-y-4">
              {Object.keys(localStorageData).length === 0 ? (
                <p className="text-slate-500">暂无localStorage数据</p>
              ) : (
                Object.entries(localStorageData).map(([key, value]) => (
                  <div
                    key={key}
                    className="border-b border-slate-200 pb-4 last:border-b-0"
                  >
                    <h3 className="font-medium text-slate-900 mb-2">{key}</h3>
                    <pre className="text-sm text-slate-600 bg-slate-50 p-3 rounded overflow-x-auto">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

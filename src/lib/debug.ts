import { getUserManager } from "./auth";

// 全局调试对象
declare global {
  interface Window {
    TravelSyncDebug: {
      recoverUsers: () => void;
      showUsers: () => void;
      createDefaultUsers: () => void;
      resetUsers: () => void;
      debugLocalStorage: () => void;
      showHelp: () => void;
    };
  }
}

// 恢复用户数据
export const recoverUsers = () => {
  try {
    const userManager = getUserManager();
    const recoveredUsers = userManager.recoverUsers();
    console.log("🔄 用户恢复结果:", recoveredUsers);
    console.log("📝 恢复的用户数量:", recoveredUsers.length);

    if (recoveredUsers.length > 0) {
      console.log("✅ 用户数据已恢复！");
      console.log("🔑 恢复的用户默认密码为: 123456");
      console.log("💡 现在可以尝试登录了");
    } else {
      console.log("❌ 没有找到可恢复的用户数据");
      console.log("💡 建议创建默认用户");
    }
  } catch (error) {
    console.error("❌ 恢复用户数据失败:", error);
  }
};

// 显示当前用户列表
export const showUsers = () => {
  try {
    const userManager = getUserManager();
    const users = userManager.getUsers();

    console.log("当前用户列表:");
    if (users.length === 0) {
      console.log("  暂无用户数据");
    } else {
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email})`);
        if (user.recovered) {
          console.log(`     状态: 已恢复 (密码: 123456)`);
        } else {
          console.log(`     状态: 正常`);
        }
      });
    }
  } catch (error) {
    console.error("❌ 获取用户列表失败:", error);
  }
};

// 创建默认用户
export const createDefaultUsers = () => {
  try {
    const userManager = getUserManager();
    userManager.createDefaultUsers();
    const users = userManager.getUsers();

    console.log("✅ 默认用户已创建！");
    console.log("📝 可用账户:");
    users.forEach((user) => {
      console.log(`  📧 ${user.email} / 🔑 ${user.password}`);
    });
    console.log("💡 现在可以使用这些账户登录了");
  } catch (error) {
    console.error("❌ 创建默认用户失败:", error);
  }
};

// 重置用户数据
export const resetUsers = () => {
  try {
    const userManager = getUserManager();
    userManager.resetUsers();
    console.log("🗑️ 所有用户数据已重置");
    console.log("⚠️ 请谨慎使用此功能");
  } catch (error) {
    console.error("❌ 重置用户数据失败:", error);
  }
};

// 调试localStorage
export const debugLocalStorage = () => {
  try {
    const userManager = getUserManager();
    userManager.debugLocalStorage();
  } catch (error) {
    console.error("❌ 调试localStorage失败:", error);
  }
};

// 显示帮助信息
export const showHelp = () => {
  console.log("🔧 TravelSync 调试工具使用说明:");
  console.log("");
  console.log("📋 可用命令:");
  console.log("  TravelSyncDebug.recoverUsers()     - 恢复用户数据");
  console.log("  TravelSyncDebug.showUsers()        - 显示用户列表");
  console.log("  TravelSyncDebug.createDefaultUsers() - 创建默认用户");
  console.log("  TravelSyncDebug.resetUsers()       - 重置用户数据");
  console.log("  TravelSyncDebug.debugLocalStorage() - 调试localStorage");
  console.log("  TravelSyncDebug.showHelp()         - 显示此帮助");
  console.log("");
  console.log("💡 推荐步骤:");
  console.log("  1. 先运行 TravelSyncDebug.recoverUsers()");
  console.log("  2. 然后运行 TravelSyncDebug.showUsers() 查看结果");
  console.log("  3. 如果没有用户，运行 TravelSyncDebug.createDefaultUsers()");
  console.log("  4. 使用显示的账户信息登录");
};

// 初始化全局调试对象
export const initDebugTools = () => {
  if (typeof window !== "undefined") {
    window.TravelSyncDebug = {
      recoverUsers,
      showUsers,
      createDefaultUsers,
      resetUsers,
      debugLocalStorage,
      showHelp,
    };

    console.log("🔧 TravelSync 调试工具已加载！");
    console.log("💡 输入 TravelSyncDebug.showHelp() 查看使用说明");
  }
};

// 自动初始化
if (typeof window !== "undefined") {
  initDebugTools();
}

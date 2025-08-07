import { NextRequest, NextResponse } from "next/server";
import { databaseUserManager } from "@/lib/database-auth";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // 验证输入数据
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "请填写所有必填字段" },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度至少为6位" }, { status: 400 });
    }

    // 检查用户是否已存在
    const existingUser = await databaseUserManager.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 });
    }

    // 创建新用户
    const newUser = await databaseUserManager.createUser({
      name,
      email,
      password,
    });

    console.log("用户注册成功:", newUser.email);
    console.log("用户注册成功:", newUser.email);

    return NextResponse.json(
      {
        message: "注册成功",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

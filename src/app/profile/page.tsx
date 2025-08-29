"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireAuth, useCurrentUser } from "@/lib/hooks/useAuth";
import { userOperations, itineraryOperations } from "@/lib/api/database";
import { useSession } from "next-auth/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Itinerary } from "@/types";

export default function ProfilePage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user } = useCurrentUser();
  const { update } = useSession();

  // 状态管理
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    avatar: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    birthday: "",
    gender: "",
    occupation: "",
    interests: "",
    socialLinks: {
      weibo: "",
      wechat: "",
      twitter: "",
      instagram: "",
      linkedin: "",
    },
    preferences: {
      language: "zh-CN",
      currency: "CNY",
      travelStyle: "comfort",
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoadingItineraries, setIsLoadingItineraries] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "profile" | "itineraries" | "stats" | "achievements"
  >("profile");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itineraryToDelete, setItineraryToDelete] = useState<Itinerary | null>(
    null
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 旅行统计数据
  const [travelStats, setTravelStats] = useState({
    totalTrips: 0,
    totalDays: 0,
    totalBudget: 0,
    favoriteDestination: "",
    averageBudget: 0,
    mostVisitedMonth: "",
  });

  // 加载用户数据
  useEffect(() => {
    if (user) {
      setProfileData((prevData) => {
        const shouldUpdateAvatar =
          !prevData.avatar ||
          prevData.avatar === user.image ||
          prevData.avatar.includes("ui-avatars.com");

        return {
          name: user.name || "",
          email: user.email || "",
          avatar: shouldUpdateAvatar ? user.image || "" : prevData.avatar,
          bio: (user as any).bio || "",
          location: (user as any).location || "",
          website: (user as any).website || "",
          phone: (user as any).phone || "",
          birthday: (user as any).birthday
            ? new Date((user as any).birthday).toISOString().split("T")[0]
            : "",
          gender: (user as any).gender || "",
          occupation: (user as any).occupation || "",
          interests: (user as any).interests || "",
          socialLinks: {
            weibo: (user as any).socialLinks?.weibo || "",
            wechat: (user as any).socialLinks?.wechat || "",
            twitter: (user as any).socialLinks?.twitter || "",
            instagram: (user as any).socialLinks?.instagram || "",
            linkedin: (user as any).socialLinks?.linkedin || "",
          },
          preferences: {
            language: "zh-CN",
            currency: "CNY",
            travelStyle: "comfort",
          },
        };
      });
    }
  }, [user]);

  // 加载用户的智能推荐计划
  useEffect(() => {
    if (user && isAuthenticated) {
      loadUserItineraries();
    }
  }, [user, isAuthenticated]);

  const loadUserItineraries = async () => {
    try {
      setIsLoadingItineraries(true);

      // 直接调用API获取行程
      const response = await fetch("/api/itineraries", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setItineraries(result.data);
          calculateTravelStats(result.data);
        } else {
          console.error("API返回错误:", result.error);
        }
      } else {
        console.error("API请求失败:", response.status);
      }
    } catch (error) {
      console.error("加载行程失败:", error);
    } finally {
      setIsLoadingItineraries(false);
    }
  };

  // 计算旅行统计数据
  const calculateTravelStats = (trips: Itinerary[]) => {
    if (trips.length === 0) return;

    const totalTrips = trips.length;
    const totalDays = trips.reduce((sum, trip) => sum + (trip.days || 0), 0);
    const totalBudget = trips.reduce(
      (sum, trip) => sum + (trip.budget || 0),
      0
    );
    const averageBudget = totalBudget / totalTrips;

    // 统计最受欢迎的目的地
    const destinations = trips.map((trip) => trip.destination);
    const destinationCount = destinations.reduce((acc, dest) => {
      acc[dest] = (acc[dest] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const favoriteDestination =
      Object.entries(destinationCount).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "";

    // 统计最常旅行的月份
    const months = trips.map((trip) => new Date(trip.createdAt).getMonth());
    const monthCount = months.reduce((acc, month) => {
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    const mostVisitedMonth =
      Object.entries(monthCount).sort(([, a], [, b]) => b - a)[0]?.[0] || "";

    setTravelStats({
      totalTrips,
      totalDays,
      totalBudget,
      favoriteDestination,
      averageBudget,
      mostVisitedMonth: [
        "一月",
        "二月",
        "三月",
        "四月",
        "五月",
        "六月",
        "七月",
        "八月",
        "九月",
        "十月",
        "十一月",
        "十二月",
      ][parseInt(mostVisitedMonth) || 0],
    });
  };

  // 删除智能推荐计划
  const handleDeleteItinerary = async (itineraryId: string) => {
    try {
      console.log("🗑️ 开始删除行程:", itineraryId);

      // 通过API删除行程
      const response = await fetch(`/api/itineraries?id=${itineraryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // 更新本地状态
          setItineraries((prev) =>
            prev.filter((item) => item.id !== itineraryId)
          );
          setMessage("计划删除成功！");
          setTimeout(() => setMessage(""), 3000);
        } else {
          setError(result.error || "删除失败，请稍后重试");
          setTimeout(() => setError(""), 3000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "删除失败，请稍后重试");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("删除行程错误:", error);
      setError("删除过程中出现错误");
      setTimeout(() => setError(""), 3000);
    }
  };

  // 打开删除确认对话框
  const openDeleteDialog = (itinerary: Itinerary) => {
    setItineraryToDelete(itinerary);
    setDeleteDialogOpen(true);
  };

  // 确认删除
  const confirmDelete = async () => {
    if (itineraryToDelete) {
      await handleDeleteItinerary(itineraryToDelete.id);
      setDeleteDialogOpen(false);
      setItineraryToDelete(null);
    }
  };

  // 取消删除
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setItineraryToDelete(null);
  };

  // 头像上传相关函数
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("请选择图片文件（JPG、PNG、GIF、WebP）");
      setTimeout(() => setError(""), 3000);
      return;
    }

    // 验证文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError("文件大小不能超过5MB");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsUploadingAvatar(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // 立即更新前端状态
          setProfileData((prev) => ({
            ...prev,
            avatar: result.data.url,
          }));

          // 立即保存到数据库
          try {
            const updateResponse = await fetch("/api/user/avatar", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                avatarUrl: result.data.url,
              }),
            });

            if (updateResponse.ok) {
              const updateResult = await updateResponse.json();
              if (updateResult.success) {
                setMessage("头像上传并保存成功！");

                // 更新 NextAuth session
                try {
                  await update();
                } catch (sessionError) {
                  console.error("更新 session 失败:", sessionError);
                }

                // 强制刷新头像显示
                setTimeout(() => {
                  const avatarImg = document.querySelector(
                    'img[alt="用户头像"]'
                  ) as HTMLImageElement;
                  if (avatarImg) {
                    // 添加时间戳参数来避免缓存
                    const newSrc = `${result.data.url}?t=${Date.now()}`;
                    avatarImg.src = newSrc;
                  }
                }, 100);
              } else {
                setError(updateResult.error || "头像上传成功，但保存失败");
              }
            } else {
              const errorData = await updateResponse.json();
              setError(errorData.error || "头像上传成功，但保存失败");
            }
          } catch (dbError) {
            console.error("保存头像到数据库失败:", dbError);
            setError("头像上传成功，但保存失败");
          }

          setTimeout(() => setMessage(""), 3000);
        } else {
          setError(result.error || "上传失败");
          setTimeout(() => setError(""), 3000);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "上传失败");
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("头像上传错误:", error);
      setError("上传过程中出现错误");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("preferences.")) {
      const prefKey = name.split(".")[1];
      setProfileData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // 保存个人资料
  const handleSave = async () => {
    if (!profileData.name.trim()) {
      setError("姓名不能为空");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profileData.name,
          bio: profileData.bio,
          location: profileData.location,
          website: profileData.website,
          phone: profileData.phone,
          gender: profileData.gender,
          occupation: profileData.occupation,
          interests: profileData.interests,
          socialLinks: profileData.socialLinks,
          preferences: profileData.preferences,
          birthday: profileData.birthday,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage("个人资料更新成功！");
        setIsEditing(false);

        // 更新本地状态
        setProfileData(prev => ({
          ...prev,
          ...result.data,
          birthday: result.data.birthday
            ? new Date(result.data.birthday).toISOString().split("T")[0]
            : ""
        }));

        // 更新 NextAuth session
        try {
          await update();
        } catch (sessionError) {
          console.error("更新 session 失败:", sessionError);
        }

        // 3秒后清除成功消息
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(result.error || "更新失败，请重试");
        console.error("个人资料更新失败:", result.error);
        setTimeout(() => setError(""), 3000);
      }
    } catch (error) {
      console.error("个人资料更新错误:", error);
      setError("更新过程中出现错误，请重试");
      setTimeout(() => setError(""), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // 取消编辑
  const handleCancel = () => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        avatar: user.image || "",
        bio: (user as any).bio || "",
        location: (user as any).location || "",
        website: (user as any).website || "",
        phone: (user as any).phone || "",
        birthday: (user as any).birthday
          ? new Date((user as any).birthday).toISOString().split("T")[0]
          : "",
        gender: (user as any).gender || "",
        occupation: (user as any).occupation || "",
        interests: (user as any).interests || "",
        socialLinks: {
          weibo: (user as any).socialLinks?.weibo || "",
          wechat: (user as any).socialLinks?.wechat || "",
          twitter: (user as any).socialLinks?.twitter || "",
          instagram: (user as any).socialLinks?.instagram || "",
          linkedin: (user as any).socialLinks?.linkedin || "",
        },
        preferences: {
          language: "zh-CN",
          currency: "CNY",
          travelStyle: "comfort",
        },
      });
    }
    setIsEditing(false);
    setError("");
  };

  // 如果正在加载或未认证，显示加载状态
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">加载中...</p>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const tabVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 页面标题 */}
        <motion.div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            个人中心
          </h1>
          <p className="text-gray-600 mt-2">管理您的个人信息和旅行计划</p>
        </motion.div>

        {/* 提示信息 */}
        <AnimatePresence>
          {message && (
            <motion.div
              className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-sm text-green-700">{message}</div>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-sm text-red-700">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 标签页导航 */}
        <motion.div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/20">
            <div className="flex space-x-2">
              <motion.button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-500 relative overflow-hidden ${activeTab === "profile"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === "profile" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400"
                    layoutId="activeTabProfile"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">个人资料</span>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("itineraries")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-500 relative overflow-hidden ${activeTab === "itineraries"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === "itineraries" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400"
                    layoutId="activeTabItineraries"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">
                  旅行计划
                  <motion.span
                    className="ml-2 inline-block bg-white/20 px-2 py-1 rounded-full text-xs"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    {itineraries.length}
                  </motion.span>
                </span>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("stats")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-500 relative overflow-hidden ${activeTab === "stats"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === "stats" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400"
                    layoutId="activeTabStats"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">旅行统计</span>
              </motion.button>
              <motion.button
                onClick={() => setActiveTab("achievements")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-500 relative overflow-hidden ${activeTab === "achievements"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {activeTab === "achievements" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400"
                    layoutId="activeTabAchievements"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">成就徽章</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* 标签页内容 */}
        <AnimatePresence mode="wait">
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* 个人信息卡片 */}
              <motion.div className="lg:col-span-1">
                <Card className="h-fit profile-card-hover">
                  <CardHeader className="text-center pb-4">
                    <div className="relative mx-auto mb-4">
                      <motion.div
                        className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg avatar-hover relative cursor-pointer"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        }}
                        onClick={isEditing ? handleAvatarClick : undefined}
                      >
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 hover:opacity-20 transition-opacity duration-300" />
                        {isUploadingAvatar && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          </div>
                        )}
                        <img
                          className="w-full h-full object-cover"
                          src={
                            profileData.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              profileData.name
                            )}&background=6366f1&color=fff&size=96`
                          }
                          alt="用户头像"
                          onLoad={() => {
                          }}
                          onError={(e) => {

                            (
                              e.target as HTMLImageElement
                            ).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              profileData.name
                            )}&background=6366f1&color=fff&size=96`;
                          }}
                        />
                        {isEditing && (
                          <div className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1 shadow-lg">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </div>
                        )}
                      </motion.div>
                      {isEditing && (
                        <p className="text-xs text-gray-500 mt-2">
                          点击头像更换
                        </p>
                      )}
                    </div>
                    <CardTitle className="text-xl">
                      {profileData.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {profileData.email}
                    </CardDescription>
                    {profileData.bio && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        "{profileData.bio}"
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profileData.location && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">
                            所在地
                          </span>
                          <span className="text-sm font-medium">
                            {profileData.location}
                          </span>
                        </div>
                      )}
                      {profileData.occupation && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">职业</span>
                          <span className="text-sm font-medium">
                            {profileData.occupation}
                          </span>
                        </div>
                      )}
                      {profileData.website && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">网站</span>
                          <a
                            href={profileData.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate"
                          >
                            {profileData.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                      {profileData.interests && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">兴趣</span>
                          <span className="text-sm font-medium">
                            {profileData.interests}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          语言偏好
                        </span>
                        <span className="text-sm font-medium">
                          {profileData.preferences.language === "zh-CN"
                            ? "中文"
                            : profileData.preferences.language === "en-US"
                              ? "English"
                              : "日本語"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          货币单位
                        </span>
                        <span className="text-sm font-medium">
                          {profileData.preferences.currency === "CNY"
                            ? "人民币"
                            : profileData.preferences.currency === "USD"
                              ? "美元"
                              : profileData.preferences.currency === "EUR"
                                ? "欧元"
                                : "日元"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          旅行风格
                        </span>
                        <span className="text-sm font-medium">
                          {profileData.preferences.travelStyle === "budget"
                            ? "经济型"
                            : profileData.preferences.travelStyle === "comfort"
                              ? "舒适型"
                              : "豪华型"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 编辑表单 */}
              <motion.div className="lg:col-span-2">
                <Card className="profile-card-hover">
                  <CardHeader>
                    <CardTitle className="text-2xl">编辑个人资料</CardTitle>
                    <CardDescription>
                      更新您的个人信息和偏好设置
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {isEditing ? (
                      <>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              姓名
                            </label>
                            <input
                              type="text"
                              name="name"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                              value={profileData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              个人签名
                            </label>
                            <textarea
                              name="bio"
                              rows={3}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus resize-none"
                              placeholder="写点什么来介绍自己..."
                              value={profileData.bio}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                所在地
                              </label>
                              <input
                                type="text"
                                name="location"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                                placeholder="例如：北京、上海、纽约"
                                value={profileData.location}
                                onChange={handleInputChange}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                职业
                              </label>
                              <input
                                type="text"
                                name="occupation"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                                placeholder="例如：软件工程师、设计师"
                                value={profileData.occupation}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                个人网站
                              </label>
                              <input
                                type="url"
                                name="website"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                                placeholder="https://example.com"
                                value={profileData.website}
                                onChange={handleInputChange}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                电话号码
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                                placeholder="+86 138 0000 0000"
                                value={profileData.phone}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                生日
                              </label>
                              <input
                                type="date"
                                name="birthday"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                                value={profileData.birthday}
                                onChange={handleInputChange}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                性别
                              </label>
                              <select
                                name="gender"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                                value={profileData.gender}
                                onChange={handleInputChange}
                              >
                                <option value="">请选择</option>
                                <option value="male">男</option>
                                <option value="female">女</option>
                                <option value="other">其他</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              兴趣爱好
                            </label>
                            <input
                              type="text"
                              name="interests"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                              placeholder="例如：旅行、摄影、美食、运动"
                              value={profileData.interests}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                语言
                              </label>
                              <select
                                name="preferences.language"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                                value={profileData.preferences.language}
                                onChange={handleInputChange}
                              >
                                <option value="zh-CN">中文</option>
                                <option value="en-US">English</option>
                                <option value="ja-JP">日本語</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                货币
                              </label>
                              <select
                                name="preferences.currency"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                                value={profileData.preferences.currency}
                                onChange={handleInputChange}
                              >
                                <option value="CNY">人民币 (CNY)</option>
                                <option value="USD">美元 (USD)</option>
                                <option value="EUR">欧元 (EUR)</option>
                                <option value="JPY">日元 (JPY)</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                旅行风格
                              </label>
                              <select
                                name="preferences.travelStyle"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent input-focus"
                                value={profileData.preferences.travelStyle}
                                onChange={handleInputChange}
                              >
                                <option value="budget">经济型</option>
                                <option value="comfort">舒适型</option>
                                <option value="luxury">豪华型</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="px-6 py-2 btn-hover"
                          >
                            取消
                          </Button>
                          <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 btn-hover"
                          >
                            {isSaving ? "保存中..." : "保存"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">
                          点击下方按钮开始编辑您的个人资料
                        </p>
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 btn-hover"
                        >
                          编辑资料
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "itineraries" && (
            <motion.div
              key="itineraries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="profile-card-hover">
                <CardHeader>
                  <CardTitle className="text-2xl">智能推荐计划</CardTitle>
                  <CardDescription>管理您生成的旅行计划</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingItineraries ? (
                    <div className="text-center py-12">
                      <div className="loading-spinner rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">加载中...</p>
                    </div>
                  ) : itineraries.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 empty-state">
                        <span className="text-3xl text-gray-400">📋</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        暂无旅行计划
                      </h3>
                      <p className="text-gray-600">
                        您还没有生成任何智能推荐计划
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {itineraries.map((itinerary, index) => (
                        <motion.div
                          key={itinerary.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="h-full profile-card-hover group">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg line-clamp-2">
                                {itinerary.title}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {itinerary.destination} • {itinerary.days}天
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">预算</span>
                                  <span className="font-medium">
                                    ¥{(itinerary.budget || 0).toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    创建时间
                                  </span>
                                  <span className="font-medium">
                                    {new Date(
                                      itinerary.createdAt
                                    ).toLocaleDateString("zh-CN")}
                                  </span>
                                </div>
                                <div className="pt-3 border-t">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full delete-btn"
                                    onClick={() => openDeleteDialog(itinerary)}
                                  >
                                    删除计划
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* 旅行统计概览 */}
              <Card className="profile-card-hover">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    旅行统计概览
                  </CardTitle>
                  <CardDescription>您的旅行数据分析</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                      className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {travelStats.totalTrips}
                      </div>
                      <div className="text-gray-600">总旅行次数</div>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {travelStats.totalDays}
                      </div>
                      <div className="text-gray-600">总旅行天数</div>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        ¥{travelStats.totalBudget.toLocaleString()}
                      </div>
                      <div className="text-gray-600">总预算支出</div>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        ¥{travelStats.averageBudget.toLocaleString()}
                      </div>
                      <div className="text-gray-600">平均预算</div>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-xl font-bold text-pink-600 mb-2">
                        {travelStats.favoriteDestination || "暂无"}
                      </div>
                      <div className="text-gray-600">最爱目的地</div>
                    </motion.div>

                    <motion.div
                      className="bg-gradient-to-br from-cyan-50 to-teal-50 p-6 rounded-xl border border-cyan-100"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-xl font-bold text-cyan-600 mb-2">
                        {travelStats.mostVisitedMonth || "暂无"}
                      </div>
                      <div className="text-gray-600">最常旅行月份</div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              {/* 旅行趋势图表 */}
              <Card className="profile-card-hover">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    旅行趋势
                  </CardTitle>
                  <CardDescription>您的旅行模式分析</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                    <div className="text-center text-gray-500">
                      <div>旅行趋势图表</div>
                      <div className="text-sm">即将推出更多数据分析功能</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === "achievements" && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* 成就徽章 */}
              <Card className="profile-card-hover">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center gap-3">
                    成就徽章
                  </CardTitle>
                  <CardDescription>解锁您的旅行成就</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* 首次旅行 */}
                    <motion.div
                      className={`p-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-center min-h-[120px] ${travelStats.totalTrips >= 1
                          ? "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg"
                          : "bg-gray-50 border-gray-200 opacity-50"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-lg mb-2">首次旅行</div>
                        <div className="text-sm text-gray-600">
                          {travelStats.totalTrips >= 1 ? "已完成！" : "完成第一次旅行"}
                        </div>
                      </div>
                    </motion.div>

                    {/* 旅行达人 */}
                    <motion.div
                      className={`p-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-center min-h-[120px] ${travelStats.totalTrips >= 5
                          ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg"
                          : "bg-gray-50 border-gray-200 opacity-50"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-lg mb-2">旅行达人</div>
                        <div className="text-sm text-gray-600">
                          {travelStats.totalTrips >= 5 ? "已完成！" : "完成5次旅行"}
                        </div>
                      </div>
                    </motion.div>

                    {/* 预算大师 */}
                    <motion.div
                      className={`p-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-center min-h-[120px] ${travelStats.averageBudget <= 3000 && travelStats.totalTrips >= 1
                          ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg"
                          : "bg-gray-50 border-gray-200 opacity-50"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-lg mb-2">预算大师</div>
                        <div className="text-sm text-gray-600">
                          {travelStats.averageBudget <= 3000 && travelStats.totalTrips >= 1
                            ? "已完成！"
                            : "平均预算控制在3000元以下"}
                        </div>
                      </div>
                    </motion.div>

                    {/* 长期旅行者 */}
                    <motion.div
                      className={`p-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-center min-h-[120px] ${travelStats.totalDays >= 10
                          ? "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-lg"
                          : "bg-gray-50 border-gray-200 opacity-50"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-lg mb-2">长期旅行者</div>
                        <div className="text-sm text-gray-600">
                          {travelStats.totalDays >= 10 ? "已完成！" : "累计旅行10天以上"}
                        </div>
                      </div>
                    </motion.div>

                    {/* 目的地探索者 */}
                    <motion.div
                      className={`p-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-center min-h-[120px] ${itineraries.length >= 3 &&
                          new Set(itineraries.map((t) => t.destination)).size >= 3
                          ? "bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-lg"
                          : "bg-gray-50 border-gray-200 opacity-50"
                        }`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-lg mb-2">目的地探索者</div>
                        <div className="text-sm text-gray-600">
                          {itineraries.length >= 3 &&
                            new Set(itineraries.map((t) => t.destination)).size >= 3
                            ? "已完成！"
                            : "探索3个不同目的地"}
                        </div>
                      </div>
                    </motion.div>

                    {/* 未来成就 */}
                    <motion.div
                      className="p-6 rounded-xl border-2 border-gray-200 bg-gray-50 opacity-50 flex items-center justify-center min-h-[120px]"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-lg mb-2">神秘成就</div>
                        <div className="text-sm text-gray-600">敬请期待更多成就</div>
                      </div>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            您确定要删除行程 "{itineraryToDelete?.title}" 吗？此操作不可撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-700">
                  删除后将无法恢复，请谨慎操作
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={cancelDelete}>
            取消
          </Button>
          <Button variant="destructive" onClick={confirmDelete}>
            确认删除
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

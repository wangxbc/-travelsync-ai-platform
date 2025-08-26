"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { initDebugTools } from "@/lib/debug";
import { Sparkles, Target, Award, Star, Zap, Heart } from 'lucide-react'

// 英雄区域背景图片轮播数据
const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
    title: "河北·承德避暑山庄",
    subtitle: "这么近，那么美，周末到河北！",
  },
  {
    image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&h=1080&fit=crop",
    title: "北京·故宫紫禁城",
    subtitle: "千年古都，皇家宫殿的恢弘气象",
  },
  {
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=1080&fit=crop",
    title: "云南·大理洱海",
    subtitle: "风花雪月，苍山洱海间的诗意",
  },
  {
    image: "https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=1920&h=1080&fit=crop",
    title: "上海·外滩夜景",
    subtitle: "东方明珠，黄浦江畔的璀璨华章",
  },
  {
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1920&h=1080&fit=crop",
    title: "西藏·布达拉宫",
    subtitle: "雪域高原上的神圣殿堂",
  },
  {
    image: "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1920&h=1080&fit=crop",
    title: "新疆·喀纳斯",
    subtitle: "人间仙境，神的后花园",
  },
];

// 中国热门旅游目的地数据
const heroSlideNames = heroSlides.map((slide) =>
  slide.title.replace(/·.*/, "")
);
const destinations = [
  {
    name: "河南·郑州黄河风景区",
    description: "中原大地，母亲河畔的壮美风光",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
    rating: 5.0,
    price: 1299,
    tag: "历史沉淀",
  },
  {
    name: "四川·稻城亚丁",
    description: "蓝色星球上的最后一片净土，香格里拉之魂",
    image:
      "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=800&h=600&fit=crop",
    rating: 4.8,
    price: 1899,
    tag: "摄影天堂",
  },
  {
    name: "海南·三亚",
    description: "东方夏威夷，椰风海韵，热带海滨度假胜地",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&fit=crop",
    rating: 4.6,
    price: 1599,
    tag: "海滨度假",
  },
  {
    name: "陕西·西安",
    description: "千年古都，兵马俑故乡，十三朝古都历史厚重",
    image:
      "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&h=600&fit=crop",
    rating: 4.7,
    price: 899,
    tag: "历史古都",
  },
  {
    name: "湖南·张家界",
    description: "阿凡达取景地，奇峰异石，世界自然遗产",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=600&fit=crop",
    rating: 4.8,
    price: 1199,
    tag: "自然奇观",
  },
  {
    name: "福建·厦门鼓浪屿",
    description: "海上花园，浪漫文艺的慢生活小岛",
    image:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?w=800&h=600&fit=crop",
    rating: 4.7,
    price: 1099,
    tag: "海岛风情",
  },
];

// 功能特性数据
const features = [
  {
    title: "AI智能规划",
    description:
      "基于GPT-4的智能算法，根据您的偏好和预算，自动生成最优的旅行行程安排，让规划变得轻松简单。",
  },
  {
    title: "3D地图可视化",
    description:
      "使用Mapbox技术，在3D地图上直观展示您的旅行路线和景点位置，让行程规划更加直观。",
  },
  {
    title: "实时协作",
    description:
      "邀请朋友一起规划旅行，实时同步编辑，共同决策每个行程细节，让旅行规划成为美好回忆的开始。",
  },
  {
    title: "数据分析",
    description:
      "详细的预算分析和时间分配图表，帮助您更好地管理旅行资源，让每一分钱都花在刀刃上。",
  },
  {
    title: "智能推荐",
    description:
      "基于您的历史偏好和相似用户行为，推荐最适合的旅行目的地和活动，发现更多精彩。",
  },
  {
    title: "移动优化",
    description:
      "完美适配手机和平板设备，支持PWA离线功能，随时随地规划旅行，让灵感不受限制。",
  },
];

// 用户评价数据
const testimonials = [
  {
    name: "李小勋",
    avatar:
      "",
    rating: 5,
    comment:
      "TravelSync让我的武汉之旅变得完美无缺！AI推荐的景点都非常棒，省去了大量的规划时间。",
  },
  {
    name: "林二名",
    avatar:
      "",
    rating: 5,
    comment:
      "和朋友一起用这个平台规划旅游，实时协作功能太方便了！每个人都能参与进来。",
  },
  {
    name: "孔龙",
    avatar:"",
    rating: 4,
    comment:
      "3D地图功能让我提前'游览'了目的地，预算分析也很准确，强烈推荐给所有旅行爱好者！",
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { data: session, status } = useSession();
  const { showInfoToast } = useToast();

const featureIcons = [
  <Sparkles className="w-8 h-8" key="sparkles" />,
  <Target className="w-8 h-8" key="target" />,
  <Award className="w-8 h-8" key="award" />,
  <Star className="w-8 h-8" key="star" />,
  <Zap className="w-8 h-8" key="zap" />,
  <Heart className="w-8 h-8" key="heart" />
]


  // 初始化调试工具
  useEffect(() => {
    initDebugTools();
  }, []);

  // 自动轮播英雄区域背景
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 检查登录状态并显示提示
  useEffect(() => {
    if (status === "unauthenticated") {
      // 延迟显示登录提示，让页面先加载完成
      const timer = setTimeout(() => {
        setShowLoginPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowLoginPrompt(false);
    }
  }, [status]);

  // 处理登录提示点击
  const handleLoginPromptClick = () => {
    setShowLoginPrompt(false);
    showInfoToast("欢迎使用TravelSync！请登录以享受完整功能");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 登录提示动画 */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.8 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.5,
            }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLoginPromptClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full shadow-2xl cursor-pointer backdrop-blur-sm border-2 border-white/20"
            >
              <div className="flex items-center space-x-3">
                <div className="text-center">
                  <p className="font-semibold text-lg">登录解锁完整功能</p>
                  <p className="text-sm opacity-90">
                    AI智能规划 · 3D地图 · 实时协作
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* 英雄区域 */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 背景图片轮播 */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 2 }}
              className="absolute inset-0"
            >
              <img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40"></div>

        {/* 主标题内容 */}
        <div className="relative z-10 text-center text-white max-w-5xl px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1 }}
              className="mb-8"
            >
              <motion.h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4">
                <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-100 bg-clip-text text-transparent">
                  {heroSlides[currentSlide].title}
                </span>
              </motion.h1>
              <motion.p className="text-2xl md:text-3xl text-cyan-200 font-light">
                {heroSlides[currentSlide].subtitle}
              </motion.p>
            </motion.div>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl mb-8 text-gray-200 font-light leading-relaxed"
          >
            AI驱动的智能旅行规划，让每一次出行都成为完美回忆
          </motion.p>

          {/* CTA按钮 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link href="/planning">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
              >
                开始规划旅行
              </motion.button>
            </Link>
            <Link href="/demo">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300"
              >
                观看演示
              </motion.button>
            </Link>
          </motion.div>

          {/* 轮播指示器 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex justify-center mt-12 space-x-3"
          >
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${index === currentSlide
                  ? "bg-white scale-125 shadow-lg"
                  : "bg-white/50 hover:bg-white/75"
                  }`}
              />
            ))}
          </motion.div>
        </div>

        {/* 滚动提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/70"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <span className="text-sm mb-2">向下滚动探索更多</span>
            <span className="text-xl">↓</span>
          </motion.div>
        </motion.div>
      </section>{" "}
      {/* 
热门目的地区域 */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-800">
              <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                热门旅行目的地
              </span>
              <br />
              <span className="text-3xl md:text-4xl">发现更多精彩之地</span>
            </h2>
            <p className="text-xl text-slate-600">
              精选全国各地热门旅行胜地，开启你的美好旅程
            </p>
          </motion.div>

          {/* 目的地卡片网格 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((destination, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
              >
                <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    {/* 热门标签 */}
                    <div className="mb-3">
                      <span className="inline-block px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 rounded-full text-xs font-semibold">
                        {destination.tag}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-2">
                      {destination.name}
                    </h3>
                    <p className="text-sm opacity-90 mb-3">
                      {destination.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-400 flex items-center">
                        {destination.rating} 分
                      </span>
                      <span className="text-lg font-semibold">
                        从 ¥{destination.price}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* 功能特性区域 */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              为什么选择 TravelSync
            </h2>
            <p className="text-xl text-gray-300">AI技术与旅行体验的完美结合</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
          whileHover={{ y: -10 }}
          className="group cursor-pointer"
        >
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 h-full">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
              <span className="text-white">
                {featureIcons[index] || <Sparkles className="w-8 h-8" />}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-4 text-white">
              {feature.title}
            </h3>
            <p className="text-gray-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* 用户评价区域 */}
      <section className="py-20 bg-gradient-to-r from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-800">
              用户怎么说
            </h2>
            <p className="text-xl text-slate-600">来自真实用户的反馈</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {testimonial.name}
                    </h4>
                    <div className="text-yellow-400 text-lg">
                      {testimonial.rating} 分
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed">
                  "{testimonial.comment}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA区域 */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              准备开始您的旅程了吗？
            </h2>
            <p className="text-xl mb-8 opacity-90">
              加入数千名用户，体验AI驱动的智能旅行规划
            </p>
            <Link href="/planning">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-white text-blue-600 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl"
              >
                立即开始规划 →
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
      {/* 页脚 */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                TravelSync
              </h3>
              <p className="text-gray-400 leading-relaxed">
                AI驱动的智能旅行规划平台，让每一次出行都成为完美回忆。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">产品</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/planning"
                    className="hover:text-white transition-colors"
                  >
                    智能规划
                  </Link>
                </li>
                <li>
                  <Link
                    href="/map"
                    className="hover:text-white transition-colors"
                  >
                    3D地图
                  </Link>
                </li>
                <li>
                  <Link
                    href="/collaboration"
                    className="hover:text-white transition-colors"
                  >
                    实时协作
                  </Link>
                </li>
                <li>
                  <Link
                    href="/analytics"
                    className="hover:text-white transition-colors"
                  >
                    数据分析
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">公司</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    联系我们
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    加入我们
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    博客
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">支持</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    帮助中心
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-white transition-colors"
                  >
                    隐私政策
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-white transition-colors"
                  >
                    服务条款
                  </Link>
                </li>
                <li>
                  <Link
                    href="/feedback"
                    className="hover:text-white transition-colors"
                  >
                    意见反馈
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-gray-400">
            <p>© 2025 TravelSync. 保留所有权利。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

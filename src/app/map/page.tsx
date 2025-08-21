"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRequireAuth, useCurrentUser } from "@/lib/hooks/useAuth";
import { getUserManager } from "@/lib/auth";

// 用户数据管理工具函数
const UserDataManager = {
  // 获取用户专属存储键
  getUserStorageKey: (
    user: { email?: string; id?: string } | null,
    type: "itineraries" | "latest"
  ) => {
    if (!user) return null;
    const userId = user.email || user.id;
    return type === "itineraries"
      ? `travel_itineraries_${userId}`
      : `latest_itinerary_${userId}`;
  },

  // 清理全局数据（用户登出时调用）
  clearGlobalData: () => {
    try {
      localStorage.removeItem("travel_itineraries");
      localStorage.removeItem("latest_itinerary");
      console.log("已清理全局行程数据");
    } catch (error) {
      console.error("清理全局数据失败:", error);
    }
  },

  // 获取用户行程数据
  getUserItineraries: (user: { email?: string; id?: string } | null) => {
    const key = UserDataManager.getUserStorageKey(user, "itineraries");
    if (!key) return [];
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (error) {
      console.error("读取用户行程数据失败:", error);
      return [];
    }
  },

  // 保存用户行程数据
  saveUserItineraries: (
    user: { email?: string; id?: string } | null,
    itineraries: unknown[]
  ) => {
    const key = UserDataManager.getUserStorageKey(user, "itineraries");
    if (!key) return false;
    try {
      localStorage.setItem(key, JSON.stringify(itineraries));
      return true;
    } catch (error) {
      console.error("保存用户行程数据失败:", error);
      return false;
    }
  },
};

// 定义行程数据类型
interface ItineraryActivity {
  name: string;
  coordinates: [number, number];
  type: "attraction" | "restaurant" | "shopping" | "hotel";
  time: string;
  day: number;
  description?: string;
  cost?: number;
  duration?: string;
}

interface Itinerary {
  id: string;
  title: string;
  destination: string;
  days: number;
  totalBudget: number;
  status: string;
  activities: ItineraryActivity[];
  createdAt: string;
  interests: string[];
  travelStyle: string;
}

// 从API读取真实行程数据的Hook
function useItineraryData(user: { email?: string; id?: string } | null) {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadItineraries = async () => {
      try {
        // 如果用户未登录，返回空数据
        if (!user) {
          setItineraries([]);
          setIsLoading(false);
          return;
        }

        // 通过API获取用户行程数据
        const response = await fetch("/api/itineraries", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          console.log("API返回的行程数据:", result);

          if (result.success && result.data) {
            console.log("原始API数据:", result.data);
            // 转换数据格式以适配地图组件
            const formattedItineraries = result.data.map((item: any) => {
              console.log("处理行程项:", item);
              const activities: ItineraryActivity[] = [];

              // 添加测试数据以确保路线能显示
              const hasTestData =
                !item.data || !item.data.days || item.data.days.length === 0;

              // 从行程数据中提取活动信息
              if (item.data && item.data.days) {
                item.data.days.forEach((day: any, dayIndex: number) => {
                  if (day.activities) {
                    day.activities.forEach((activity: any) => {
                      // 生成更合理的坐标分布
                      const baseCoords = getDestinationCoords(item.destination);
                      const activityCoords = getActivityCoords(
                        activity.name,
                        item.destination,
                        dayIndex,
                        activities.length
                      );

                      activities.push({
                        name: activity.name,
                        coordinates: activityCoords,
                        type: getActivityType(activity.type || activity.name),
                        time: activity.time || "09:00",
                        day: dayIndex + 1,
                        description: activity.description,
                        cost: activity.cost,
                        duration: activity.duration,
                      });
                    });
                  }
                });
              }

              // 如果没有活动数据，添加一些测试数据以确保路线能显示
              if (activities.length === 0) {
                const baseCoords = getDestinationCoords(item.destination);
                const testActivities = [
                  { name: "出发点", type: "hotel" },
                  { name: "景点A", type: "attraction" },
                  { name: "餐厅", type: "restaurant" },
                  { name: "景点B", type: "attraction" },
                ];

                testActivities.forEach((activity, index) => {
                  const coords = getActivityCoords(
                    activity.name,
                    item.destination,
                    0,
                    index
                  );
                  activities.push({
                    name: activity.name,
                    coordinates: coords,
                    type: activity.type as
                      | "attraction"
                      | "restaurant"
                      | "shopping"
                      | "hotel",
                    time: "09:00",
                    day: 1,
                    description: "测试活动",
                  });
                });
                console.log("添加了测试活动数据:", activities);
              }

              return {
                id: item.id,
                title: item.title,
                destination: item.destination,
                days: item.days,
                totalBudget: item.budget,
                status: "active",
                activities: activities,
                createdAt: item.createdAt,
                interests: (() => {
                  console.log("兴趣偏好数据检查:", {
                    itemInterests: item.interests,
                    dataInterests: item.data?.interests,
                    fullData: item.data,
                  });

                  // 优先从 data.interests 获取（这是规划页面保存的位置）
                  if (item.data && item.data.interests) {
                    if (Array.isArray(item.data.interests)) {
                      console.log(
                        "从 data.interests 获取数组:",
                        item.data.interests
                      );
                      return item.data.interests;
                    } else if (
                      typeof item.data.interests === "string" &&
                      item.data.interests.trim()
                    ) {
                      const parsed = item.data.interests
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s);
                      console.log("✅ 从 data.interests 解析字符串:", parsed);
                      return parsed;
                    }
                  }

                  // 备选：从顶级 interests 字段获取
                  if (Array.isArray(item.interests)) {
                    console.log(
                      "✅ 从 item.interests 获取数组:",
                      item.interests
                    );
                    return item.interests;
                  } else if (
                    typeof item.interests === "string" &&
                    item.interests.trim()
                  ) {
                    const parsed = item.interests
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s);
                    console.log("从 item.interests 解析字符串:", parsed);
                    return parsed;
                  }

                  console.log("未找到兴趣偏好数据，返回空数组");
                  return [];
                })(),
                travelStyle: (() => {
                  const style =
                    item.travelStyle ||
                    item.travel_style ||
                    (item.data && item.data.travelStyle) ||
                    "休闲旅行";
                  console.log("旅行风格:", style);
                  return style;
                })(),
              };
            });

            console.log("格式化后的行程数据:", formattedItineraries);
            setItineraries(formattedItineraries);
          } else {
            console.error("API返回错误:", result.error);
            setItineraries([]);
          }
        } else {
          console.error("API请求失败:", response.status);
          setItineraries([]);
        }
      } catch (error) {
        console.error("加载行程数据失败:", error);
        setItineraries([]);
      } finally {
        setIsLoading(false);
      }
    };

    // 延迟加载，避免在认证状态变化时立即执行
    const timer = setTimeout(loadItineraries, 100);
    return () => clearTimeout(timer);
  }, [user]);

  return { itineraries, isLoading };
}

// 根据目的地获取大概坐标
function getDestinationCoords(destination: string): [number, number] {
  const cityCoords: { [key: string]: [number, number] } = {
    // 直辖市
    北京: [116.4074, 39.9042],
    上海: [121.4737, 31.2304],
    天津: [117.1901, 39.1189],
    重庆: [106.5516, 29.563],

    // 省会城市
    广州: [113.2644, 23.1291],
    深圳: [114.0579, 22.5431],
    杭州: [120.1551, 30.2741],
    南京: [118.7969, 32.0603],
    西安: [108.9486, 34.2583],
    成都: [104.0665, 30.5723],
    武汉: [114.3054, 30.5931],
    苏州: [120.5853, 31.2989],
    青岛: [120.3826, 36.0671],
    大连: [121.6147, 38.914],
    厦门: [118.1689, 24.4797],
    昆明: [102.8329, 24.8801],
    长沙: [112.9388, 28.2282],
    郑州: [113.6254, 34.7466],
    济南: [117.1205, 36.6519],
    哈尔滨: [126.5358, 45.8023],
    沈阳: [123.4315, 41.8057],
    长春: [125.3245, 43.8171],
    石家庄: [114.5149, 38.0428],
    太原: [112.5489, 37.8706],
    呼和浩特: [111.7519, 40.8414],
    银川: [106.2309, 38.4872],
    西宁: [101.7782, 36.6171],
    兰州: [103.8236, 36.0581],
    乌鲁木齐: [87.6177, 43.7928],
    拉萨: [91.1409, 29.6456],
    海口: [110.3312, 20.0311],
    南宁: [108.3669, 22.817],
    贵阳: [106.6302, 26.6477],
    福州: [119.3063, 26.0745],
    南昌: [115.8921, 28.6765],
    合肥: [117.2272, 31.8206],

    // 热门旅游城市
    三亚: [109.5113, 18.2577],
    桂林: [110.2993, 25.2342],
    丽江: [100.2336, 26.8721],
    张家界: [110.4793, 29.1274],
    邯郸: [114.5389, 36.6269],
    承德: [117.9398, 40.9925],
    秦皇岛: [119.6004, 39.935],
    保定: [115.4648, 38.8971],
    唐山: [118.1758, 39.6304],
    廊坊: [116.7038, 39.5186],
    沧州: [116.8286, 38.2104],
    衡水: [115.6657, 37.7161],
    邢台: [114.5086, 37.0682],
    张家口: [114.8794, 40.8118],

    // 江苏省
    无锡: [120.3019, 31.5747],
    常州: [119.9464, 31.7729],
    徐州: [117.1836, 34.2616],
    南通: [120.8644, 32.0116],
    连云港: [119.1248, 34.5961],
    淮安: [119.0153, 33.5975],
    盐城: [120.1395, 33.3776],
    扬州: [119.4215, 32.3932],
    镇江: [119.4763, 32.2044],
    泰州: [119.9153, 32.4849],
    宿迁: [118.2751, 33.963],

    // 浙江省
    宁波: [121.544, 29.8683],
    温州: [120.6994, 27.9944],
    嘉兴: [120.7554, 30.7469],
    湖州: [120.1022, 30.8677],
    绍兴: [120.582, 30.0023],
    金华: [119.6491, 29.0895],
    衢州: [118.8718, 28.9417],
    舟山: [122.107, 30.036],
    台州: [121.4287, 28.6568],
    丽水: [119.9214, 28.4517],

    // 山东省
    淄博: [118.0371, 36.8113],
    枣庄: [117.557, 34.8107],
    东营: [118.6751, 37.4615],
    烟台: [121.3914, 37.5393],
    潍坊: [119.107, 36.7093],
    威海: [122.1201, 37.5097],
    济宁: [116.5873, 35.4154],
    泰安: [117.1289, 36.1948],
    日照: [119.461, 35.4164],
    莱芜: [117.6526, 36.2045],
    临沂: [118.3118, 35.1045],
    德州: [116.3073, 37.4608],
    聊城: [115.9853, 36.4563],
    滨州: [118.0371, 37.3835],
    菏泽: [115.4697, 35.2465],

    // 广东省
    珠海: [113.5767, 22.2707],
    汕头: [116.7081, 23.354],
    佛山: [113.122, 23.0291],
    韶关: [113.5972, 24.8029],
    湛江: [110.3594, 21.2707],
    肇庆: [112.4721, 23.0519],
    江门: [113.0946, 22.5906],
    茂名: [110.9255, 21.6687],
    惠州: [114.4152, 23.1115],
    梅州: [116.1255, 24.2896],
    汕尾: [115.3648, 22.7863],
    河源: [114.6974, 23.7572],
    阳江: [111.9816, 21.8718],
    清远: [113.051, 23.6817],
    东莞: [113.7518, 23.0489],
    中山: [113.3823, 22.5211],
    潮州: [116.6302, 23.6618],
    揭阳: [116.3729, 23.5479],
    云浮: [112.0446, 22.9379],

    // 四川省
    自贡: [104.7734, 29.3528],
    攀枝花: [101.7184, 26.5875],
    泸州: [105.4433, 28.8718],
    德阳: [104.3982, 31.127],
    绵阳: [104.6419, 31.4678],
    广元: [105.843, 32.4336],
    遂宁: [105.5713, 30.5133],
    内江: [105.0661, 29.587],
    乐山: [103.7614, 29.5525],
    南充: [106.0847, 30.7953],
    眉山: [103.8313, 30.0751],
    宜宾: [104.6308, 28.7602],
    广安: [106.6333, 30.4564],
    达州: [107.5023, 31.209],
    雅安: [103.0014, 29.9877],
    巴中: [106.7537, 31.8691],
    资阳: [104.6419, 30.129],

    // 云南省
    曲靖: [103.7976, 25.5031],
    玉溪: [102.5437, 24.3505],
    保山: [99.167, 25.1118],
    昭通: [103.7172, 27.3406],
    普洱: [100.9729, 22.7775],
    临沧: [100.0865, 23.8878],
    楚雄: [101.5457, 25.0663],
    红河: [103.3744, 23.3668],
    文山: [104.2447, 23.3695],
    西双版纳: [100.7984, 22.0017],
    大理: [100.2251, 25.5969],
    德宏: [98.5784, 24.4367],
    怒江: [98.8543, 25.8509],
    迪庆: [99.7065, 27.8269],

    // 其他热门旅游目的地
    九寨沟: [103.9197, 33.2632],
    黄山: [118.167, 30.1327],
    泰山: [117.1289, 36.1948],
    华山: [110.082, 34.4886],
    峨眉山: [103.4845, 29.6015],
    武当山: [111.004, 32.4091],
    庐山: [115.988, 29.5358],
    天山: [87.6177, 43.7928],
    长白山: [128.0563, 42.0048],
    五台山: [113.5547, 39.015],
    普陀山: [122.3869, 29.9739],
    千岛湖: [119.0153, 29.605],
    西湖: [120.1551, 30.2741],
    漓江: [110.2993, 25.2342],
    阳朔: [110.4979, 24.7761],
    凤凰: [109.599, 28.244],
    周庄: [120.8492, 31.1187],
    乌镇: [120.4951, 30.7406],
    同里: [120.7254, 31.1509],
    西塘: [120.8969, 30.9477],

    // 新疆主要城市
    喀什: [75.9892, 39.4677],
    伊犁: [81.3179, 43.9219],
    阿克苏: [80.2651, 41.1707],
    和田: [79.9253, 37.1107],
    哈密: [93.5132, 42.8332],
    克拉玛依: [84.8739, 45.5054],
    吐鲁番: [89.1841, 42.9513],
    库尔勒: [86.1746, 41.7251],

    // 西藏主要城市
    日喀则: [88.8851, 29.269],
    昌都: [97.1785, 31.1368],
    林芝: [94.3624, 29.6544],
    那曲: [92.0602, 31.4806],
    阿里: [80.1055, 32.5032],
    山南: [91.7506, 29.229],

    // 内蒙古主要城市
    包头: [109.9402, 40.6562],
    乌海: [106.8254, 39.6739],
    赤峰: [118.902, 42.2755],
    通辽: [122.265, 43.6174],
    鄂尔多斯: [109.781, 39.6086],
    呼伦贝尔: [119.7658, 49.2153],
    巴彦淖尔: [107.416, 40.7574],
    乌兰察布: [113.1328, 41.0342],
    兴安盟: [122.0706, 46.0763],
    锡林郭勒: [116.0909, 43.9441],
    阿拉善: [105.7286, 38.8408],

    // 港澳台
    香港: [114.1694, 22.3193],
    澳门: [113.5491, 22.1987],
    台北: [121.5654, 25.033],
    高雄: [120.3014, 22.6273],
    台中: [120.6736, 24.1477],
    台南: [120.2513, 22.9999],
  };

  return cityCoords[destination] || [116.4074, 39.9042]; // 默认北京坐标
}

// 根据活动名称和城市生成更精确的坐标
function getActivityCoords(
  activityName: string,
  destination: string,
  dayIndex: number,
  activityIndex: number
): [number, number] {
  const baseCoords = getDestinationCoords(destination);

  // 根据活动类型和索引生成不同的偏移
  const offsetPatterns = [
    [0.008, 0.006], 
    [-0.005, 0.01], 
    [0.012, -0.004],
    [-0.008, -0.007], 
    [0.006, -0.009], 
    [-0.01, 0.003], 
    [0.004, 0.011], 
    [-0.003, -0.012], 
  ];

  // 根据天数和活动索引选择偏移模式
  const patternIndex = (dayIndex * 3 + activityIndex) % offsetPatterns.length;
  const [offsetLng, offsetLat] = offsetPatterns[patternIndex];

  return [baseCoords[0] + offsetLng, baseCoords[1] + offsetLat];
}

// 根据活动名称或类型判断活动类型
function getActivityType(
  nameOrType: string
): "attraction" | "restaurant" | "shopping" | "hotel" {
  const name = nameOrType.toLowerCase();

  if (
    name.includes("餐") ||
    name.includes("饭") ||
    name.includes("食") ||
    name.includes("小吃") ||
    name.includes("美食") ||
    name.includes("菜") ||
    name.includes("restaurant") ||
    name.includes("food")
  ) {
    return "restaurant";
  }

  if (
    name.includes("购物") ||
    name.includes("商场") ||
    name.includes("市场") ||
    name.includes("店") ||
    name.includes("shopping") ||
    name.includes("mall")
  ) {
    return "shopping";
  }

  if (
    name.includes("酒店") ||
    name.includes("宾馆") ||
    name.includes("旅馆") ||
    name.includes("hotel") ||
    name.includes("住宿")
  ) {
    return "hotel";
  }

  return "attraction"; // 默认为景点
}

// 高德地图组件
function AmapComponent({
  selectedItinerary,
  itineraryData,
  viewMode,
  showRoutes,
  show3D,
}: {
  selectedItinerary: string | null;
  itineraryData: Itinerary[];
  viewMode: "satellite" | "street" | "terrain";
  showRoutes: boolean;
  show3D: boolean;
}) {
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    // 动态加载高德地图API
    const loadAMap = () => {
      if (window.AMap) {
        initMap();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://webapi.amap.com/maps?v=2.0&key=7d683e8072a40ff63a014471fbef5b93&plugin=AMap.Scale,AMap.ToolBar,AMap.ControlBar,AMap.MapType,AMap.Geolocation`;
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      const mapInstance = new window.AMap.Map("amap-container", {
        zoom: 12,
        center: [116.4074, 39.9042], // 默认北京，后续会根据选中行程调整
        viewMode: "3D",
        pitch: show3D ? 45 : 0,
        mapStyle:
          viewMode === "satellite"
            ? "amap://styles/satellite"
            : viewMode === "terrain"
            ? "amap://styles/whitesmoke"
            : "amap://styles/normal",
        features: ["bg", "road", "building", "point"],
        showBuildingBlock: show3D,
      });

      // 添加控件
      mapInstance.addControl(new window.AMap.Scale());
      mapInstance.addControl(new window.AMap.ToolBar());
      mapInstance.addControl(new window.AMap.ControlBar());

      setMap(mapInstance);
    };

    loadAMap();

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, []);

  // 更新地图样式
  useEffect(() => {
    if (map) {
      const mapStyle =
        viewMode === "satellite"
          ? "amap://styles/satellite"
          : viewMode === "terrain"
          ? "amap://styles/whitesmoke"
          : "amap://styles/normal";
      map.setMapStyle(mapStyle);
      map.setPitch(show3D ? 45 : 0);
    }
  }, [map, viewMode, show3D]);

  // 更新标记和路线
  useEffect(() => {
    console.log("地图更新触发:", {
      map: !!map,
      selectedItinerary,
      showRoutes,
    });

    if (!map || !selectedItinerary) {
      // 清除所有标记
      markers.forEach((marker) => map?.remove(marker));
      setMarkers([]);
      return;
    }

    const itinerary = itineraryData.find((i) => i.id === selectedItinerary);
    console.log("找到的行程:", itinerary);
    if (!itinerary) return;

    // 清除旧标记
    markers.forEach((marker) => map.remove(marker));

    // 创建新标记
    const newMarkers: any[] = [];
    const routePoints: any[] = [];

    itinerary.activities.forEach((activity, index) => {
      const [lng, lat] = activity.coordinates;
      console.log(
        `活动 ${index + 1}: ${activity.name}, 坐标: [${lng}, ${lat}]`
      );
      routePoints.push([lng, lat]);

      // 创建自定义标记 - 使用项目配色
      const markerColor =
        activity.type === "attraction"
          ? "#4f46e5" 
          : activity.type === "restaurant"
          ? "#059669" 
          : activity.type === "shopping"
          ? "#7c3aed" 
          : "#0ea5e9"; 

      const marker = new window.AMap.Marker({
        position: [lng, lat],
        title: activity.name,
        content: `
          <div style="
            background: linear-gradient(135deg, ${markerColor} 0%, ${markerColor}ee 50%, ${markerColor}dd 100%); 
            color: white; 
            padding: 10px 16px; 
            border-radius: 20px; 
            font-size: 13px; 
            font-weight: 700;
            box-shadow: 0 12px 30px rgba(79, 70, 229, 0.4), 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 3px solid white;
            position: relative;
            backdrop-filter: blur(15px);
            letter-spacing: 0.3px;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
            transition: all 0.3s ease;
          ">
            ${activity.name}
            <div style="
              position: absolute;
              bottom: -8px;
              left: 50%;
              transform: translateX(-50%);
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 8px solid ${markerColor};
              filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
            "></div>
          </div>
        `,
        offset: new window.AMap.Pixel(-50, -30),
      });

      // 添加点击事件
      marker.on("click", () => {
        const infoWindow = new window.AMap.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 200px;">
              <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${
                activity.name
              }</h3>
              <p style="margin: 4px 0; color: #666; font-size: 14px;">
                <strong>时间:</strong> 第${activity.day}天 ${activity.time}
              </p>
              <p style="margin: 4px 0; color: #666; font-size: 14px;">
                                 <strong>类型:</strong> ${
                                   activity.type === "attraction"
                                     ? "景点"
                                     : activity.type === "restaurant"
                                     ? "餐厅"
                                     : "购物"
                                 }
              </p>
            </div>
          `,
          offset: new window.AMap.Pixel(0, -30),
        });
        infoWindow.open(map, [lng, lat]);
      });

      map.add(marker);
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // 绘制路线
    console.log("路线绘制状态:", {
      showRoutes,
      routePointsCount: routePoints.length,
      routePoints,
    });
    if (showRoutes && routePoints.length > 1) {
      console.log("开始绘制路线，路径点:", routePoints);

      // 创建更明显的路线样式
      const polyline = new window.AMap.Polyline({
        path: routePoints,
        strokeColor: "#ff4444", 
        strokeWeight: 6,
        strokeOpacity: 0.8,
        strokeStyle: "solid",
        lineJoin: "round",
        lineCap: "round",
        zIndex: 100,
        borderWeight: 2,
        borderColor: "#ffffff",
      });

      // 同时创建一个动画效果的路线
      const animatedPolyline = new window.AMap.Polyline({
        path: routePoints,
        strokeColor: "#4f46e5",
        strokeWeight: 4,
        strokeOpacity: 0.6,
        strokeStyle: "dashed",
        strokeDasharray: [10, 5],
        zIndex: 99,
      });
      map.add(polyline);
      map.add(animatedPolyline);
      newMarkers.push(polyline);
      newMarkers.push(animatedPolyline);
      console.log("路线已添加到地图");
    } else {
      console.log("路线未绘制:", {
        showRoutes,
        routePointsLength: routePoints.length,
      });
    }

    // 调整视野以包含所有点，如果只有一个点则设置合适的缩放级别
    if (routePoints.length > 1) {
      map.setFitView(newMarkers, false, [50, 50, 50, 50]);
    } else if (routePoints.length === 1) {
      map.setCenter(routePoints[0]);
      map.setZoom(14);
    } else {
      // 没有活动时，定位到城市中心
      const cityCenter = getDestinationCoords(itinerary.destination);
      map.setCenter(cityCenter);
      map.setZoom(12);
    }
  }, [map, selectedItinerary, showRoutes]);

  return (
    <div
      id="amap-container"
      className="w-full h-full rounded-3xl overflow-hidden relative"
      style={{
        minHeight: "400px",
        boxShadow:
          "inset 0 2px 4px rgba(79, 70, 229, 0.1), inset 0 0 0 1px rgba(79, 70, 229, 0.05)",
      }}
    >
    </div>
  );
}

// 智能控制面板组件
function SmartControlPanel({
  itineraries,
  selectedItinerary,
  onItinerarySelect,
  onDeleteItinerary,
  viewMode,
  onViewModeChange,
  showRoutes,
  onShowRoutesChange,
  show3D,
  onShow3DChange,
}: {
  itineraries: any[];
  selectedItinerary: string | null;
  onItinerarySelect: (id: string | null) => void;
  onDeleteItinerary: (id: string) => void;
  viewMode: "satellite" | "street" | "terrain";
  onViewModeChange: (mode: "satellite" | "street" | "terrain") => void;
  showRoutes: boolean;
  onShowRoutesChange: (show: boolean) => void;
  show3D: boolean;
  onShow3DChange: (show: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute left-3 lg:left-6 top-3 lg:top-6 bottom-3 lg:bottom-6 w-72 lg:w-80 bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-indigo-100/50 z-10 overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
        boxShadow:
          "0 25px 50px -12px rgba(79, 70, 229, 0.15), 0 0 0 1px rgba(79, 70, 229, 0.05)",
      }}
    >
      {/* 现代化头部 */}
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white relative overflow-hidden">
        {/* 头部装饰 */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-blue-600/90"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>

        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2 flex items-center">
            <span>智能地图控制台</span>
          </h2>
          <p className="text-indigo-100 text-sm">
            探索您的旅行路线，体验3D可视化
          </p>
        </div>
      </div>

      <div
        className="p-4 lg:p-6 space-y-4 lg:space-y-6 flex-1 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        {/* 行程选择 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              <span className="hidden sm:inline">我的行程</span>
              <span className="sm:hidden">行程</span>
            </h3>
            <button
              onClick={() => {
                console.log("所有行程数据:", itineraries);
                console.log("当前选中行程:", selectedItinerary);
                const selected = itineraries.find(
                  (i) => i.id === selectedItinerary
                );
                if (selected) {
                  console.log("选中行程详情:", selected);
                }
              }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
              title="在控制台输出调试信息"
            >
              🔍
            </button>
          </div>
          <div className="space-y-2">
            {itineraries.map((itinerary) => (
              <motion.div
                key={itinerary.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  onItinerarySelect(
                    selectedItinerary === itinerary.id ? null : itinerary.id
                  )
                }
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                  selectedItinerary === itinerary.id
                    ? "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300 shadow-lg"
                    : "bg-white/80 border-gray-200 hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {itinerary.title || itinerary.destination}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItinerary(itinerary.id);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  >
                  </button>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {itinerary.days}天 · ¥
                  {itinerary.totalBudget || itinerary.budget}
                </p>
                <div className="flex flex-wrap gap-1">
                  {/* 显示兴趣偏好 */}
                  {(() => {
                    console.log("渲染行程标签:", {
                      id: itinerary.id,
                      title: itinerary.title,
                      interests: itinerary.interests,
                      travelStyle: itinerary.travelStyle,
                    });

                    if (itinerary.interests && itinerary.interests.length > 0) {
                      return (
                        <>
                          {itinerary.interests
                            .slice(0, 2)
                            .map((interest: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full"
                              >
                                {interest}
                              </span>
                            ))}
                          {itinerary.interests.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{itinerary.interests.length - 2}
                            </span>
                          )}
                        </>
                      );
                    } else {
                      // 如果没有兴趣偏好，显示旅行风格和一些默认标签
                      return (
                        <>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {itinerary.travelStyle || "休闲旅行"}
                          </span>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            {itinerary.destination}
                          </span>
                        </>
                      );
                    }
                  })()}
                </div>
                {selectedItinerary === itinerary.id && (
                  <div className="mt-3 pt-3 border-t border-indigo-200">
                    <p className="text-xs text-indigo-600 font-medium">
                      {itinerary.activities?.length || 0} 个活动点
                    </p>
                    {/* 详细调试信息 */}
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                        数据调试信息
                      </summary>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                        <div>
                          <strong>兴趣偏好:</strong>
                          <span className="ml-1 font-mono bg-white px-1 rounded">
                            {JSON.stringify(itinerary.interests)}
                          </span>
                        </div>
                        <div>
                          <strong>旅行风格:</strong>
                          <span className="ml-1 font-mono bg-white px-1 rounded">
                            {itinerary.travelStyle}
                          </span>
                        </div>
                        <div>
                          <strong>活动数量:</strong>{" "}
                          {itinerary.activities?.length || 0}
                        </div>
                        <div>
                          <strong>行程ID:</strong>
                          <span className="ml-1 font-mono bg-white px-1 rounded text-xs">
                            {itinerary.id}
                          </span>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 地图设置 */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            地图设置
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    智能路线
                  </span>
                  <span className="ml-2 text-xs text-gray-500">连接景点</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showRoutes}
                    onChange={(e) => {
                      console.log("路线开关状态变更:", e.target.checked);
                      onShowRoutesChange(e.target.checked);
                    }}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      showRoutes ? "bg-indigo-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                        showRoutes ? "translate-x-5" : "translate-x-1"
                      }`}
                    ></div>
                  </div>
                </div>
              </label>
              {showRoutes && (
                <div className="mt-2 text-xs text-indigo-600">
                  路线已启用
                </div>
              )}
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    3D视角
                  </span>
                  <span className="ml-2 text-xs text-gray-500">立体建筑</span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={show3D}
                    onChange={(e) => onShow3DChange(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-6 rounded-full transition-colors ${
                      show3D ? "bg-purple-500" : "bg-gray-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                        show3D ? "translate-x-5" : "translate-x-1"
                      }`}
                    ></div>
                  </div>
                </div>
              </label>
              {show3D && (
                <div className="mt-2 text-xs text-purple-600">
                  3D模式已启用
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 地图样式选择 */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            地图样式
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { mode: "street" as const, label: "街道"},
              { mode: "satellite" as const, label: "卫星"},
              { mode: "terrain" as const, label: "地形"},
            ].map(({ mode, label}) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  viewMode === mode
                    ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-300"
                    : "bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">{icon}</div>
                  <div>{label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 图例 */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
            图例说明
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
              <span className="text-gray-600">景点游览</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-gray-600">餐饮美食</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-violet-500 rounded-full mr-2"></div>
              <span className="text-gray-600">购物娱乐</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-sky-500 rounded-full mr-2"></div>
              <span className="text-gray-600">住宿酒店</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 浮动信息面板
function FloatingInfoPanel({
  selectedItinerary,
  itineraries,
}: {
  selectedItinerary: string | null;
  itineraries: any[];
}) {
  if (!selectedItinerary) return null;

  const itinerary = itineraries.find((i) => i.id === selectedItinerary);
  if (!itinerary) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="absolute top-20 lg:top-24 right-3 lg:right-6 bg-white/95 backdrop-blur-xl rounded-3xl border border-indigo-100/50 p-6 max-w-sm z-50 overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
        boxShadow:
          "0 25px 50px -12px rgba(79, 70, 229, 0.15), 0 0 0 1px rgba(79, 70, 229, 0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">{itinerary.title}</h3>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <div className="w-2 h-2 bg-violet-500 rounded-full"></div>
        </div>
      </div>

      <div className="space-y-3">
        {itinerary.activities.slice(0, 8).map((activity, idx) => (
          <div key={idx} className="flex items-center space-x-3">
            <div
              className={`w-3 h-3 rounded-full ${
                activity.type === "attraction"
                  ? "bg-indigo-500"
                  : activity.type === "restaurant"
                  ? "bg-emerald-500"
                  : activity.type === "shopping"
                  ? "bg-violet-500"
                  : "bg-sky-500"
              }`}
            ></div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {activity.name}
              </div>
              <div className="text-xs text-gray-500">
                第{activity.day}天 · {activity.time}
              </div>
            </div>
          </div>
        ))}
        {itinerary.activities.length > 8 && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            还有 {itinerary.activities.length - 8} 个活动...
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function MapPage() {
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user } = useCurrentUser();
  const { itineraries, isLoading } = useItineraryData(user);

  // 状态管理
  const [selectedItinerary, setSelectedItinerary] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"satellite" | "street" | "terrain">(
    "street"
  );
  const [showRoutes, setShowRoutes] = useState(true);
  const [show3D, setShow3D] = useState(false);

  // 自动选择第一个行程
  useEffect(() => {
    if (itineraries.length > 0 && !selectedItinerary) {
      setSelectedItinerary(itineraries[0].id);
    }
  }, [itineraries, selectedItinerary]);

  const handleDeleteItinerary = async (id: string) => {
    if (!confirm("确定要删除这个行程吗？")) return;

    try {
      const response = await fetch(`/api/itineraries?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 重新加载页面以更新数据
        window.location.reload();
      } else {
        alert("删除失败，请重试");
      }
    } catch (error) {
      console.error("删除行程失败:", error);
      alert("删除失败，请重试");
    }
  };

  // 如果正在加载认证状态，显示加载界面
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">正在验证用户身份...</p>
        </motion.div>
      </div>
    );
  }

  // 如果未认证，不渲染任何内容（useRequireAuth会处理重定向）
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      {/* 现代化背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* 主要装饰圆 */}
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-gradient-to-br from-indigo-200/20 to-blue-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-200/20 to-indigo-300/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* 次要装饰元素 */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-indigo-100/30 to-blue-100/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-100/30 to-indigo-100/30 rounded-full blur-xl"></div>

        {/* 网格背景 */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(79,70,229,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(79,70,229,0.03)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      </div>

      {/* 智能控制面板 */}
      <SmartControlPanel
        itineraries={itineraries}
        selectedItinerary={selectedItinerary}
        onItinerarySelect={setSelectedItinerary}
        onDeleteItinerary={handleDeleteItinerary}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showRoutes={showRoutes}
        onShowRoutesChange={setShowRoutes}
        show3D={show3D}
        onShow3DChange={setShow3D}
      />

      {/* 浮动信息面板 - 显示详细活动信息 - 在右边 */}
      {/* <div className="block">
        <AnimatePresence>
          <FloatingInfoPanel
            selectedItinerary={selectedItinerary}
            itineraries={itineraries}
          />
        </AnimatePresence>
      </div> */}

      {/* 主地图区域 - 右侧 */}
      <div className="absolute top-3 lg:top-6 bottom-3 lg:bottom-6 left-80 lg:left-96 right-3 lg:right-6">
        <div
          className="w-full h-full bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-indigo-100/50 p-3 lg:p-6 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
            boxShadow:
              "0 25px 50px -12px rgba(79, 70, 229, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* 地图装饰边框 */}
          <div className="absolute inset-0 rounded-2xl lg:rounded-3xl bg-gradient-to-r from-indigo-500/5 to-blue-500/5 pointer-events-none"></div>

          <AmapComponent
            selectedItinerary={selectedItinerary}
            itineraryData={itineraries}
            viewMode={viewMode}
            showRoutes={showRoutes}
            show3D={show3D}
          />
        </div>
      </div>

      {/* 现代化顶部标题栏 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        className="absolute top-3 lg:top-6 left-1/2 transform -translate-x-1/2 z-20 px-3"
      >
        <div
          className="bg-white/95 backdrop-blur-xl rounded-2xl lg:rounded-3xl px-4 lg:px-8 py-3 lg:py-4 border border-indigo-100/50 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
            boxShadow:
              "0 20px 40px -12px rgba(79, 70, 229, 0.2), 0 0 0 1px rgba(79, 70, 229, 0.05)",
          }}
        >
          {/* 标题栏装饰 */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 pointer-events-none"></div>
          <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-indigo-200/20 to-blue-200/20 rounded-full blur-xl"></div>

          <div className="relative z-10">
            <h1 className="text-lg lg:text-xl font-bold text-center flex items-center justify-center bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">TravelSync 智能地图</span>
              <span className="sm:hidden">智能地图</span>
            </h1>
            <p className="text-gray-600 text-xs lg:text-sm text-center mt-1 font-medium hidden sm:block">
              沉浸式3D旅行路线可视化体验
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

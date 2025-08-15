// 智能本地化推荐系统
export interface LocalHotspot {
  name: string;
  type: string;
  score: number;
  reason: string;
  price?: number;
}

// 本地化热门景点数据库
export const localHotspots: Record<string, LocalHotspot[]> = {
  '西安': [
    { name: '大唐不夜城', type: '风景名胜', score: 98, reason: '网红打卡圣地', price: 0 },
    { name: '西安钟楼', type: '风景名胜', score: 95, reason: '古城地标', price: 30 },
    { name: '西安鼓楼', type: '风景名胜', score: 95, reason: '历史古迹', price: 30 },
    { name: '大雁塔', type: '风景名胜', score: 92, reason: '佛教圣地', price: 50 },
    { name: '兵马俑', type: '风景名胜', score: 100, reason: '世界奇迹', price: 120 },
    { name: '华清宫', type: '风景名胜', score: 88, reason: '皇家园林', price: 110 },
    { name: '回民街', type: '美食街区', score: 90, reason: '美食天堂', price: 0 },
    { name: '永兴坊', type: '美食街区', score: 85, reason: '陕西美食', price: 0 },
    { name: '西安城墙', type: '风景名胜', score: 88, reason: '古城墙', price: 54 }
  ],
  '邯郸': [
    { name: '娲皇宫', type: '风景名胜', score: 95, reason: '女娲圣地', price: 60 },
    { name: '广府古城', type: '风景名胜', score: 88, reason: '古城风貌', price: 65 },
    { name: '响堂山石窟', type: '风景名胜', score: 85, reason: '石窟艺术', price: 50 },
    { name: '邯郸博物馆', type: '文化场馆', score: 80, reason: '历史文化', price: 0 },
    { name: '丛台公园', type: '公园广场', score: 75, reason: '休闲胜地', price: 0 },
    { name: '美乐城', type: '购物服务', score: 82, reason: '购物中心', price: 0 }
  ],
  '北京': [
    { name: '故宫博物院', type: '风景名胜', score: 100, reason: '皇家宫殿', price: 60 },
    { name: '天安门广场', type: '风景名胜', score: 98, reason: '国家象征', price: 0 },
    { name: '长城', type: '风景名胜', score: 100, reason: '世界奇迹', price: 40 },
    { name: '颐和园', type: '风景名胜', score: 92, reason: '皇家园林', price: 30 },
    { name: '天坛', type: '风景名胜', score: 90, reason: '祭天圣地', price: 15 }
  ],
  '上海': [
    { name: '外滩', type: '风景名胜', score: 98, reason: '城市地标', price: 0 },
    { name: '东方明珠', type: '风景名胜', score: 95, reason: '标志建筑', price: 160 },
    { name: '豫园', type: '风景名胜', score: 88, reason: '古典园林', price: 40 },
    { name: '南京路步行街', type: '购物服务', score: 90, reason: '购物天堂', price: 0 }
  ]
};

// 本地化美食推荐
export const localCuisine: Record<string, LocalHotspot[]> = {
  '西安': [
    { name: '德发长饺子馆', type: '餐饮服务', score: 92, reason: '百年老店', price: 80 },
    { name: '同盛祥泡馍', type: '餐饮服务', score: 90, reason: '泡馍正宗', price: 45 },
    { name: '樊记腊汁肉夹馍', type: '餐饮服务', score: 88, reason: '肉夹馍鼻祖', price: 25 },
    { name: '老孙家泡馍', type: '餐饮服务', score: 85, reason: '传统泡馍', price: 40 },
    { name: '春发生葫芦头', type: '餐饮服务', score: 83, reason: '葫芦头专家', price: 35 }
  ],
  '邯郸': [
    { name: '邯郸烧饼', type: '餐饮服务', score: 85, reason: '地方特色', price: 15 },
    { name: '磁州窑酒楼', type: '餐饮服务', score: 82, reason: '本地名店', price: 60 },
    { name: '古城食府', type: '餐饮服务', score: 80, reason: '古城美食', price: 55 },
    { name: '邯郸饭店', type: '餐饮服务', score: 78, reason: '老字号', price: 50 },
    { name: '丛台酒楼', type: '餐饮服务', score: 76, reason: '传统菜系', price: 45 }
  ],
  '北京': [
    { name: '全聚德烤鸭', type: '餐饮服务', score: 95, reason: '烤鸭名店', price: 200 },
    { name: '东来顺涮羊肉', type: '餐饮服务', score: 90, reason: '涮羊肉鼻祖', price: 150 },
    { name: '便宜坊烤鸭', type: '餐饮服务', score: 88, reason: '百年烤鸭', price: 180 },
    { name: '护国寺小吃', type: '餐饮服务', score: 85, reason: '传统小吃', price: 30 },
    { name: '王府井小吃街', type: '餐饮服务', score: 82, reason: '小吃集合', price: 40 }
  ],
  '上海': [
    { name: '南翔小笼包', type: '餐饮服务', score: 92, reason: '小笼包发源地', price: 50 },
    { name: '老正兴菜馆', type: '餐饮服务', score: 88, reason: '本帮菜名店', price: 120 },
    { name: '绿波廊', type: '餐饮服务', score: 85, reason: '豫园名店', price: 100 },
    { name: '上海老饭店', type: '餐饮服务', score: 83, reason: '传统本帮菜', price: 90 },
    { name: '沈大成', type: '餐饮服务', score: 80, reason: '糕点老店', price: 25 }
  ]
};

// 连锁品牌识别
export const chainBrands = {
  avoid: ['海底捞', '万达', '肯德基', '麦当劳', '星巴克', '如家', '汉庭', '7天', '锦江之星', '必胜客', '真功夫'],
  premium: ['希尔顿', '万豪', '香格里拉', '洲际', '凯悦', '喜来登', '丽思卡尔顿']
};

// 检查是否为连锁品牌
export function isChainBrand(name: string): boolean {
  return [...chainBrands.avoid, ...chainBrands.premium].some(brand => name.includes(brand));
}

// 获取本地热门景点
export function getLocalHotspot(destination: string, index: number, usedIds: Set<string>): LocalHotspot | null {
  const spots = localHotspots[destination] || [];
  const availableSpots = spots.filter(spot => !usedIds.has(spot.name));
  
  if (availableSpots.length === 0) return null;
  
  return availableSpots[index % availableSpots.length];
}

// 获取本地特色餐厅
export function getLocalRestaurant(destination: string, index: number, usedIds: Set<string>): LocalHotspot | null {
  const restaurants = localCuisine[destination] || [];
  const availableRestaurants = restaurants.filter(restaurant => !usedIds.has(restaurant.name));
  
  if (availableRestaurants.length === 0) return null;
  
  return availableRestaurants[index % availableRestaurants.length];
}

// 备用本地餐厅（当API和本地数据都没有时）
export function getFallbackLocalRestaurant(destination: string, index: number): LocalHotspot {
  const fallbackRestaurants = [
    { name: `${destination}特色餐厅`, type: '餐饮服务', score: 75, reason: '本地推荐', price: 60 },
    { name: `${destination}老字号`, type: '餐饮服务', score: 78, reason: '传统美食', price: 55 },
    { name: `${destination}风味馆`, type: '餐饮服务', score: 72, reason: '地方风味', price: 50 },
    { name: `${destination}家常菜`, type: '餐饮服务', score: 70, reason: '家常美味', price: 45 }
  ];
  
  return fallbackRestaurants[index % fallbackRestaurants.length];
}

// 计算智能评分
export function calculateIntelligentScore(poi: any, destination: string): number {
  const name = poi.name || '';
  const type = poi.type || '';
  
  // 1. 检查本地热门景点
  const localSpots = localHotspots[destination] || [];
  for (const spot of localSpots) {
    if (name.includes(spot.name) || spot.name.includes(name)) {
      return spot.score;
    }
  }
  
  // 2. 检查本地特色美食
  const localFood = localCuisine[destination] || [];
  for (const food of localFood) {
    if (name.includes(food.name) || food.name.includes(name)) {
      return food.score;
    }
  }
  
  // 3. 严格降低连锁品牌分数
  if (isChainBrand(name)) {
    if (chainBrands.avoid.some(brand => name.includes(brand))) {
      return 25; // 严重降分
    }
    if (chainBrands.premium.some(brand => name.includes(brand))) {
      return 65; // 适中分数
    }
  }
  
  // 4. 根据类型给基础分数
  if (type.includes('风景名胜')) return 75;
  if (type.includes('文化场馆')) return 70;
  if (type.includes('餐饮服务')) return 65;
  if (type.includes('购物服务')) return 60;
  
  return 50; // 默认分数
}
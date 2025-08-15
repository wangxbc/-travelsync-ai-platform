import { searchAmapPOI } from "./amap";

// 智能推荐系统 - 基于高德API真实数据
export class IntelligentRecommendationSystem {
    // 在 IntelligentRecommendationSystem 类中添加以下方法：

// 获取周边城市景点（当本地景点不足时）
async getNearbyAttractions(city: string): Promise<any[]> {
    try {
      // 获取周边热门景点
      const nearby = await searchAmapPOI({
        city,
        keywords: "周边景点 郊区景点 一日游",
        offset: 15
      });
  
      // 获取自然风光
      const nature = await searchAmapPOI({
        city,
        keywords: "公园 山水 湖泊 温泉",
        offset: 15
      });
  
      const allNearby = [...nearby, ...nature];
      const uniqueNearby = Array.from(
        new Map(allNearby.map(poi => [poi.name, poi])).values()
      );
  
      return uniqueNearby.map(poi => ({
        ...poi,
        intelligentScore: this.calculateAPIBasedScore(poi, city),
        isNearby: true // 标记为周边景点
      })).sort((a, b) => b.intelligentScore - a.intelligentScore);
    } catch (error) {
      console.error(`获取${city}周边景点失败:`, error);
      return [];
    }
  }
  
  // 获取休闲活动场所
  async getLeisureActivities(city: string): Promise<any[]> {
    try {
      const leisure = await searchAmapPOI({
        city,
        keywords: "咖啡厅 书店 公园 广场 休闲",
        offset: 15
      });
  
      return leisure.filter(poi => !this.isChainBrand(poi.name))
        .map(poi => ({
          ...poi,
          intelligentScore: this.calculateAPIBasedScore(poi, city),
          isLeisure: true // 标记为休闲活动
        })).sort((a, b) => b.intelligentScore - a.intelligentScore);
    } catch (error) {
      console.error(`获取${city}休闲活动失败:`, error);
      return [];
    }
  }
  
  // 生成自由活动建议
  generateFreeTimeActivity(city: string, timeSlot: string): any {
    const freeActivities = [
      {
        name: `${city}市区自由漫步`,
        description: "在市中心自由探索，发现隐藏的小店和美景",
        type: "自由活动",
        intelligentScore: 70,
        cost: 0,
        tips: ["建议步行探索", "可随时调整路线", "适合拍照打卡"]
      },
      {
        name: `${city}当地市场体验`,
        description: "逛当地市场，体验本地生活气息",
        type: "文化体验",
        intelligentScore: 75,
        cost: 50,
        tips: ["可以购买特产", "体验当地文化", "品尝街头小食"]
      },
      {
        name: `${city}咖啡厅休憩`,
        description: "在特色咖啡厅休息，享受悠闲时光",
        type: "休闲活动",
        intelligentScore: 65,
        cost: 30,
        tips: ["适合休息调整", "可以规划下一站", "享受当地咖啡文化"]
      }
    ];
  
    const index = Math.floor(Math.random() * freeActivities.length);
    return {
      ...freeActivities[index],
      id: `free_${Math.random().toString(36).slice(2)}`,
      address: `${city}市区`,
      location: "116.4074,39.9042"
    };
  }
  
  // 智能填充活动（当景点不足时）
  async getSmartFillActivities(city: string, neededCount: number): Promise<any[]> {
    const activities = [];
    
    // 1. 先尝试周边景点
    const nearbyAttractions = await this.getNearbyAttractions(city);
    const availableNearby = nearbyAttractions.filter(poi => !this.usedPOIs.has(poi.name));
    
    for (let i = 0; i < Math.min(neededCount, availableNearby.length); i++) {
      activities.push(availableNearby[i]);
      this.usedPOIs.add(availableNearby[i].name);
    }
  
    // 2. 如果还不够，添加休闲活动
    if (activities.length < neededCount) {
      const leisureActivities = await this.getLeisureActivities(city);
      const availableLeisure = leisureActivities.filter(poi => !this.usedPOIs.has(poi.name));
      
      const remaining = neededCount - activities.length;
      for (let i = 0; i < Math.min(remaining, availableLeisure.length); i++) {
        activities.push(availableLeisure[i]);
        this.usedPOIs.add(availableLeisure[i].name);
      }
    }
  
    // 3. 如果还是不够，生成自由活动
    while (activities.length < neededCount) {
      const freeActivity = this.generateFreeTimeActivity(city, "自由时间");
      activities.push(freeActivity);
      this.usedPOIs.add(freeActivity.name);
    }
  
    return activities;
  }
  
  // 获取推荐景点（增强版，支持智能填充和兴趣偏好匹配）
  async getRecommendedAttractionEnhanced(attractions: any[], city: string, interests: string[] = []): Promise<any | null> {
    console.log("🎯 开始智能推荐，用户兴趣偏好:", interests);
    
    // 先尝试主要景点，并根据兴趣偏好排序
    let available = attractions.filter(poi => !this.usedPOIs.has(poi.name));
    
    // 如果有兴趣偏好，优先推荐匹配的景点
    if (interests.length > 0) {
      available = this.sortByInterestMatch(available, interests);
      console.log("✅ 根据兴趣偏好重新排序景点");
    }
    if (available.length > 0) {
      const selected = available[0];
      this.usedPOIs.add(selected.name);
      return selected;
    }
  
    // 如果主要景点用完了，尝试智能填充
    const fillActivities = await this.getSmartFillActivities(city, 1);
    return fillActivities.length > 0 ? fillActivities[0] : null;
  }
  
  private usedPOIs = new Set<string>();
  private cityHotspots: Record<string, any[]> = {};

  // 获取城市热门景点（优先从API获取）
  async getCityHotspots(city: string): Promise<any[]> {
    if (this.cityHotspots[city]) {
      return this.cityHotspots[city];
    }

    try {
      // 1. 获取5A/4A景区
      const topAttractions = await searchAmapPOI({
        city,
        keywords: "5A景区 4A景区 著名景点",
        offset: 20
      });

      // 2. 获取热门景点
      const hotspots = await searchAmapPOI({
        city,
        keywords: "热门景点 必游景点 网红打卡",
        offset: 20
      });

      // 3. 获取文化景点
      const cultural = await searchAmapPOI({
        city,
        keywords: "博物馆 古迹 文化遗址",
        offset: 15
      });

      // 合并并去重
      const allAttractions = [...topAttractions, ...hotspots, ...cultural];
      const uniqueAttractions = Array.from(
        new Map(allAttractions.map(poi => [poi.name, poi])).values()
      );

      // 按热门度排序（利用高德API的weight排序 + 自定义评分）
      const scoredAttractions = uniqueAttractions.map(poi => ({
        ...poi,
        intelligentScore: this.calculateAPIBasedScore(poi, city)
      })).sort((a, b) => b.intelligentScore - a.intelligentScore);

      this.cityHotspots[city] = scoredAttractions;
      return scoredAttractions;
    } catch (error) {
      console.error(`获取${city}热门景点失败:`, error);
      return [];
    }
  }

  // 获取本地特色餐厅
  async getCityRestaurants(city: string): Promise<any[]> {
    try {
      // 1. 获取老字号餐厅
      const traditional = await searchAmapPOI({
        city,
        keywords: "老字号 特色餐厅 本地美食",
        offset: 15
      });

      // 2. 获取高评分餐厅
      const popular = await searchAmapPOI({
        city,
        keywords: "人气餐厅 网红餐厅 必吃美食",
        offset: 15
      });

      // 合并并过滤连锁品牌
      const allRestaurants = [...traditional, ...popular];
      const localRestaurants = allRestaurants.filter(poi => 
        !this.isChainBrand(poi.name)
      );

      const uniqueRestaurants = Array.from(
        new Map(localRestaurants.map(poi => [poi.name, poi])).values()
      );

      return uniqueRestaurants.map(poi => ({
        ...poi,
        intelligentScore: this.calculateAPIBasedScore(poi, city)
      })).sort((a, b) => b.intelligentScore - a.intelligentScore);
    } catch (error) {
      console.error(`获取${city}特色餐厅失败:`, error);
      return [];
    }
  }

  // 基于API数据计算智能评分
  private calculateAPIBasedScore(poi: any, city: string): number {
    let score = 50; // 基础分

    // 1. 利用高德API的热门度（通过weight排序体现）
    if (poi.popularity_score) {
      score += poi.popularity_score * 0.3;
    }

    // 2. 评分加成
    if (poi.rating) {
      score += poi.rating * 10; // 4.5分 = +45分
    }

    // 3. POI类型加成
    const type = poi.type || '';
    if (type.includes('风景名胜') || type.includes('旅游景点')) {
      score += 25;
    } else if (type.includes('文化场馆')) {
      score += 20;
    } else if (type.includes('餐饮服务')) {
      score += 15;
    }

    // 4. 商圈位置加成
    const businessArea = poi.business_area || '';
    if (businessArea.includes('市中心') || businessArea.includes('CBD')) {
      score += 15;
    }

    // 5. 名称特征加成
    const name = poi.name || '';
    if (name.includes('博物馆') || name.includes('古城') || name.includes('遗址')) {
      score += 20;
    }
    if (name.includes('公园') || name.includes('广场')) {
      score += 10;
    }

    // 6. 严格降低连锁品牌分数
    if (this.isChainBrand(name)) {
      score = Math.min(score, 40); // 连锁品牌最高40分
    }

    return Math.min(score, 100);
  }

  // 检查是否为连锁品牌
  private isChainBrand(name: string): boolean {
    const chainBrands = [
      '海底捞', '万达', '肯德基', '麦当劳', '星巴克', '必胜客', 
      '真功夫', '如家', '汉庭', '7天', '锦江之星'
    ];
    return chainBrands.some(brand => name.includes(brand));
  }

  // 获取推荐景点（避免重复，支持兴趣偏好）
  getRecommendedAttraction(attractions: any[], interests: string[] = []): any | null {
    let available = attractions.filter(poi => !this.usedPOIs.has(poi.name));
    if (available.length === 0) return null;
    
    // 如果有兴趣偏好，优先推荐匹配的景点
    if (interests.length > 0) {
      available = this.sortByInterestMatch(available, interests);
      console.log("🎯 根据兴趣偏好优化景点推荐");
    }
    
    const selected = available[0]; // 已按分数排序，取第一个
    this.usedPOIs.add(selected.name);
    return selected;
  }

  // 根据兴趣偏好排序景点
  sortByInterestMatch(pois: any[], interests: string[]): any[] {
    return pois.map(poi => {
      let interestScore = 0;
      const matchedInterests: string[] = [];
      
      // 计算兴趣匹配分数
      for (const interest of interests) {
        if (this.matchesInterest(poi.name, poi.type || '', interest)) {
          interestScore += 20; // 每个匹配的兴趣加20分
          matchedInterests.push(interest);
        }
      }
      
      return {
        ...poi,
        interestScore,
        matchedInterests,
        intelligentScore: (poi.intelligentScore || 0) + interestScore
      };
    }).sort((a, b) => b.intelligentScore - a.intelligentScore);
  }
  
  // 判断POI是否匹配特定兴趣
  matchesInterest(poiName: string, poiType: string, interest: string): boolean {
    const name = poiName.toLowerCase();
    const type = poiType.toLowerCase();
    
    switch (interest) {
      case '历史文化':
        return name.includes('博物馆') || name.includes('文化') || name.includes('历史') || 
               name.includes('古') || name.includes('寺') || name.includes('庙') ||
               type.includes('文物') || type.includes('历史') || type.includes('文化');
               
      case '自然风光':
        return name.includes('公园') || name.includes('山') || name.includes('湖') || 
               name.includes('园') || name.includes('森林') || name.includes('海') ||
               type.includes('公园') || type.includes('风景') || type.includes('自然');
               
      case '美食体验':
        return name.includes('餐') || name.includes('食') || name.includes('厅') || 
               name.includes('楼') || name.includes('小吃') || name.includes('美食') ||
               type.includes('餐饮') || type.includes('美食');
               
      case '购物娱乐':
        return name.includes('商') || name.includes('购物') || name.includes('万达') || 
               name.includes('银泰') || name.includes('广场') || name.includes('中心') ||
               type.includes('购物') || type.includes('商场');
               
      case '艺术博物馆':
        return name.includes('艺术') || name.includes('博物馆') || name.includes('美术') ||
               name.includes('画廊') || name.includes('展览') ||
               type.includes('艺术') || type.includes('博物馆');
               
      case '户外运动':
        return name.includes('运动') || name.includes('体育') || name.includes('健身') ||
               name.includes('游泳') || name.includes('球') ||
               type.includes('体育') || type.includes('运动');
               
      case '夜生活':
        return name.includes('酒吧') || name.includes('KTV') || name.includes('夜市') ||
               name.includes('酒店') || name.includes('娱乐') ||
               type.includes('娱乐') || type.includes('夜生活');
               
      case '摄影':
        return name.includes('摄影') || name.includes('观景') || name.includes('风景') ||
               name.includes('塔') || name.includes('台') ||
               type.includes('观景') || type.includes('摄影');
               
      default:
        return false;
    }
  }

  // 获取推荐餐厅（避免重复，支持兴趣偏好）
  getRecommendedRestaurant(restaurants: any[], interests: string[] = []): any | null {
    let available = restaurants.filter(poi => !this.usedPOIs.has(poi.name));
    if (available.length === 0) return null;
    
    // 如果有美食体验兴趣，优先推荐特色餐厅
    if (interests.includes('美食体验')) {
      available = this.sortByInterestMatch(available, interests);
      console.log("🍜 根据美食兴趣优化餐厅推荐");
    }
    
    const selected = available[0];
    this.usedPOIs.add(selected.name);
    return selected;
  }

  // 重置已使用POI（新的行程规划时调用）
  reset() {
    this.usedPOIs.clear();
  }
}

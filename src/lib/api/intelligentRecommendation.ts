import { searchAmapPOI } from './amap';

export class IntelligentRecommendationSystem {
  async getNearbyAttractions(city: string): Promise<any[]> {
    try {
      const nearby = await searchAmapPOI({
        city,
        keywords: "周边景点 郊区景点 一日游",
        offset: 15
      });

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
        isNearby: true
      })).sort((a, b) => b.intelligentScore - a.intelligentScore);
    } catch (error) {
      console.error(`获取${city}周边景点失败:`, error);
      return [];
    }
  }

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
          isLeisure: true
        })).sort((a, b) => b.intelligentScore - a.intelligentScore);
    } catch (error) {
      console.error(`获取${city}休闲活动失败:`, error);
      return [];
    }
  }

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

  async getSmartFillActivities(city: string, neededCount: number): Promise<any[]> {
    const activities = [];
    
    const nearbyAttractions = await this.getNearbyAttractions(city);
    const availableNearby = nearbyAttractions.filter(poi => !this.usedPOIs.has(poi.name));
    
    for (let i = 0; i < Math.min(neededCount, availableNearby.length); i++) {
      activities.push(availableNearby[i]);
      this.usedPOIs.add(availableNearby[i].name);
    }

    if (activities.length < neededCount) {
      const leisureActivities = await this.getLeisureActivities(city);
      const availableLeisure = leisureActivities.filter(poi => !this.usedPOIs.has(poi.name));
      
      const remaining = neededCount - activities.length;
      for (let i = 0; i < Math.min(remaining, availableLeisure.length); i++) {
        activities.push(availableLeisure[i]);
        this.usedPOIs.add(availableLeisure[i].name);
      }
    }

    while (activities.length < neededCount) {
      const freeActivity = this.generateFreeTimeActivity(city, "自由时间");
      activities.push(freeActivity);
      this.usedPOIs.add(freeActivity.name);
    }

    return activities;
  }

  async getRecommendedAttractionEnhanced(attractions: any[], city: string, interests: string[] = []): Promise<any | null> {
    
    let available = attractions.filter(poi => !this.usedPOIs.has(poi.name));
    
    if (interests.length > 0) {
      available = this.sortByInterestMatch(available, interests);
    }
    if (available.length > 0) {
      const selected = available[0];
      this.usedPOIs.add(selected.name);
      return selected;
    }

    const fillActivities = await this.getSmartFillActivities(city, 1);
    return fillActivities.length > 0 ? fillActivities[0] : null;
  }

  private usedPOIs = new Set<string>();
  private cityHotspots: Record<string, any[]> = {};

  async getCityHotspots(city: string): Promise<any[]> {
    if (this.cityHotspots[city]) {
      return this.cityHotspots[city];
    }

    try {
      const topAttractions = await searchAmapPOI({
        city,
        keywords: "5A景区 4A景区 著名景点",
        offset: 20
      });

      const hotspots = await searchAmapPOI({
        city,
        keywords: "热门景点 必游景点 网红打卡",
        offset: 20
      });

      const cultural = await searchAmapPOI({
        city,
        keywords: "博物馆 古迹 文化遗址",
        offset: 15
      });

      const allAttractions = [...topAttractions, ...hotspots, ...cultural];
      const uniqueAttractions = Array.from(
        new Map(allAttractions.map(poi => [poi.name, poi])).values()
      );

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

  async getCityRestaurants(city: string): Promise<any[]> {
    try {
      const traditional = await searchAmapPOI({
        city,
        keywords: "老字号 特色餐厅 本地美食",
        offset: 15
      });

      const popular = await searchAmapPOI({
        city,
        keywords: "人气餐厅 网红餐厅 必吃美食",
        offset: 15
      });

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

  private calculateAPIBasedScore(poi: any, city: string): number {
    let score = 50;

    if (poi.popularity_score) {
      score += poi.popularity_score * 0.3;
    }

    if (poi.rating) {
      score += poi.rating * 10;
    }

    const type = poi.type || '';
    if (type.includes('风景名胜') || type.includes('旅游景点')) {
      score += 25;
    } else if (type.includes('文化场馆')) {
      score += 20;
    } else if (type.includes('餐饮服务')) {
      score += 15;
    }

    const businessArea = poi.business_area || '';
    if (businessArea.includes('市中心') || businessArea.includes('CBD')) {
      score += 15;
    }

    const name = poi.name || '';
    if (name.includes('博物馆') || name.includes('古城') || name.includes('遗址')) {
      score += 20;
    }
    if (name.includes('公园') || name.includes('广场')) {
      score += 10;
    }

    if (this.isChainBrand(name)) {
      score = Math.min(score, 40);
    }

    return Math.min(score, 100);
  }

  private isChainBrand(name: string): boolean {
    const chainBrands = [
      '海底捞', '万达', '肯德基', '麦当劳', '星巴克', '必胜客', 
      '真功夫', '如家', '汉庭', '7天', '锦江之星'
    ];
    return chainBrands.some(brand => name.includes(brand));
  }

  getRecommendedAttraction(attractions: any[], interests: string[] = []): any | null {
    let available = attractions.filter(poi => !this.usedPOIs.has(poi.name));
    if (available.length === 0) return null;
    
    if (interests.length > 0) {
      available = this.sortByInterestMatch(available, interests);
    }
    
    const selected = available[0];
    this.usedPOIs.add(selected.name);
    return selected;
  }

  sortByInterestMatch(pois: any[], interests: string[]): any[] {
    return pois.map(poi => {
      let interestScore = 0;
      const matchedInterests: string[] = [];
      
      for (const interest of interests) {
        if (this.matchesInterest(poi.name, poi.type || '', interest)) {
          interestScore += 20;
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

  getRecommendedRestaurant(restaurants: any[], interests: string[] = []): any | null {
    let available = restaurants.filter(poi => !this.usedPOIs.has(poi.name));
    if (available.length === 0) return null;
    
    if (interests.includes('美食体验')) {
      available = this.sortByInterestMatch(available, interests);
    }
    
    const selected = available[0];
    this.usedPOIs.add(selected.name);
    return selected;
  }

  reset() {
    this.usedPOIs.clear();
  }
}

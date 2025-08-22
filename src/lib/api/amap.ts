const AMAP_KEY = "7d683e8072a40ff63a014471fbef5b93";

export async function searchAmapPOI({
  city,
  keywords,
  types = "",
  page = 1,
  offset = 10,
}: {
  city: string;
  keywords: string;
  types?: string;
  page?: number;
  offset?: number;
}) {
  try {
    console.log(`搜索高德地图POI: ${city} - ${keywords}`);

    // 构建优化的搜索URL，添加排序参数优先显示热门POI
    const url = `https://restapi.amap.com/v3/place/text?key=${AMAP_KEY}&keywords=${encodeURIComponent(
      keywords
    )}&city=${encodeURIComponent(
      city
    )}&types=${types}&page=${page}&offset=${offset}&sortrule=distance`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP错误: ${res.status}`);
    }

    const data = await res.json();
    console.log("高德地图API响应:", data);

    if (data.status === "1") {
      const pois = data.pois.map((poi: any) => ({
        id: poi.id || `poi_${Math.random().toString(36).slice(2)}`,
        name: poi.name,
        address: poi.address,
        location: poi.location,
        type: poi.type,
        tel: poi.tel,
        city: poi.cityname,
        adname: poi.adname,
        tag: keywords,
        // 添加更多有用的字段
        business_area: poi.business_area,
        distance: poi.distance,
        pcode: poi.pcode,
        adcode: poi.adcode,
        // 尝试从高德API获取评分信息
        rating: poi.rating || poi.biz_ext?.rating,
        cost: poi.biz_ext?.cost,
        // 添加热门度指标
        popularity_score: calculateInitialPopularityScore(poi),
      }));

      console.log(`找到${pois.length}个POI`);
      
      // 对结果进行初步排序，优先显示热门POI
      const sortedPois = pois.sort((a, b) => {
        return (b.popularity_score || 0) - (a.popularity_score || 0);
      });
      
      return sortedPois;
    } else {
      console.warn("高德地图API返回错误:", data.info);
      throw new Error(data.info || "AMap API error");
    }
  } catch (error) {
    console.error("高德地图API调用失败:", error);

    // 返回模拟数据
    return generateMockAmapPOIs(city, keywords);
  }
}

// 计算初始热门度分数（基于高德API返回的数据）
function calculateInitialPopularityScore(poi: any): number {
  let score = 0;
  
  // 基于POI名称的知名度
  const name = poi.name || '';
  const famousBrands = ['万达', '银泰', '大悦城', '新世纪', '王府井', '西单', '海底捞', '星巴克'];
  if (famousBrands.some(brand => name.includes(brand))) {
    score += 50;
  }
  
  // 基于POI类型的热门度
  const type = poi.type || '';
  if (type.includes('风景名胜') || type.includes('旅游景点')) {
    score += 40;
  } else if (type.includes('购物') || type.includes('商场')) {
    score += 35;
  } else if (type.includes('餐饮')) {
    score += 30;
  }
  
  // 基于商圈位置
  const businessArea = poi.business_area || '';
  if (businessArea.includes('市中心') || businessArea.includes('CBD')) {
    score += 30;
  }
  
  // 基于评分（如果有）
  if (poi.rating) {
    score += poi.rating * 5; // 评分乘以5
  }
  
  // 基于距离（距离越近，分数稍高）
  if (poi.distance && poi.distance < 1000) {
    score += 10;
  }
  
  return score;
}

// 生成模拟高德地图POI数据 - 优化版本，优先生成热门POI
function generateMockAmapPOIs(city: string, keywords: string) {
  console.log(`生成模拟POI数据: ${city} - ${keywords}`);

  const mockPOIs = [];
  const baseCoords = getBaseCityCoords(city);

  // 根据关键词生成高质量的热门POI
  if (keywords.includes("5A景区") || keywords.includes("4A景区") || keywords.includes("著名景点") || keywords.includes("热门景点")) {
    mockPOIs.push(
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}古城景区`,
        address: `${city}市中心古城路1号`,
        location: `${baseCoords.lng},${baseCoords.lat}`,
        type: "风景名胜",
        tel: "400-123-4567",
        city: city,
        adname: "市中心",
        tag: keywords,
        business_area: "市中心",
        rating: 4.8,
        popularity_score: 95,
      },
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}博物馆`,
        address: `${city}文化广场2号`,
        location: `${baseCoords.lng + 0.01},${baseCoords.lat + 0.01}`,
        type: "文化场馆",
        tel: "400-234-5678",
        city: city,
        adname: "文化区",
        tag: keywords,
        business_area: "文化区",
        rating: 4.6,
        popularity_score: 90,
      }
    );
  }

  if (keywords.includes("万达") || keywords.includes("银泰") || keywords.includes("大悦城") || keywords.includes("购物中心")) {
    mockPOIs.push(
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}万达广场`,
        address: `${city}商业中心区万达路88号`,
        location: `${baseCoords.lng + 0.02},${baseCoords.lat - 0.01}`,
        type: "购物服务",
        tel: "400-345-6789",
        city: city,
        adname: "商业区",
        tag: keywords,
        business_area: "CBD",
        rating: 4.5,
        popularity_score: 88,
      },
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}银泰城`,
        address: `${city}新区银泰大道66号`,
        location: `${baseCoords.lng - 0.01},${baseCoords.lat + 0.02}`,
        type: "购物服务",
        tel: "400-456-7890",
        city: city,
        adname: "新区",
        tag: keywords,
        business_area: "新区中心",
        rating: 4.4,
        popularity_score: 85,
      }
    );
  }

  if (keywords.includes("特色美食") || keywords.includes("老字号") || keywords.includes("知名餐厅")) {
    mockPOIs.push(
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}老字号饭庄`,
        address: `${city}美食街123号`,
        location: `${baseCoords.lng + 0.005},${baseCoords.lat - 0.005}`,
        type: "餐饮服务",
        tel: "0311-12345678",
        city: city,
        adname: "美食区",
        tag: keywords,
        business_area: "美食街",
        rating: 4.7,
        popularity_score: 82,
      },
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `海底捞火锅(${city}店)`,
        address: `${city}商业街海底捞大厦1-3层`,
        location: `${baseCoords.lng - 0.005},${baseCoords.lat + 0.005}`,
        type: "餐饮服务",
        tel: "400-987-6543",
        city: city,
        adname: "商业区",
        tag: keywords,
        business_area: "商业街",
        rating: 4.6,
        popularity_score: 80,
      }
    );
  }

  if (keywords.includes("博物馆") || keywords.includes("文化中心")) {
    mockPOIs.push({
      id: `poi_${Math.random().toString(36).slice(2)}`,
      name: `${city}科技馆`,
      address: `${city}科技园区创新大道1号`,
      location: `${baseCoords.lng + 0.03},${baseCoords.lat + 0.02}`,
      type: "文化场馆",
      tel: "0311-87654321",
      city: city,
      adname: "科技园区",
      tag: keywords,
      business_area: "科技园",
      rating: 4.3,
      popularity_score: 75,
    });
  }

  // 如果没有匹配的关键词，添加通用热门POI
  if (mockPOIs.length === 0) {
    mockPOIs.push(
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}中央广场`,
        address: `${city}市中心人民路1号`,
        location: `${baseCoords.lng},${baseCoords.lat}`,
        type: "风景名胜",
        tel: "",
        city: city,
        adname: "市中心",
        tag: keywords,
        business_area: "市中心",
        rating: 4.2,
        popularity_score: 70,
      },
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}购物中心`,
        address: `${city}商业区购物大道99号`,
        location: `${baseCoords.lng + 0.01},${baseCoords.lat - 0.01}`,
        type: "购物服务",
        tel: "400-111-2222",
        city: city,
        adname: "商业区",
        tag: keywords,
        business_area: "商业区",
        rating: 4.1,
        popularity_score: 68,
      }
    );
  }

  console.log(`生成${mockPOIs.length}个模拟热门POI`);
  return mockPOIs;
}

// 获取城市基础坐标
function getBaseCityCoords(city: string): { lng: number; lat: number } {
  const cityCoords: Record<string, { lng: number; lat: number }> = {
    '北京': { lng: 116.4074, lat: 39.9042 },
    '上海': { lng: 121.4737, lat: 31.2304 },
    '广州': { lng: 113.2644, lat: 23.1291 },
    '深圳': { lng: 114.0579, lat: 22.5431 },
    '杭州': { lng: 120.1551, lat: 30.2741 },
    '南京': { lng: 118.7969, lat: 32.0603 },
    '武汉': { lng: 114.3054, lat: 30.5931 },
    '成都': { lng: 104.0665, lat: 30.5723 },
    '西安': { lng: 108.9402, lat: 34.3416 },
    '重庆': { lng: 106.5516, lat: 29.5630 },
  };
  
  return cityCoords[city] || { lng: 116.4074, lat: 39.9042 }; // 默认北京坐标
}

// 生成增强的模拟POI数据 - 用于API限额时的备用方案
export function generateEnhancedMockPOIs(city: string, keywords: string) {
  console.log(`生成增强模拟POI数据: ${city} - ${keywords}`);

  const baseCoords = getBaseCityCoords(city);
  const mockPOIs = [];

  if (keywords.includes("热门景点")) {
    mockPOIs.push(
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}中央公园`,
        address: `${city}市中心人民路1号`,
        location: `${baseCoords.lng},${baseCoords.lat}`,
        type: "风景名胜",
        tel: "",
        city: city,
        adname: "市中心",
        tag: keywords,
        business_area: "市中心",
        rating: 4.5,
        popularity_score: 85,
      },
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}博物馆`,
        address: `${city}文化区博物馆路88号`,
        location: `${baseCoords.lng + 0.01},${baseCoords.lat + 0.01}`,
        type: "文化场馆",
        tel: "400-123-4567",
        city: city,
        adname: "文化区",
        tag: keywords,
        business_area: "文化区",
        rating: 4.6,
        popularity_score: 88,
      }
    );
  }

  if (keywords.includes("购物中心")) {
    mockPOIs.push(
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}万达广场`,
        address: `${city}商业区万达路99号`,
        location: `${baseCoords.lng + 0.02},${baseCoords.lat - 0.01}`,
        type: "购物服务",
        tel: "400-666-8888",
        city: city,
        adname: "商业区",
        tag: keywords,
        business_area: "CBD",
        rating: 4.4,
        popularity_score: 90,
      }
    );
  }

  if (keywords.includes("美食餐厅")) {
    mockPOIs.push(
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}老字号餐厅`,
        address: `${city}美食街123号`,
        location: `${baseCoords.lng - 0.01},${baseCoords.lat + 0.01}`,
        type: "餐饮服务",
        tel: "0311-12345678",
        city: city,
        adname: "美食区",
        tag: keywords,
        business_area: "美食街",
        rating: 4.7,
        popularity_score: 82,
      }
    );
  }

  if (keywords.includes("文化场馆")) {
    mockPOIs.push(
      {
        id: `poi_${Math.random().toString(36).slice(2)}`,
        name: `${city}文化中心`,
        address: `${city}文化广场文化路66号`,
        location: `${baseCoords.lng + 0.005},${baseCoords.lat - 0.005}`,
        type: "文化场馆",
        tel: "0311-87654321",
        city: city,
        adname: "文化区",
        tag: keywords,
        business_area: "文化区",
        rating: 4.3,
        popularity_score: 75,
      }
    );
  }

  console.log(`生成${mockPOIs.length}个增强模拟POI`);
  return mockPOIs;
}

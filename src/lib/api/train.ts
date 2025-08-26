const JUHE_TRAIN_KEY = "cbd64f674e1cb94190ad5a5cb32e3035";

export async function searchTrainTickets({ start, end, date }) {
  try {
    console.log(`搜索火车票: ${start} → ${end} (${date})`);

    const url = `http://apis.juhe.cn/train/s2swithprice?start=${encodeURIComponent(
      start
    )}&end=${encodeURIComponent(end)}&date=${encodeURIComponent(
      date
    )}&key=${JUHE_TRAIN_KEY}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP错误: ${res.status}`);
    }

    const data = await res.json();
    console.log("火车票API响应:", data);

    if (data.resultcode === "200" && data.result && data.result.list) {
      const trains = data.result.list.map((item) => ({
        trainNo: item.train_no,
        startStation: item.start_station,
        endStation: item.end_station,
        startTime: item.start_time,
        endTime: item.end_time,
        duration: item.run_time,
        price: item.price_list,
        seatTypes: item.seat_types,
      }));

      console.log(`找到${trains.length}趟列车`);
      return trains;
    } else {
      console.warn("火车票API返回错误:", data.reason);
      throw new Error(data.reason || "Train API error");
    }
  } catch (error) {
    console.error("火车票API调用失败:", error);

    // 返回模拟数据
    return generateMockTrainTickets(start, end, date);
  }
}

// 生成模拟火车票数据
function generateMockTrainTickets(start: string, end: string, date: string) {
  console.log(`生成模拟火车票数据: ${start} → ${end}`);

  const mockTrains = [
    {
      trainNo: "G1234",
      startStation: start || "北京",
      endStation: end,
      startTime: "08:00",
      endTime: "10:30",
      duration: "2小时30分",
      price: [
        { seat: "二等座", price: 120 },
        { seat: "一等座", price: 200 },
        { seat: "商务座", price: 380 },
      ],
      seatTypes: "一等座,二等座,商务座",
    },
    {
      trainNo: "D5678",
      startStation: start || "北京",
      endStation: end,
      startTime: "14:30",
      endTime: "17:15",
      duration: "2小时45分",
      price: [
        { seat: "二等座", price: 100 },
        { seat: "一等座", price: 160 },
      ],
      seatTypes: "一等座,二等座",
    },
    {
      trainNo: "K9999",
      startStation: start || "北京",
      endStation: end,
      startTime: "22:00",
      endTime: "06:30",
      duration: "8小时30分",
      price: [
        { seat: "硬座", price: 50 },
        { seat: "硬卧", price: 120 },
        { seat: "软卧", price: 180 },
      ],
      seatTypes: "硬座,硬卧,软卧",
    },
  ];

  console.log(`生成${mockTrains.length}趟模拟列车`);
  return mockTrains;
}

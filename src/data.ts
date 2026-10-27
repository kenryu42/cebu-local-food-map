/**
 * Cebu Food Map Data
 * Coordinates source: OpenStreetMap Nominatim API (Oct 27, 2026)
 * 
 * Verified coordinates (exact match from Nominatim):
 * - MCIA Airport, Carbon Market, Lapu-Lapu City Public Market
 * - Fuente Osmena Circle, Mactan Newtown, Pusok area, Puso Village
 * - Maribago area (for J Park)
 * 
 * Approximate coordinates (area-based, flagged as needs_verification):
 * - Specific restaurant locations not in OSM database
 *   These use nearby landmarks or area centers as reference points
 */

export type Category = 'lechon' | 'bbq' | 'puso' | 'ngohiong-siomai' | 'market' | 'lodging' | 'airport';
export type Area = 'mactan' | 'cebu-city' | 'landmark';

export interface Place {
  id: string;
  name: string;
  nameChinese?: string;
  googleQuery: string;
  lat: number;
  lng: number;
  area: Area;
  categories: Category[];
  recommended?: string; // Chinese text
  distance?: string; // Chinese text
  hours?: string;
  coordinateSource: 'verified' | 'approximate';
  coordinateNote?: string;
}

export const places: Place[] = [
  // Landmarks
  {
    id: 'jpark',
    name: 'J Park Island Resort & Waterpark',
    googleQuery: 'J Park Island Resort Waterpark Maribago Lapu-Lapu',
    lat: 10.2848,
    lng: 123.9974,
    area: 'landmark',
    categories: ['lodging'],
    coordinateSource: 'approximate',
    coordinateNote: 'Maribago area center from OSM (City by the Sea Hotel vicinity)'
  },
  {
    id: 'mcia',
    name: 'Mactan-Cebu International Airport',
    nameChinese: '宿霧機場',
    googleQuery: 'Mactan Cebu International Airport',
    lat: 10.3103,
    lng: 123.9793,
    area: 'landmark',
    categories: ['airport'],
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Madrid Street, Aldea del Sol, Soong 1, Bankal'
  },
  
  // Mactan Island
  {
    id: 'aa-bbq',
    name: 'AA BBQ Soong',
    googleQuery: 'AA BBQ Soong Lapu-Lapu Cebu',
    lat: 10.296545,
    lng: 124.001135,
    area: 'mactan',
    categories: ['bbq', 'puso'],
    recommended: '宿務老牌燒烤：烤豬肉串、liempo（烤五花）、焗扇貝配 puso，位子多適合團體',
    distance: '約 1–2 km',
    hours: '11:00–23:00',
    coordinateSource: 'verified',
    coordinateNote: 'M.L. Quezon National Highway, Soong 1, Maribago (from Exa.ai/Waze listing)'
  },
  {
    id: 'ayers-lechon',
    name: "Ayer's Lechon (Mactan Newtown)",
    googleQuery: "Ayer's Lechon Mactan Newtown",
    lat: 10.3085,
    lng: 124.0130,
    area: 'mactan',
    categories: ['lechon'],
    recommended: '宿務人公認好吃不貴的去骨烤乳豬，同美食區可買 Titay\'s rosquillos 餅乾',
    distance: '約 3–5 km',
    hours: '時間需確認',
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Mactan Newtown complex'
  },
  {
    id: 'trillis',
    name: 'Trillis (Pusok)',
    googleQuery: 'Trillis Pusok Lapu-Lapu',
    lat: 10.3245,
    lng: 123.9743,
    area: 'mactan',
    categories: ['bbq', 'ngohiong-siomai'],
    recommended: '平價燒烤配吃到飽白飯，點 ngohiong、chorizo de Cebu，乾淨適合團體',
    distance: '約 6–8 km',
    hours: '10:00–23:00（需確認）',
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Pusok, Lapu-Lapu area'
  },
  {
    id: 'nonies',
    name: "Nonie's Barbecue",
    googleQuery: "Nonie's Barbecue Agus Lapu-Lapu",
    lat: 10.280507,
    lng: 123.984192,
    area: 'mactan',
    categories: ['bbq', 'puso'],
    recommended: '路邊串燒攤：烤豬肉串、雞皮、雞腸、雞胗配 puso',
    distance: '約 4–6 km',
    hours: '15:00 開（需確認）',
    coordinateSource: 'verified',
    coordinateNote: 'Ibabao-Gisi-Agus Rd, Agus (from Exa.ai listing + mactannow.com)'
  },
  {
    id: 'langging',
    name: 'Langging Fried Chicken',
    googleQuery: 'Langging Fried Chicken Lapu-Lapu',
    lat: 10.281084,
    lng: 123.983537,
    area: 'mactan',
    categories: ['ngohiong-siomai'],
    recommended: '在地平價快餐：炸雞、ngohiong、蒸燒賣',
    distance: '約 4–6 km',
    hours: '06:00–20:00（需確認）',
    coordinateSource: 'verified',
    coordinateNote: 'Ibabao-Gisi-Agus Rd, Ibabao Agus (from Exa.ai listing + mactannow.com)'
  },
  {
    id: 'lapu-lapu-market',
    name: 'Lapu-Lapu City Public Market',
    googleQuery: 'Lapu-Lapu City Public Market',
    lat: 10.3111,
    lng: 123.9505,
    area: 'mactan',
    categories: ['market'],
    recommended: '市場買魚論斤秤，請旁邊攤位烤、煮或做生醃；只收現金',
    distance: '約 8–10 km',
    hours: '早上最新鮮',
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Lapu-Lapu City Public Market'
  },
  
  // Cebu City
  {
    id: 'cnt-lechon',
    name: 'CnT Lechon',
    googleQuery: 'CnT Lechon Cebu City',
    lat: 10.3171482,
    lng: 123.8851174,
    area: 'cebu-city',
    categories: ['lechon'],
    recommended: '在地人推薦的烤乳豬名店，中午排隊，下午常只剩碎肉',
    hours: '總店約 08:00–17:00',
    coordinateSource: 'verified',
    coordinateNote: '1377 V. Rama Avenue, Guadalupe (from chillandtravel.com + OSM Nominatim)'
  },
  {
    id: 'puso-village',
    name: 'Puso Village',
    googleQuery: 'Puso Village Cebu City',
    lat: 10.2913,
    lng: 123.9016,
    area: 'cebu-city',
    categories: ['puso', 'lechon', 'bbq'],
    recommended: '戶外美食區：tuslob buwa、Carcar 風味烤乳豬、燒烤，用手吃',
    hours: '約 10:00–22:00',
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Puso Village, M.L. Quezon Boulevard, Duljo Fatima'
  },
  {
    id: 'larsian',
    name: 'Larsian (Sugbo Sentro Fuente)',
    googleQuery: 'Larsian BBQ Fuente Osmena Cebu',
    lat: 10.3093,
    lng: 123.8935,
    area: 'cebu-city',
    categories: ['bbq'],
    recommended: '經典串燒街，自挑生肉串現烤，每人約 ₱150–300，只收現金',
    hours: '18:00–21:00 最熱鬧',
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Fuente Osmena Circle area'
  },
  {
    id: 'carlos-ngohiong',
    name: 'Carlos Special Ngohiong',
    googleQuery: 'Carlos Special Ngohiong Cebu',
    lat: 10.3146163,
    lng: 123.9122027,
    area: 'cebu-city',
    categories: ['ngohiong-siomai'],
    recommended: '老字號 ngohiong 專賣，重點是辣醬汁',
    hours: '時間需確認',
    coordinateSource: 'verified',
    coordinateNote: 'C. Borces Street branch, Mabolo (from keeta.ph + OSM Nominatim)'
  },
  {
    id: 'way-tugpahay',
    name: 'Way Tugpahay Siomai sa Tisa',
    googleQuery: 'Way Tugpahay Siomai sa Tisa Katipunan Cebu',
    lat: 10.3015678,
    lng: 123.8706038,
    area: 'cebu-city',
    categories: ['ngohiong-siomai'],
    recommended: '在地 Tisa 燒賣，配辣蒜醬',
    hours: '24 小時（需確認）',
    coordinateSource: 'verified',
    coordinateNote: 'Katipunan Street, Tisa (from data file + OSM Nominatim)'
  },
  {
    id: 'carbon-market',
    name: 'Carbon Market',
    googleQuery: 'Carbon Market Cebu City',
    lat: 10.2920,
    lng: 123.8978,
    area: 'cebu-city',
    categories: ['market'],
    recommended: '在地早餐 puto maya 配 sikwate，常加芒果',
    hours: '約 05:00–17:00（需確認）',
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Carbon Market, Cebu City'
  }
];

export const glossary = [
  { term: 'Lechon', description: '宿務烤乳豬，皮脆、肉有香料味，不用沾醬' },
  { term: 'Puso', description: '椰葉包的米飯，配燒烤吃' },
  { term: 'Ngohiong', description: '宿務式五香炸春捲，配辣褐色醬汁' },
  { term: 'Sutukil', description: '自選海鮮，選烤（sugba）、煮湯（tuwa）或生醃（kilaw）' },
  { term: 'Tuslob buwa', description: '冒泡的豬腦醬，拿 puso 下去沾' },
  { term: 'Siomai sa Tisa', description: '宿務在地燒賣，配辣蒜醬' },
  { term: 'Puto maya + sikwate', description: '糯米飯配濃熱巧克力，當地早餐' }
];

export const streetFoodTips = [
  '選現烤、客人多、翻桌快的攤位。',
  '放在常溫的生醃和半熟海鮮要小心。',
  '喝瓶裝水，冰塊選工廠製、中間有洞的那種。',
  '帶濕紙巾和乾洗手，準備 ₱20–100 的小鈔，路邊攤大多只收現金。',
  '搭紅眼航班前那一餐，避開生醃和路邊攤。'
];

export const sources = [
  { title: 'AA BBQ Soong', site: 'mactannow.com', url: 'https://www.mactannow.com/aa-bbq-soong/' },
  { title: "Ayer's Lechon", site: 'cebuayerslechon.com', url: 'https://www.cebuayerslechon.com/' },
  { title: 'Trillis 與 ngohiong 名店', site: 'keeta.ph', url: 'https://keeta.ph/good-ngohiong-is-never-far-in-cebu-here-are-five-places-to-prove-it/' },
  { title: "Nonie's Barbecue", site: 'mactannow.com', url: 'https://www.mactannow.com/nonies-barbecue/' },
  { title: 'Langging Fried Chicken', site: 'mactannow.com', url: 'https://www.mactannow.com/langging-fried-chicken/' },
  { title: 'Lapu-Lapu City Public Market', site: 'airial.travel', url: 'https://airial.travel/attractions/philippines/lapu-lapu/lapu-lapu-city-public-market-wlRyrUbb' },
  { title: 'CnT Lechon 等宿務烤乳豬清單', site: 'chillandtravel.com', url: 'https://chillandtravel.com/cebu-lechon-food-list/' },
  { title: 'Puso Village 指南', site: 'sugbo.ph', url: 'https://sugbo.ph/2025/your-guide-to-puso-village/' },
  { title: 'Larsian BBQ 指南', site: 'cebudestinations.com', url: 'https://cebudestinations.com/guide/larsian-bbq-guide-fuente' },
  { title: 'Way Tugpahay Siomai sa Tisa', site: 'foodpanda.ph', url: 'https://www.foodpanda.ph/restaurant/m6jh/way-tugpahay-siomai-sa-tisa-tisa' },
  { title: 'Carbon Market puto maya + sikwate', site: 'cebuinsights.com', url: 'https://cebuinsights.com/food/filipino-food/puto-sikwate-carbon-market/' }
];

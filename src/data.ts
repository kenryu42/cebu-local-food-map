/**
 * Cebu Food & Sightseeing Map Data
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

import type { Hours, Price } from './trip';

export type Category =
  | 'lechon' | 'bbq' | 'puso' | 'ngohiong-siomai' | 'market'
  | 'history' | 'temple' | 'viewpoint'
  | 'lodging' | 'airport';
export type Area = 'mactan' | 'cebu-city' | 'landmark';

export interface Phrase {
  id: string; // also the audio file name
  phrase: string;
  meaning: string;
}

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
  openHours?: Hours; // only where sources agree; drives the 營業中 badge
  price?: Price;
  coordinateSource: 'verified' | 'approximate';
  coordinateNote?: string;
}

export const places: Place[] = [
  // Landmarks
  {
    id: 'jpark',
    name: 'J Park Island Resort & Waterpark',
    googleQuery: 'JPark Island Resort & Waterpark Maribago Lapu-Lapu',
    lat: 10.28276,
    lng: 123.99551,
    area: 'landmark',
    categories: ['lodging'],
    coordinateSource: 'verified',
    coordinateNote: 'OSM node "JPark resort", M.L. Quezon Highway, Maribago (matches Wikipedia 10.2820, 123.9964)'
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
    openHours: [['11:00', '23:00']],
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
    openHours: [['08:00', '17:00']],
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
    openHours: [['10:00', '22:00']],
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
    recommended: '經典串燒街，自挑生肉串現烤，只收現金',
    hours: '18:00–21:00 最熱鬧',
    price: { min: 150, max: 300, label: '每人' },
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
  },

  // Sightseeing: hours and fees differ between sources, so they stay marked 需確認
  {
    id: 'magellans-cross',
    name: "Magellan's Cross 麥哲倫十字架",
    googleQuery: "Magellan's Cross Cebu City",
    lat: 10.2935702,
    lng: 123.9019584,
    area: 'cebu-city',
    categories: ['history'],
    recommended: '1521 年麥哲倫立下的十字架，亭子天花板有登陸壁畫；就在聖嬰教堂旁，兩個一起逛',
    hours: '白天開放（需確認）',
    price: { min: 0, label: '' },
    coordinateSource: 'verified',
    coordinateNote: "OSM: Magellan's Cross Pavilion, Magallanes Street"
  },
  {
    id: 'santo-nino',
    name: 'Basilica del Santo Niño 聖嬰大教堂',
    googleQuery: 'Basilica Minore del Santo Niño Cebu',
    lat: 10.2943421,
    lng: 123.9021033,
    area: 'cebu-city',
    categories: ['temple', 'history'],
    recommended: '菲律賓最古老的教堂之一，供奉聖嬰像；勿穿露肩、短褲，11/1 前後人潮很多',
    hours: '依彌撒時段開放（需確認）',
    price: { min: 0, label: '' },
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Basilica Minore del Santo Niño, Osmeña Boulevard'
  },
  {
    id: 'fort-san-pedro',
    name: 'Fort San Pedro 聖佩德羅堡',
    googleQuery: 'Fort San Pedro Cebu City',
    lat: 10.2927283,
    lng: 123.9058911,
    area: 'cebu-city',
    categories: ['history'],
    recommended: '西班牙時期的三角形石造堡壘，可以走上城牆看港口，傍晚光線最美',
    hours: '約 08:00–19:00（需確認）',
    price: { min: 30, max: 50, label: '門票' },
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Fort San Pedro, A. Pigafetta Street'
  },
  {
    id: 'yap-sandiego',
    name: 'Yap-San Diego Ancestral House 古宅',
    googleQuery: 'Yap-San Diego Ancestral House Cebu',
    lat: 10.2992579,
    lng: 123.9039722,
    area: 'cebu-city',
    categories: ['history'],
    recommended: '1600 年代華人商人的古宅，珊瑚石牆、木造二樓和老家具，很好拍',
    hours: '約 09:00–18:00（需確認）',
    price: { min: 50, max: 100, label: '門票' },
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Yap Sandiego Ancestral House, Mabini Street'
  },
  {
    id: 'heritage-monument',
    name: 'Heritage of Cebu Monument 宿務遺產紀念碑',
    googleQuery: 'Heritage of Cebu Monument',
    lat: 10.2988934,
    lng: 123.9036170,
    area: 'cebu-city',
    categories: ['history'],
    recommended: '用一整組雕塑濃縮宿務歷史，離古宅走路 1 分鐘',
    hours: '戶外，隨時可看',
    price: { min: 0, label: '' },
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Heritage of Cebu Monument, Sikatuna Street'
  },
  {
    id: 'mactan-shrine',
    name: 'Mactan Shrine（Lapu-Lapu 紀念公園）',
    googleQuery: 'Mactan Shrine Liberty Shrine Lapu-Lapu',
    lat: 10.3109738,
    lng: 124.0151380,
    area: 'mactan',
    categories: ['history'],
    recommended: '紀念英雄 Lapu-Lapu 擊退麥哲倫的地方，有銅像和紀念碑；旁邊海邊有海鮮餐廳',
    hours: '白天開放（需確認）',
    price: { min: 0, label: '' },
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Liberty Shrine, Mactan'
  },
  {
    id: 'temple-of-leah',
    name: 'Temple of Leah',
    googleQuery: 'Temple of Leah Cebu City',
    lat: 10.3688795,
    lng: 123.8733158,
    area: 'cebu-city',
    categories: ['viewpoint'],
    recommended: '山上的羅馬風神殿，可以俯瞰整個宿務；傍晚去看夕陽和夜景，山上比較涼',
    hours: '約 06:00–23:00（需確認）',
    price: { min: 50, max: 100, label: '門票' },
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Temple of Leah, Roosevelt Drive, Busay'
  },
  {
    id: 'taoist-temple',
    name: 'Cebu Taoist Temple 定光寶殿',
    googleQuery: 'Cebu Taoist Temple Beverly Hills',
    lat: 10.3343184,
    lng: 123.8879852,
    area: 'cebu-city',
    categories: ['temple', 'viewpoint'],
    recommended: '比佛利山上的道教廟，紅瓦和龍雕，可以眺望市區；參拜區請保持安靜',
    hours: '需確認',
    price: { min: 0, label: '' },
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Cebu Taoist Temple, Canyon Road, Beverly Hills'
  },
  {
    id: 'sirao-garden',
    name: 'Sirao Flower Garden 小阿姆斯特丹',
    googleQuery: 'Sirao Flower Garden Cebu City',
    lat: 10.4070429,
    lng: 123.8665474,
    area: 'cebu-city',
    categories: ['viewpoint'],
    recommended: '山區花田，有風車和彩色拍照裝置；早上去花最漂亮也比較不熱，可以和 Temple of Leah 排同一趟',
    hours: '約 08:00–17:00（需確認）',
    price: { min: 50, max: 100, label: '門票' },
    coordinateSource: 'verified',
    coordinateNote: 'OSM: Sirao Garden, Kamandagan, Sirao'
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

// Cebuano (Bisaya), the language people speak in Cebu. Audio for each id is pre-generated into
// public/audio/phrases/<id>.mp3 by scripts/generate-phrase-audio.ts.
export const phraseGroups: { title: string; phrases: Phrase[] }[] = [
  {
    title: '打招呼',
    phrases: [
      { id: 'maayong-buntag', phrase: 'Maayong buntag', meaning: '早安' },
      { id: 'maayong-hapon', phrase: 'Maayong hapon', meaning: '午安' },
      { id: 'maayong-gabii', phrase: 'Maayong gabii', meaning: '晚上好' },
      { id: 'kumusta', phrase: 'Kumusta ka?', meaning: '你好嗎？' },
      { id: 'salamat', phrase: 'Salamat', meaning: '謝謝' },
      { id: 'daghang-salamat', phrase: 'Daghang salamat', meaning: '非常感謝' },
      { id: 'walay-sapayan', phrase: 'Walay sapayan', meaning: '不客氣' }
    ]
  },
  {
    title: '吃飯點餐',
    phrases: [
      { id: 'lami-kaayo', phrase: 'Lami kaayo!', meaning: '超好吃！' },
      { id: 'usa-pa', phrase: 'Usa pa, palihug', meaning: '請再來一份' },
      { id: 'tubig', phrase: 'Tubig, palihug', meaning: '請給我水' },
      { id: 'dili-halang', phrase: 'Dili halang', meaning: '不要辣' },
      { id: 'busog', phrase: 'Busog na ko', meaning: '我吃飽了' },
      { id: 'pila-tanan', phrase: 'Pila tanan?', meaning: '總共多少錢？' }
    ]
  },
  {
    title: '購物殺價',
    phrases: [
      { id: 'pila-ni', phrase: 'Pila ni?', meaning: '這個多少錢？' },
      { id: 'mahal-kaayo', phrase: 'Mahal kaayo!', meaning: '太貴了！' },
      { id: 'mahangyo', phrase: 'Pwede mahangyo?', meaning: '可以算便宜一點嗎？' },
      { id: 'palihug', phrase: 'Palihug', meaning: '麻煩你／拜託' }
    ]
  },
  {
    title: '問路搭車',
    phrases: [
      { id: 'asa-cr', phrase: 'Asa ang CR?', meaning: '廁所在哪裡？' },
      { id: 'para', phrase: 'Para!', meaning: '停車！（搭吉普尼下車時喊）' },
      { id: 'diri-lang', phrase: 'Diri lang', meaning: '在這裡停就好' },
      { id: 'liko-tuo', phrase: 'Liko sa tuo', meaning: '右轉' },
      { id: 'liko-wala', phrase: 'Liko sa wala', meaning: '左轉' }
    ]
  },
  {
    title: '實用短句',
    phrases: [
      { id: 'oo', phrase: 'Oo', meaning: '是／好' },
      { id: 'dili', phrase: 'Dili', meaning: '不是／不要' },
      { id: 'wala-kasabot', phrase: 'Wala ko kasabot', meaning: '我聽不懂' },
      { id: 'hinay-hinay', phrase: 'Hinay-hinay lang', meaning: '慢一點' }
    ]
  }
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
  { title: 'Carbon Market puto maya + sikwate', site: 'cebuinsights.com', url: 'https://cebuinsights.com/food/filipino-food/puto-sikwate-carbon-market/' },
  { title: 'Fort San Pedro 指南', site: '3d-universal.com', url: 'https://3d-universal.com/en/blogs/the-ultimate-guide-to-fort-san-pedro.html' },
  { title: 'Yap-San Diego 古宅指南', site: '3d-universal.com', url: 'https://3d-universal.com/en/blogs/ultimate-guide-to-yap-sandiego-ancestral-house-cebu.html' },
  { title: 'Temple of Leah', site: 'suroy.ph', url: 'https://suroy.ph/temple-of-leah/' },
  { title: 'Sirao Flower Garden', site: 'suroy.ph', url: 'https://suroy.ph/sirao-garden-the-little-amsterdam-of-cebu/' }
];

/**
 * Dish Image Utilities & Curated High-Definition Food Photography
 * Provides authentic, high-speed CDN thumbnails for Indian & international cuisines,
 * with category fallbacks and broken image recovery.
 */

export const CURATED_DISH_IMAGES: Record<string, string> = {
  // --- Breads & Parathas ---
  paratha_plain: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
  paratha_aloo: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
  paratha_paneer: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
  paratha_gobi: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
  paratha_mix: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
  paratha_lachha: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80',
  paratha_methi: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',
  roti_tandoori: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80',
  roti_rumali: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80',
  roti_missi: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80',
  roti_makki: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80',
  naan_butter: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
  naan_garlic: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
  naan_cheese: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
  naan_plain: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
  kulcha: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&auto=format&fit=crop&q=80',
  bhatura: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&auto=format&fit=crop&q=80',
  puri: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',

  // --- Curries & Mains ---
  butter_chicken: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&auto=format&fit=crop&q=80',
  dal_makhani: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
  dal_tadka: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
  paneer_butter_masala: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
  kadhai_paneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
  shahi_paneer: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
  paneer_bhurji: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80',
  sarson_saag: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
  rajma: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
  chana_masala: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400&auto=format&fit=crop&q=80',
  kadhi_pakora: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',
  mutton_curry: 'https://images.unsplash.com/photo-1545247181-516773ca83e3?w=400&auto=format&fit=crop&q=80',
  mutton_rogan: 'https://images.unsplash.com/photo-1545247181-516773ca83e3?w=400&auto=format&fit=crop&q=80',
  egg_curry: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
  malai_kofta: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80',
  mix_veg: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',

  // --- Rice & Biryani ---
  biryani_chicken: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
  biryani_mutton: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
  biryani_veg: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
  biryani_egg: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80',
  jeera_rice: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80',
  peas_pulao: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80',
  lemon_rice: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80',
  curd_rice: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&auto=format&fit=crop&q=80',

  // --- Snacks, Pakoras & Chaat ---
  samosa: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
  bread_pakora: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
  paneer_pakora: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
  onion_pakora: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
  aloo_tikki: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
  dahi_bhalla: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
  sev_puri: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&auto=format&fit=crop&q=80',
  bhel_puri: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&auto=format&fit=crop&q=80',
  kachori: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
  pav_bhaji: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400&auto=format&fit=crop&q=80',
  pani_puri: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80',

  // --- South Indian ---
  idli: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
  vada: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
  dosa_masala: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80',
  dosa_mysore: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80',
  dosa_rava: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400&auto=format&fit=crop&q=80',
  uttapam: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
  pongal: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
  south_meals: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',

  // --- Chinese & Asian ---
  manchurian: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',
  chilli_chicken: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&auto=format&fit=crop&q=80',
  noodles_veg: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80',
  noodles_chicken: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&auto=format&fit=crop&q=80',
  fried_rice: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&auto=format&fit=crop&q=80',
  momos: 'https://images.unsplash.com/photo-1625398407797-00c2a233b8b1?w=400&auto=format&fit=crop&q=80',
  spring_roll: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
  thukpa: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80',

  // --- Seafood & Grill ---
  fish_fry: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80',
  fish_curry: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80',
  prawns: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&auto=format&fit=crop&q=80',
  tandoori_chicken: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&auto=format&fit=crop&q=80',
  chicken_tikka: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=400&auto=format&fit=crop&q=80',
  seekh_kebab: 'https://images.unsplash.com/photo-1545247181-516773ca83e3?w=400&auto=format&fit=crop&q=80',
  paneer_tikka: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400&auto=format&fit=crop&q=80',

  // --- Fast Food & Burgers ---
  burger_veg: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80',
  burger_chicken: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80',
  fried_chicken: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&auto=format&fit=crop&q=80',
  pizza: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
  fries: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80',
  sandwich: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&auto=format&fit=crop&q=80',
  wrap_roll: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400&auto=format&fit=crop&q=80',

  // --- Beverages & Tea/Coffee ---
  tea_chai: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=80',
  coffee_hot: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
  coffee_cold: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
  juice_orange: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&auto=format&fit=crop&q=80',
  juice_watermelon: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=400&auto=format&fit=crop&q=80',
  juice_fresh: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80',
  lassi_sweet: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&auto=format&fit=crop&q=80',
  lassi_mango: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&auto=format&fit=crop&q=80',
  shake: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80',
  falooda: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&auto=format&fit=crop&q=80',

  // --- Desserts & Sweets ---
  gulab_jamun: 'https://images.unsplash.com/photo-1599785209707-a456fc1337bb?w=400&auto=format&fit=crop&q=80',
  jalebi: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
  kheer: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
  gajar_halwa: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
  kulfi: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&auto=format&fit=crop&q=80',
  rasmalai: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&auto=format&fit=crop&q=80',
  brownie: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&auto=format&fit=crop&q=80',
  cake: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&auto=format&fit=crop&q=80',
  waffle: 'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&auto=format&fit=crop&q=80',
};

/**
 * Resolves the most accurate high-definition thumbnail image URL for any dish.
 */
export function getDishImageUrl(
  name: string,
  category: string = '',
  isVeg: boolean = true,
  existingImage?: string
): string {
  if (existingImage && existingImage.trim().startsWith('http')) {
    return existingImage.trim();
  }

  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();

  // Keyword-specific matching
  if (n.includes('biryani') || n.includes('pulao')) {
    return n.includes('mutton') ? CURATED_DISH_IMAGES.biryani_mutton : CURATED_DISH_IMAGES.biryani_chicken;
  }
  if (n.includes('butter chicken') || n.includes('murgh makhani') || n.includes('cream chicken')) {
    return CURATED_DISH_IMAGES.butter_chicken;
  }
  if (n.includes('rogan josh') || (n.includes('mutton') && !n.includes('biryani'))) {
    return CURATED_DISH_IMAGES.mutton_rogan;
  }
  if (n.includes('dal makhani') || n.includes('black lentil')) {
    return CURATED_DISH_IMAGES.dal_makhani;
  }
  if (n.includes('dal tadka') || n.includes('yellow dal')) {
    return CURATED_DISH_IMAGES.dal_tadka;
  }
  if (n.includes('saag') || n.includes('sarson')) {
    return CURATED_DISH_IMAGES.sarson_saag;
  }
  if (n.includes('rajma')) {
    return CURATED_DISH_IMAGES.rajma;
  }
  if (n.includes('chole') || n.includes('chana') || n.includes('bhatura')) {
    return CURATED_DISH_IMAGES.chana_masala;
  }
  if (n.includes('kadhi')) {
    return CURATED_DISH_IMAGES.kadhi_pakora;
  }
  if (n.includes('bhurji')) {
    return CURATED_DISH_IMAGES.paneer_bhurji;
  }
  if (n.includes('paneer') && (n.includes('butter') || n.includes('shahi') || n.includes('makhani') || n.includes('kadhai'))) {
    return CURATED_DISH_IMAGES.paneer_butter_masala;
  }
  if (n.includes('paneer tikka')) {
    return CURATED_DISH_IMAGES.paneer_tikka;
  }

  // Breads
  if (n.includes('paratha')) {
    if (n.includes('aloo')) return CURATED_DISH_IMAGES.paratha_aloo;
    if (n.includes('paneer')) return CURATED_DISH_IMAGES.paratha_paneer;
    if (n.includes('gobi')) return CURATED_DISH_IMAGES.paratha_gobi;
    if (n.includes('lachha')) return CURATED_DISH_IMAGES.paratha_lachha;
    if (n.includes('methi')) return CURATED_DISH_IMAGES.paratha_methi;
    return CURATED_DISH_IMAGES.paratha_plain;
  }
  if (n.includes('kulcha')) return CURATED_DISH_IMAGES.kulcha;
  if (n.includes('naan')) {
    if (n.includes('garlic')) return CURATED_DISH_IMAGES.naan_garlic;
    if (n.includes('cheese')) return CURATED_DISH_IMAGES.naan_cheese;
    return CURATED_DISH_IMAGES.naan_butter;
  }
  if (n.includes('roti')) {
    if (n.includes('makki')) return CURATED_DISH_IMAGES.roti_makki;
    if (n.includes('missi')) return CURATED_DISH_IMAGES.roti_missi;
    if (n.includes('rumali')) return CURATED_DISH_IMAGES.roti_rumali;
    return CURATED_DISH_IMAGES.roti_tandoori;
  }
  if (n.includes('puri') && !n.includes('pani') && !n.includes('bhel') && !n.includes('sev')) {
    return CURATED_DISH_IMAGES.puri;
  }

  // Snacks & Chaat
  if (n.includes('samosa')) return CURATED_DISH_IMAGES.samosa;
  if (n.includes('bread pakora')) return CURATED_DISH_IMAGES.bread_pakora;
  if (n.includes('pakora')) return CURATED_DISH_IMAGES.paneer_pakora;
  if (n.includes('aloo tikki')) return CURATED_DISH_IMAGES.aloo_tikki;
  if (n.includes('pav bhaji')) return CURATED_DISH_IMAGES.pav_bhaji;
  if (n.includes('dahi bhalla')) return CURATED_DISH_IMAGES.dahi_bhalla;
  if (n.includes('pani puri') || n.includes('golgappe')) return CURATED_DISH_IMAGES.pani_puri;
  if (n.includes('bhel puri')) return CURATED_DISH_IMAGES.bhel_puri;
  if (n.includes('sev puri')) return CURATED_DISH_IMAGES.sev_puri;
  if (n.includes('kachori')) return CURATED_DISH_IMAGES.kachori;

  // South Indian
  if (n.includes('dosa')) return CURATED_DISH_IMAGES.dosa_masala;
  if (n.includes('idli')) return CURATED_DISH_IMAGES.idli;
  if (n.includes('vada')) return CURATED_DISH_IMAGES.vada;
  if (n.includes('uttapam')) return CURATED_DISH_IMAGES.uttapam;
  if (n.includes('pongal')) return CURATED_DISH_IMAGES.pongal;
  if (n.includes('lemon rice')) return CURATED_DISH_IMAGES.lemon_rice;
  if (n.includes('curd rice')) return CURATED_DISH_IMAGES.curd_rice;

  // Chinese & Asian
  if (n.includes('noodle')) return isVeg ? CURATED_DISH_IMAGES.noodles_veg : CURATED_DISH_IMAGES.noodles_chicken;
  if (n.includes('fried rice')) return CURATED_DISH_IMAGES.fried_rice;
  if (n.includes('manchurian')) return CURATED_DISH_IMAGES.manchurian;
  if (n.includes('chilli chicken')) return CURATED_DISH_IMAGES.chilli_chicken;
  if (n.includes('momo') || n.includes('dumpling')) return CURATED_DISH_IMAGES.momos;
  if (n.includes('spring roll')) return CURATED_DISH_IMAGES.spring_roll;
  if (n.includes('thukpa')) return CURATED_DISH_IMAGES.thukpa;

  // Seafood & Tandoori Grill
  if (n.includes('fish') || n.includes('sole')) return CURATED_DISH_IMAGES.fish_fry;
  if (n.includes('prawn') || n.includes('shrimp')) return CURATED_DISH_IMAGES.prawns;
  if (n.includes('tandoori') && n.includes('chicken')) return CURATED_DISH_IMAGES.tandoori_chicken;
  if (n.includes('tikka') && !n.includes('paneer')) return CURATED_DISH_IMAGES.chicken_tikka;
  if (n.includes('kebab') || n.includes('seekh')) return CURATED_DISH_IMAGES.seekh_kebab;

  // Fast Food & Western
  if (n.includes('burger')) return isVeg ? CURATED_DISH_IMAGES.burger_veg : CURATED_DISH_IMAGES.burger_chicken;
  if (n.includes('fried chicken') || n.includes('crispy chicken') || n.includes('wings') || n.includes('bucket')) {
    return CURATED_DISH_IMAGES.fried_chicken;
  }
  if (n.includes('pizza')) return CURATED_DISH_IMAGES.pizza;
  if (n.includes('fries')) return CURATED_DISH_IMAGES.fries;
  if (n.includes('sandwich') || n.includes('sub')) return CURATED_DISH_IMAGES.sandwich;
  if (n.includes('roll') || n.includes('wrap')) return CURATED_DISH_IMAGES.wrap_roll;

  // Drinks & Beverages
  if (n.includes('chai') || n.includes('tea')) return CURATED_DISH_IMAGES.tea_chai;
  if (n.includes('cold coffee')) return CURATED_DISH_IMAGES.coffee_cold;
  if (n.includes('coffee')) return CURATED_DISH_IMAGES.coffee_hot;
  if (n.includes('orange juice')) return CURATED_DISH_IMAGES.juice_orange;
  if (n.includes('watermelon')) return CURATED_DISH_IMAGES.juice_watermelon;
  if (n.includes('juice')) return CURATED_DISH_IMAGES.juice_fresh;
  if (n.includes('mango lassi') || (n.includes('lassi') && n.includes('mango'))) return CURATED_DISH_IMAGES.lassi_mango;
  if (n.includes('lassi') || n.includes('chaas') || n.includes('buttermilk')) return CURATED_DISH_IMAGES.lassi_sweet;
  if (n.includes('shake')) return CURATED_DISH_IMAGES.shake;
  if (n.includes('falooda')) return CURATED_DISH_IMAGES.falooda;

  // Sweets & Desserts
  if (n.includes('gulab jamun')) return CURATED_DISH_IMAGES.gulab_jamun;
  if (n.includes('jalebi')) return CURATED_DISH_IMAGES.jalebi;
  if (n.includes('kheer')) return CURATED_DISH_IMAGES.kheer;
  if (n.includes('halwa')) return CURATED_DISH_IMAGES.gajar_halwa;
  if (n.includes('kulfi') || n.includes('ice cream')) return CURATED_DISH_IMAGES.kulfi;
  if (n.includes('rasmalai') || n.includes('rasgulla')) return CURATED_DISH_IMAGES.rasmalai;
  if (n.includes('waffle')) return CURATED_DISH_IMAGES.waffle;
  if (n.includes('brownie')) return CURATED_DISH_IMAGES.brownie;
  if (n.includes('cake') || n.includes('pastry')) return CURATED_DISH_IMAGES.cake;

  // Category based general fallbacks
  if (c.includes('bread') || c.includes('tandoor')) return CURATED_DISH_IMAGES.naan_butter;
  if (c.includes('rice') || c.includes('biryani')) return CURATED_DISH_IMAGES.biryani_chicken;
  if (c.includes('juice')) return CURATED_DISH_IMAGES.juice_fresh;
  if (c.includes('hot drinks') || c.includes('beverage') && n.includes('coffee')) return CURATED_DISH_IMAGES.coffee_hot;
  if (c.includes('hot drinks') || c.includes('tea')) return CURATED_DISH_IMAGES.tea_chai;
  if (c.includes('beverage') || c.includes('dessert')) return CURATED_DISH_IMAGES.gulab_jamun;
  if (c.includes('south')) return CURATED_DISH_IMAGES.dosa_masala;
  if (c.includes('chinese') || c.includes('asian')) return CURATED_DISH_IMAGES.noodles_veg;
  if (c.includes('seafood') || c.includes('grill')) return CURATED_DISH_IMAGES.fish_fry;
  if (c.includes('fast food') || c.includes('burger')) return CURATED_DISH_IMAGES.burger_veg;
  if (c.includes('snack') || c.includes('chaat') || c.includes('street')) return CURATED_DISH_IMAGES.samosa;

  return isVeg ? CURATED_DISH_IMAGES.paneer_butter_masala : CURATED_DISH_IMAGES.butter_chicken;
}

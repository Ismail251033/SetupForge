/* ============================================================
   SETUPFORGE — app.js
   Elite frontend application logic
   ============================================================ */

'use strict';

/* ===== STATE ===== */
const state = {
  currentPage: 'landing',
  setup: [],
  pcBuild: {},
  savedSetups: [],
  favorites: [],
  profile: { name: 'SetupForger', avatar: 'SF', likedSetups: [] },
  sounds: true,
  rgbColor: '#00f0ff',
  viewerMode: 'front',
  dayMode: false,
  trackerSelected: null,
  commTab: 'trending',
  budget: 2000,
  priceHistory: {},
  laptopFilters: { budget: 'budget', use: 'school', portability: 'balanced', battery: 'high' },
  aiFilters: { budget: '2000', use: 'gaming', games: 'esports', style: 'rgb', prefs: ['rgb-fans', 'ultra-wide'] },
  wishlistMode: false
};

/* ===== AUDIO CONTEXT ===== */
let audioCtx = null;
function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playSound(type) {
  if (!state.sounds) return;
  try {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    const configs = {
      click:  { freq: 880, type: 'sine', dur: 0.05, vol: 0.06 },
      save:   { freq: 660, type: 'sine', dur: 0.15, vol: 0.08 },
      notif:  { freq: 520, type: 'sine', dur: 0.1,  vol: 0.06 },
      error:  { freq: 220, type: 'sawtooth', dur: 0.1, vol: 0.05 },
      add:    { freq: 750, type: 'sine', dur: 0.08, vol: 0.07 }
    };
    const c = configs[type] || configs.click;
    osc.type = c.type; osc.frequency.setValueAtTime(c.freq, ctx.currentTime);
    gain.gain.setValueAtTime(c.vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + c.dur);
    osc.start(); osc.stop(ctx.currentTime + c.dur);
  } catch(e) {}
}

/* ===== PRODUCT DATABASE ===== */
const PRODUCTS = [
  // Desks
  { id:'d1', cat:'desk', icon:'🖥️', name:'Uplift V2 Standing Desk', brand:'Uplift', price:899, rating:4.8, stock:'in-stock', color:'black', power:0, space:16000, watt:0 },
  { id:'d2', cat:'desk', icon:'🪵', name:'Flexispot E7 Pro', brand:'Flexispot', price:649, rating:4.7, stock:'in-stock', color:'white', power:0, space:14000, watt:0 },
  { id:'d3', cat:'desk', icon:'🖥️', name:'SecretLab Magnus Pro', brand:'SecretLab', price:799, rating:4.9, stock:'limited', color:'black', power:0, space:13000, watt:0 },
  { id:'d4', cat:'desk', icon:'🪵', name:'IKEA Bekant Sit/Stand', brand:'IKEA', price:449, rating:4.2, stock:'in-stock', color:'white', power:0, space:12800, watt:0 },
  // Chairs
  { id:'c1', cat:'chair', icon:'🪑', name:'SecretLab Titan Evo 2022', brand:'SecretLab', price:549, rating:4.9, stock:'in-stock', color:'black', power:0, space:6000, watt:0 },
  { id:'c2', cat:'chair', icon:'🪑', name:'Herman Miller Embody', brand:'Herman Miller', price:1795, rating:5.0, stock:'in-stock', color:'black', power:0, space:6400, watt:0 },
  { id:'c3', cat:'chair', icon:'🪑', name:'Razer Iskur V2', brand:'Razer', price:499, rating:4.7, stock:'in-stock', color:'black', power:0, space:5800, watt:0 },
  { id:'c4', cat:'chair', icon:'🪑', name:'DXRacer Formula Series', brand:'DXRacer', price:299, rating:4.3, stock:'in-stock', color:'black', power:0, space:5500, watt:0 },
  // Monitors
  { id:'m1', cat:'monitor', icon:'🖥️', name:'LG 27GP950-B 4K 160Hz', brand:'LG', price:749, rating:4.9, stock:'in-stock', color:'black', power:65, space:2800, watt:65 },
  { id:'m2', cat:'monitor', icon:'🖥️', name:'Samsung Odyssey G9 49"', brand:'Samsung', price:1199, rating:4.8, stock:'limited', color:'white', power:100, space:5500, watt:100 },
  { id:'m3', cat:'monitor', icon:'🖥️', name:'ASUS ROG Swift 360Hz', brand:'ASUS', price:699, rating:4.8, stock:'in-stock', color:'black', power:55, space:2200, watt:55 },
  { id:'m4', cat:'monitor', icon:'🖥️', name:'Dell UltraSharp U2722D', brand:'Dell', price:499, rating:4.7, stock:'in-stock', color:'black', power:45, space:2400, watt:45 },
  { id:'m5', cat:'monitor', icon:'🖥️', name:'Alienware AW3423DW QD-OLED', brand:'Alienware', price:1099, rating:5.0, stock:'in-stock', color:'white', power:80, space:4200, watt:80 },
  // Keyboards
  { id:'k1', cat:'keyboard', icon:'⌨️', name:'Keychron Q1 Pro', brand:'Keychron', price:199, rating:4.9, stock:'in-stock', color:'black', power:0, space:800, watt:0 },
  { id:'k2', cat:'keyboard', icon:'⌨️', name:'Razer BlackWidow V4 Pro', brand:'Razer', price:229, rating:4.7, stock:'in-stock', color:'black', power:0, space:900, watt:0 },
  { id:'k3', cat:'keyboard', icon:'⌨️', name:'Logitech G915 TKL', brand:'Logitech', price:229, rating:4.8, stock:'in-stock', color:'black', power:0, space:700, watt:0 },
  { id:'k4', cat:'keyboard', icon:'⌨️', name:'Wooting 60HE+', brand:'Wooting', price:179, rating:5.0, stock:'limited', color:'black', power:0, space:500, watt:0 },
  { id:'k5', cat:'keyboard', icon:'⌨️', name:'SteelSeries Apex Pro TKL', brand:'SteelSeries', price:199, rating:4.7, stock:'in-stock', color:'black', power:0, space:720, watt:0 },
  // Mice
  { id:'ms1', cat:'mouse', icon:'🖱️', name:'Logitech G Pro X Superlight 2', brand:'Logitech', price:159, rating:5.0, stock:'in-stock', color:'white', power:0, space:200, watt:0 },
  { id:'ms2', cat:'mouse', icon:'🖱️', name:'Razer DeathAdder V3 Pro', brand:'Razer', price:159, rating:4.8, stock:'in-stock', color:'black', power:0, space:220, watt:0 },
  { id:'ms3', cat:'mouse', icon:'🖱️', name:'Pulsar X2 Mini', brand:'Pulsar', price:99, rating:4.9, stock:'in-stock', color:'white', power:0, space:180, watt:0 },
  { id:'ms4', cat:'mouse', icon:'🖱️', name:'Endgame Gear XM2we', brand:'Endgame Gear', price:79, rating:4.8, stock:'in-stock', color:'black', power:0, space:190, watt:0 },
  // Mousepads
  { id:'mp1', cat:'mousepad', icon:'🟫', name:'Artisan Zero XL Soft', brand:'Artisan', price:69, rating:4.9, stock:'in-stock', color:'black', power:0, space:2000, watt:0 },
  { id:'mp2', cat:'mousepad', icon:'🟫', name:'SteelSeries QcK Edge XL', brand:'SteelSeries', price:49, rating:4.7, stock:'in-stock', color:'black', power:0, space:1800, watt:0 },
  { id:'mp3', cat:'mousepad', icon:'🟫', name:'Logitech G840 XL', brand:'Logitech', price:59, rating:4.7, stock:'in-stock', color:'black', power:0, space:1900, watt:0 },
  // Headsets
  { id:'h1', cat:'headset', icon:'🎧', name:'SteelSeries Arctis Nova Pro', brand:'SteelSeries', price:349, rating:4.9, stock:'in-stock', color:'black', power:0, space:400, watt:0 },
  { id:'h2', cat:'headset', icon:'🎧', name:'Razer BlackShark V2 Pro', brand:'Razer', price:179, rating:4.7, stock:'in-stock', color:'black', power:0, space:380, watt:0 },
  { id:'h3', cat:'headset', icon:'🎧', name:'Logitech G Pro X 2', brand:'Logitech', price:249, rating:4.8, stock:'in-stock', color:'black', power:0, space:420, watt:0 },
  // Microphones
  { id:'mic1', cat:'microphone', icon:'🎙️', name:'Blue Yeti X', brand:'Blue', price:169, rating:4.8, stock:'in-stock', color:'black', power:0, space:200, watt:0 },
  { id:'mic2', cat:'microphone', icon:'🎙️', name:'Elgato Wave:3', brand:'Elgato', price:149, rating:4.7, stock:'in-stock', color:'black', power:0, space:180, watt:0 },
  { id:'mic3', cat:'microphone', icon:'🎙️', name:'Shure MV7+', brand:'Shure', price:249, rating:4.9, stock:'in-stock', color:'black', power:0, space:200, watt:0 },
  // Webcams
  { id:'wc1', cat:'webcam', icon:'📷', name:'Logitech Brio 4K', brand:'Logitech', price:199, rating:4.8, stock:'in-stock', color:'black', power:0, space:100, watt:0 },
  { id:'wc2', cat:'webcam', icon:'📷', name:'Elgato Facecam Pro', brand:'Elgato', price:299, rating:4.9, stock:'in-stock', color:'black', power:0, space:90, watt:0 },
  // Speakers
  { id:'sp1', cat:'speakers', icon:'🔊', name:'Audioengine A2+ Wireless', brand:'Audioengine', price:269, rating:4.9, stock:'in-stock', color:'black', power:15, space:600, watt:15 },
  { id:'sp2', cat:'speakers', icon:'🔊', name:'Razer Leviathan V2 Pro', brand:'Razer', price:249, rating:4.6, stock:'in-stock', color:'black', power:20, space:1200, watt:20 },
  // Lighting
  { id:'l1', cat:'lighting', icon:'💡', name:'Govee TV Backlight T2', brand:'Govee', price:79, rating:4.7, stock:'in-stock', color:'rgb', power:10, space:0, watt:10 },
  { id:'l2', cat:'lighting', icon:'💡', name:'Elgato Key Light Pro', brand:'Elgato', price:199, rating:4.8, stock:'in-stock', color:'white', power:25, space:300, watt:25 },
  { id:'l3', cat:'lighting', icon:'💡', name:'Nanoleaf Shapes Hexagons', brand:'Nanoleaf', price:199, rating:4.6, stock:'in-stock', color:'rgb', power:12, space:0, watt:12 },
  { id:'l4', cat:'lighting', icon:'💡', name:'Govee RGBIC LED Strip', brand:'Govee', price:49, rating:4.5, stock:'in-stock', color:'rgb', power:8, space:0, watt:8 },
  // PC / Tower
  { id:'pc1', cat:'pc', icon:'🖥️', name:'NZXT Starter Pro PC', brand:'NZXT', price:1699, rating:4.7, stock:'in-stock', color:'black', power:350, space:2000, watt:350 },
  { id:'pc2', cat:'pc', icon:'🖥️', name:'Corsair One i500', brand:'Corsair', price:4499, rating:4.9, stock:'limited', color:'black', power:300, space:1800, watt:300 },
  // Laptops
  { id:'lp1', cat:'laptop', icon:'💻', name:'ASUS ROG Zephyrus G14 2024', brand:'ASUS', price:1599, rating:4.9, stock:'in-stock', color:'gray', power:65, space:3200, watt:65 },
  { id:'lp2', cat:'laptop', icon:'💻', name:'MacBook Pro 14" M4 Pro', brand:'Apple', price:1999, rating:5.0, stock:'in-stock', color:'silver', power:35, space:3100, watt:35 },
  // Accessories
  { id:'a1', cat:'accessories', icon:'🧊', name:'ARCTIC Liquid Freezer III 360', brand:'ARCTIC', price:129, rating:4.8, stock:'in-stock', color:'black', power:5, space:400, watt:5 },
  { id:'a2', cat:'accessories', icon:'📱', name:'Anker USB-C Hub 13-in-1', brand:'Anker', price:89, rating:4.7, stock:'in-stock', color:'black', power:5, space:150, watt:5 },
  { id:'a3', cat:'accessories', icon:'🖨️', name:'Elgato Stream Deck MK.2', brand:'Elgato', price:149, rating:4.9, stock:'in-stock', color:'black', power:5, space:200, watt:5 },
  { id:'a4', cat:'accessories', icon:'🎮', name:'PlayStation 5 Slim', brand:'Sony', price:449, rating:4.8, stock:'limited', color:'white', power:200, space:2000, watt:200 },
  { id:'a5', cat:'accessories', icon:'🪴', name:'Desk Plant Bundle', brand:'PlantLife', price:49, rating:4.5, stock:'in-stock', color:'green', power:0, space:200, watt:0 },
  { id:'a6', cat:'accessories', icon:'🕹️', name:'Xbox Series X', brand:'Microsoft', price:499, rating:4.8, stock:'in-stock', color:'black', power:200, space:2000, watt:200 },
];

/* ===== PC COMPONENTS DATABASE ===== */
const PC_COMPONENTS = {
  CPU: [
    { id:'cpu1', name:'AMD Ryzen 9 7950X', brand:'AMD', price:699, watt:170, socket:'AM5', score:98, specs:'16C/32T 5.7GHz', fps: { Valorant:400, Cyberpunk:140, Warzone:220 } },
    { id:'cpu2', name:'Intel Core i9-14900K', brand:'Intel', price:589, watt:253, socket:'LGA1700', score:95, specs:'24C/32T 6.0GHz', fps: { Valorant:430, Cyberpunk:135, Warzone:210 } },
    { id:'cpu3', name:'AMD Ryzen 7 7700X', brand:'AMD', price:299, watt:105, socket:'AM5', score:88, specs:'8C/16T 5.4GHz', fps: { Valorant:360, Cyberpunk:120, Warzone:195 } },
    { id:'cpu4', name:'Intel Core i7-13700K', brand:'Intel', price:379, watt:125, socket:'LGA1700', score:87, specs:'16C/24T 5.4GHz', fps: { Valorant:380, Cyberpunk:118, Warzone:200 } },
    { id:'cpu5', name:'AMD Ryzen 5 7600X', brand:'AMD', price:199, watt:105, socket:'AM5', score:80, specs:'6C/12T 5.3GHz', fps: { Valorant:330, Cyberpunk:100, Warzone:175 } },
  ],
  GPU: [
    { id:'gpu1', name:'NVIDIA RTX 4090', brand:'NVIDIA', price:1599, watt:450, score:100, specs:'24GB GDDR6X Ada', fps: { Valorant:500, Cyberpunk:100, Warzone:250 } },
    { id:'gpu2', name:'NVIDIA RTX 4080 Super', brand:'NVIDIA', price:999, watt:320, score:92, specs:'16GB GDDR6X Ada', fps: { Valorant:500, Cyberpunk:85, Warzone:220 } },
    { id:'gpu3', name:'AMD RX 7900 XTX', brand:'AMD', price:949, watt:355, score:91, specs:'24GB GDDR6', fps: { Valorant:500, Cyberpunk:82, Warzone:210 } },
    { id:'gpu4', name:'NVIDIA RTX 4070 Ti Super', brand:'NVIDIA', price:799, watt:285, score:87, specs:'16GB GDDR6X', fps: { Valorant:500, Cyberpunk:75, Warzone:200 } },
    { id:'gpu5', name:'AMD RX 7800 XT', brand:'AMD', price:499, watt:263, score:80, specs:'16GB GDDR6', fps: { Valorant:420, Cyberpunk:65, Warzone:170 } },
    { id:'gpu6', name:'NVIDIA RTX 4060 Ti', brand:'NVIDIA', price:399, watt:165, score:74, specs:'16GB GDDR6', fps: { Valorant:380, Cyberpunk:55, Warzone:150 } },
  ],
  Motherboard: [
    { id:'mb1', name:'ASUS ROG Maximus Z790', brand:'ASUS', price:699, watt:0, socket:'LGA1700', ramGen:'DDR5', specs:'ATX Z790 WiFi 6E' },
    { id:'mb2', name:'MSI MEG X670E ACE', brand:'MSI', price:599, watt:0, socket:'AM5', ramGen:'DDR5', specs:'ATX X670E WiFi 6E' },
    { id:'mb3', name:'Gigabyte B650E AORUS Master', brand:'Gigabyte', price:399, watt:0, socket:'AM5', ramGen:'DDR5', specs:'ATX B650E WiFi' },
    { id:'mb4', name:'MSI Z790 MAG Tomahawk', brand:'MSI', price:299, watt:0, socket:'LGA1700', ramGen:'DDR5', specs:'ATX Z790 WiFi' },
    { id:'mb5', name:'ASUS TUF Gaming B660', brand:'ASUS', price:179, watt:0, socket:'LGA1700', ramGen:'DDR4', specs:'ATX B660' },
  ],
  RAM: [
    { id:'r1', name:'G.Skill Trident Z5 RGB 64GB', brand:'G.Skill', price:259, watt:5, gen:'DDR5', specs:'2×32GB 6400MHz' },
    { id:'r2', name:'Corsair Dominator Titanium 32GB', brand:'Corsair', price:179, watt:5, gen:'DDR5', specs:'2×16GB 6000MHz' },
    { id:'r3', name:'Kingston Fury Beast 32GB', brand:'Kingston', price:109, watt:4, gen:'DDR5', specs:'2×16GB 5600MHz' },
    { id:'r4', name:'G.Skill Ripjaws V 32GB', brand:'G.Skill', price:79, watt:4, gen:'DDR4', specs:'2×16GB 3600MHz' },
    { id:'r5', name:'Corsair Vengeance 16GB', brand:'Corsair', price:49, watt:3, gen:'DDR4', specs:'2×8GB 3200MHz' },
  ],
  SSD: [
    { id:'ssd1', name:'Samsung 990 Pro 2TB', brand:'Samsung', price:189, watt:7, specs:'M.2 NVMe 7450MB/s' },
    { id:'ssd2', name:'WD Black SN850X 2TB', brand:'WD', price:159, watt:7, specs:'M.2 NVMe 7300MB/s' },
    { id:'ssd3', name:'Seagate FireCuda 530 1TB', brand:'Seagate', price:109, watt:6, specs:'M.2 NVMe 7300MB/s' },
    { id:'ssd4', name:'Crucial T700 2TB', brand:'Crucial', price:179, watt:9, specs:'M.2 PCIe 5.0 12400MB/s' },
  ],
  PSU: [
    { id:'psu1', name:'Seasonic PRIME TX-1000', brand:'Seasonic', price:279, watt:-1000, specs:'1000W 80+ Titanium' },
    { id:'psu2', name:'Corsair HX1200i', brand:'Corsair', price:299, watt:-1200, specs:'1200W 80+ Platinum' },
    { id:'psu3', name:'EVGA SuperNOVA 850 G6', brand:'EVGA', price:149, watt:-850, specs:'850W 80+ Gold' },
    { id:'psu4', name:'be quiet! Dark Power 13 850W', brand:'be quiet!', price:199, watt:-850, specs:'850W 80+ Titanium' },
    { id:'psu5', name:'Corsair RM750e', brand:'Corsair', price:109, watt:-750, specs:'750W 80+ Gold' },
  ],
  Cooling: [
    { id:'cool1', name:'ARCTIC Liquid Freezer III 360', brand:'ARCTIC', price:109, watt:15, specs:'360mm AIO, 3×120mm fans' },
    { id:'cool2', name:'Noctua NH-D15', brand:'Noctua', price:99, watt:1, specs:'Dual tower, 2×140mm fans' },
    { id:'cool3', name:'Corsair iCUE H150i Elite', brand:'Corsair', price:189, watt:20, specs:'360mm AIO RGB' },
    { id:'cool4', name:'be quiet! Dark Rock Pro 4', brand:'be quiet!', price:79, watt:1, specs:'Dual tower, 135+120mm' },
  ],
  Case: [
    { id:'case1', name:'Fractal Design Torrent', brand:'Fractal', price:189, watt:0, specs:'Full ATX, 6×140mm included', size:'ATX' },
    { id:'case2', name:'Lian Li PC-O11D EVO', brand:'Lian Li', price:169, watt:0, specs:'Mid ATX, Dual Chamber', size:'ATX' },
    { id:'case3', name:'NZXT H9 Flow', brand:'NZXT', price:199, watt:0, specs:'Mid ATX, Panoramic', size:'ATX' },
    { id:'case4', name:'Corsair 5000D Airflow', brand:'Corsair', price:149, watt:0, specs:'Mid ATX, High Airflow', size:'ATX' },
  ],
  Fans: [
    { id:'fan1', name:'Noctua NF-A12x25 (×5)', brand:'Noctua', price:109, watt:15, specs:'5×120mm PWM, ultra-quiet' },
    { id:'fan2', name:'Lian Li UNI FAN SL120 (×6)', brand:'Lian Li', price:149, watt:20, specs:'6×120mm ARGB daisy-chain' },
    { id:'fan3', name:'be quiet! Silent Wings 4 (×4)', brand:'be quiet!', price:89, watt:12, specs:'4×140mm, 29.3dB(A)' },
  ],
};

/* ===== LAPTOP DATABASE ===== */
const LAPTOPS = [
  { id:'l1', name:'MacBook Air 15" M3', brand:'Apple', thumb:'💻', price:1299, budget:'midrange', use:['school','programming'], portability:'ultralight', battery:'high', ram:'16GB', gpu:'Apple M3 10-core', cpu:'Apple M3', display:'15.3" Liquid Retina', fps: { esports:80, aaa:30 }, batteryLife:'18h', pros:['Incredible battery','Silent fanless','Best display'], cons:['No discrete GPU','Limited ports'], score:94 },
  { id:'l2', name:'ASUS ROG Zephyrus G14 2024', brand:'ASUS', thumb:'🖥️', price:1599, budget:'premium', use:['gaming','editing'], portability:'balanced', battery:'medium', ram:'32GB', gpu:'RTX 4070', cpu:'Ryzen 9 8945HS', display:'14" OLED 165Hz', fps: { esports:200, aaa:90 }, batteryLife:'8h', pros:['Top GPU performance','Compact','OLED display'], cons:['Gets warm under load','Limited battery'], score:96 },
  { id:'l3', name:'ThinkPad X1 Carbon Gen 12', brand:'Lenovo', thumb:'💼', price:1799, budget:'premium', use:['work','school','programming'], portability:'ultralight', battery:'high', ram:'32GB', gpu:'Intel Arc', cpu:'Ultra 7 165U', display:'14" IPS 2.8K', fps: { esports:60, aaa:25 }, batteryLife:'15h', pros:['Premium build','Long battery','Lightweight'], cons:['No discrete GPU','Pricey'], score:91 },
  { id:'l4', name:'HP Omen 16 2024', brand:'HP', thumb:'🎮', price:1199, budget:'midrange', use:['gaming','streaming'], portability:'powerhouse', battery:'low', ram:'16GB', gpu:'RTX 4070', cpu:'i7-13700HX', display:'16" IPS 165Hz', fps: { esports:220, aaa:80 }, batteryLife:'4h', pros:['Great gaming value','165Hz display'], cons:['Heavy','Short battery'], score:85 },
  { id:'l5', name:'Acer Swift 3 EVO', brand:'Acer', thumb:'💻', price:649, budget:'budget', use:['school','programming'], portability:'balanced', battery:'high', ram:'16GB', gpu:'Intel Iris Xe', cpu:'i5-1335U', display:'14" IPS', fps: { esports:40, aaa:20 }, batteryLife:'12h', pros:['Budget friendly','Good battery'], cons:['Weak GPU','Plastic build'], score:74 },
  { id:'l6', name:'MacBook Pro 14" M4 Pro', brand:'Apple', thumb:'💻', price:1999, budget:'premium', use:['editing','programming','ai'], portability:'balanced', battery:'high', ram:'24GB', gpu:'Apple M4 Pro 20-core', cpu:'Apple M4 Pro 12-core', display:'14.2" Liquid Retina XDR', fps: { esports:100, aaa:50 }, batteryLife:'22h', pros:['Best CPU for developers','ProMotion XDR','Exceptional ML perf'], cons:['Pricey','Not for Windows games'], score:99 },
  { id:'l7', name:'Razer Blade 16 2024', brand:'Razer', thumb:'🎮', price:2799, budget:'ultra', use:['gaming','editing','streaming'], portability:'balanced', battery:'medium', ram:'32GB', gpu:'RTX 4090', cpu:'i9-14900HX', display:'16" OLED 240Hz', fps: { esports:300, aaa:100 }, batteryLife:'5h', pros:['Desktop-class performance','Stunning OLED','Premium build'], cons:['Very expensive','Hot'], score:97 },
  { id:'l8', name:'Lenovo IdeaPad Gaming 3', brand:'Lenovo', thumb:'🎮', price:749, budget:'budget', use:['gaming','school'], portability:'powerhouse', battery:'low', ram:'16GB', gpu:'RTX 4060', cpu:'Ryzen 5 7535H', display:'15.6" 144Hz', fps: { esports:180, aaa:60 }, batteryLife:'3h', pros:['Best budget gaming','RTX 4060'], cons:['Build quality','Short battery'], score:79 },
];

/* ===== COMMUNITY DATA ===== */
const COMMUNITY_SETUPS = [
  { id:'cs1', title:'Cyberpunk Night Setup', creator:'KiraOmega', likes:4820, price:6800, tags:['RGB','Gaming','Ultrawide'], rating:4.9, thumb:'💻', color:'#00f0ff' },
  { id:'cs2', title:'Minimal White Workspace', creator:'StudioMae', likes:3210, price:3200, tags:['Minimal','Work','Clean'], rating:4.8, thumb:'⬜', color:'#ffffff' },
  { id:'cs3', title:'Triple Monitor War Station', creator:'XtremeGG', likes:6540, price:12500, tags:['Triple','Gaming','Extreme'], rating:4.7, thumb:'🖥️', color:'#ff00a0' },
  { id:'cs4', title:'Lo-Fi Cozy Corner', creator:'NightOwl_', likes:2980, price:2100, tags:['Cozy','Aesthetic','Minimal'], rating:4.6, thumb:'🪴', color:'#00ff88' },
  { id:'cs5', title:'Battlestation V2 RGB', creator:'CyberForge', likes:7830, price:9400, tags:['RGB','Gaming','Custom PC'], rating:4.9, thumb:'⬡', color:'#a000ff' },
  { id:'cs6', title:'Creator Studio Pro', creator:'VisualMark', likes:3120, price:7200, tags:['Creative','Streaming','Pro'], rating:4.8, thumb:'🎬', color:'#f5c842' },
  { id:'cs7', title:'Stealth All-Black Desk', creator:'ShadowOps', likes:5640, price:5600, tags:['Black','Minimal','Gaming'], rating:4.9, thumb:'🖤', color:'#333355' },
  { id:'cs8', title:'Pastel Dream Setup', creator:'SoftAura', likes:4100, price:3800, tags:['Pastel','Cute','Aesthetic'], rating:4.7, thumb:'🌸', color:'#ff88cc' },
];

/* ===== ACHIEVEMENTS ===== */
const ACHIEVEMENTS = [
  { id:'a1', icon:'⭐', name:'First Build', desc:'Create your first setup', unlock: s => s.savedSetups.length >= 1 },
  { id:'a2', icon:'💰', name:'Big Spender', desc:'Setup over $5,000', unlock: s => s.setup.reduce((t,i) => t + i.price * i.qty, 0) >= 5000 },
  { id:'a3', icon:'🎮', name:'Gamer', desc:'Add a gaming setup', unlock: s => s.setup.some(i => i.cat === 'pc' || i.cat === 'monitor') },
  { id:'a4', icon:'🌈', name:'RGB Lord', desc:'Add 3+ lighting items', unlock: s => s.setup.filter(i => i.cat === 'lighting').length >= 3 },
  { id:'a5', icon:'💻', name:'Collector', desc:'Save 3+ setups', unlock: s => s.savedSetups.length >= 3 },
  { id:'a6', icon:'🔊', name:'Audiophile', desc:'Add headset + speakers', unlock: s => s.setup.some(i => i.cat === 'headset') && s.setup.some(i => i.cat === 'speakers') },
  { id:'a7', icon:'🚀', name:'Power User', desc:'Build PC over $3k', unlock: s => Object.values(s.pcBuild).reduce((t, c) => t + (c ? c.price : 0), 0) >= 3000 },
  { id:'a8', icon:'🏆', name:'Elite Forger', desc:'Complete a full setup', unlock: s => s.setup.length >= 8 },
];

/* ===== PRICE HISTORY GENERATOR ===== */
function generatePriceHistory(basePrice) {
  const history = [];
  let price = basePrice * 0.85;
  for (let i = 29; i >= 0; i--) {
    const change = (Math.random() - 0.45) * basePrice * 0.06;
    price = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, price + change));
    history.push(Math.round(price));
  }
  history.push(basePrice);
  return history;
}

/* ===== INITIALIZATION ===== */
function init() {
  loadFromStorage();
  setupParticles();
  renderPopularSetups();
  renderProductGrid();
  renderPCSlots();
  renderTrackerList();
  renderCommunity('trending');
  renderProfile();
  renderAchievements();
  animateCounters();
  setupEventListeners();
  setupPillGroups();
  setTimeout(() => {
    document.getElementById('loader').classList.add('hidden');
    showNotif('Welcome to SetupForge ✦', 'success');
  }, 2000);
}

/* ===== STORAGE ===== */
function saveToStorage() {
  try {
    localStorage.setItem('sf_setup', JSON.stringify(state.setup));
    localStorage.setItem('sf_savedSetups', JSON.stringify(state.savedSetups));
    localStorage.setItem('sf_favorites', JSON.stringify(state.favorites));
    localStorage.setItem('sf_profile', JSON.stringify(state.profile));
    localStorage.setItem('sf_pcBuild', JSON.stringify(state.pcBuild));
  } catch(e) {}
}
function loadFromStorage() {
  try {
    state.setup = JSON.parse(localStorage.getItem('sf_setup') || '[]');
    state.savedSetups = JSON.parse(localStorage.getItem('sf_savedSetups') || '[]');
    state.favorites = JSON.parse(localStorage.getItem('sf_favorites') || '[]');
    state.profile = { ...state.profile, ...JSON.parse(localStorage.getItem('sf_profile') || '{}') };
    state.pcBuild = JSON.parse(localStorage.getItem('sf_pcBuild') || '{}');
  } catch(e) {}
}

/* ===== NAVIGATION ===== */
function navigateTo(page) {
  playSound('click');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById(`page-${page}`);
  if (el) el.classList.add('active');
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  state.currentPage = page;
  if (page === 'builder') renderSetupItems();
  if (page === 'pc') { renderPCSlots(); updatePCSummary(); }
  if (page === 'profile') { renderProfile(); renderSavedSetups(); renderFavorites(); renderAchievements(); }
  if (page === 'prices') renderTrackerList();
  if (page === 'community') renderCommunity(state.commTab);
}

/* ===== EVENT LISTENERS ===== */
function setupEventListeners() {
  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(item.dataset.page);
      if (window.innerWidth <= 1024) {
        document.getElementById('sidebar').classList.remove('open');
      }
    });
  });
  // Mobile menu
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
  });
  // Sound toggle
  document.getElementById('soundToggle')?.addEventListener('click', () => {
    state.sounds = !state.sounds;
    document.getElementById('soundIcon').textContent = state.sounds ? '🔊' : '🔇';
    showNotif(`Sound ${state.sounds ? 'enabled' : 'disabled'}`, 'info');
  });
  // Command palette
  document.getElementById('cmdTrigger')?.addEventListener('click', openCmdPalette);
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openCmdPalette(); }
    if (e.key === 'Escape') closeCmdPalette();
  });
  document.getElementById('cmdInput')?.addEventListener('input', renderCmdResults);
  document.querySelector('.cmd-backdrop')?.addEventListener('click', closeCmdPalette);
  // Budget slider
  document.getElementById('budgetSlider')?.addEventListener('input', e => updateBudget(e.target.value));
}

/* ===== COMMAND PALETTE ===== */
const CMD_ITEMS = [
  { icon:'◈', label:'Home', sub:'Landing Page', action: () => navigateTo('landing') },
  { icon:'⊞', label:'Setup Builder', sub:'Build your desk', action: () => navigateTo('builder') },
  { icon:'⬡', label:'PC Builder', sub:'Configure your rig', action: () => navigateTo('pc') },
  { icon:'▣', label:'Laptop Finder', sub:'Find the right laptop', action: () => navigateTo('laptop') },
  { icon:'◎', label:'AI Advisor', sub:'Smart recommendations', action: () => navigateTo('ai') },
  { icon:'◉', label:'3D Viewer', sub:'Visualize your setup', action: () => navigateTo('viewer') },
  { icon:'⟁', label:'Price Tracker', sub:'Watch for deals', action: () => navigateTo('prices') },
  { icon:'⬟', label:'Community', sub:'Browse setups', action: () => navigateTo('community') },
  { icon:'◐', label:'Profile', sub:'Your builds & favorites', action: () => navigateTo('profile') },
  { icon:'💾', label:'Save Setup', sub:'Save current setup', action: saveCurrentSetup },
  { icon:'↺', label:'Reset Setup', sub:'Clear all items', action: resetSetup },
  { icon:'🌙', label:'Toggle Day/Night', sub:'Switch theme', action: toggleDayNight },
];
function openCmdPalette() {
  playSound('click');
  document.getElementById('cmdPalette').classList.remove('hidden');
  document.getElementById('cmdInput').value = '';
  renderCmdResults();
  setTimeout(() => document.getElementById('cmdInput').focus(), 50);
}
function closeCmdPalette() {
  document.getElementById('cmdPalette').classList.add('hidden');
}
function renderCmdResults() {
  const q = document.getElementById('cmdInput').value.toLowerCase();
  const items = CMD_ITEMS.filter(i => !q || i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q));
  document.getElementById('cmdResults').innerHTML = items.map((item, idx) => `
    <div class="cmd-item" onclick="execCmd(${idx})" data-index="${idx}">
      <span class="cmd-item-icon">${item.icon}</span>
      <span class="cmd-item-label">${item.label}</span>
      <span class="cmd-item-sub">${item.sub}</span>
    </div>
  `).join('');
}
function execCmd(idx) {
  const q = document.getElementById('cmdInput').value.toLowerCase();
  const items = CMD_ITEMS.filter(i => !q || i.label.toLowerCase().includes(q) || i.sub.toLowerCase().includes(q));
  if (items[idx]) { items[idx].action(); closeCmdPalette(); }
}

/* ===== NOTIFICATIONS ===== */
function showNotif(msg, type = 'info', icon = '') {
  playSound('notif');
  const icons = { success: '✦', error: '✕', warning: '⚠', info: '◎' };
  const el = document.createElement('div');
  el.className = `notif ${type}`;
  el.innerHTML = `<span class="notif-icon">${icon || icons[type]}</span><span class="notif-msg">${msg}</span>`;
  document.getElementById('notifContainer').appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

/* ===== HERO PARTICLES ===== */
function setupParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      animation-duration: ${6 + Math.random() * 12}s;
      animation-delay: ${Math.random() * 10}s;
      --dx: ${(Math.random() - 0.5) * 100};
      opacity: ${0.3 + Math.random() * 0.5};
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
    `;
    container.appendChild(p);
  }
}

/* ===== ANIMATED COUNTERS ===== */
function animateCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  counters.forEach(el => {
    const target = +el.dataset.target;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      el.textContent = Math.round(current).toLocaleString();
      if (current >= target) clearInterval(timer);
    }, duration / steps);
  });
}

/* ===== POPULAR SETUPS ===== */
const POPULAR_SETUPS_DATA = [
  { title: 'Pro Gamer Station', price: 8400, likes: '12.4k', tags: ['Gaming', 'RGB', 'Custom PC'], color: '#00f0ff' },
  { title: 'Minimal Home Office', price: 2800, likes: '8.1k', tags: ['Minimal', 'Work', 'Clean'], color: '#a000ff' },
  { title: 'Creator Workstation', price: 6200, likes: '9.7k', tags: ['Creative', 'Dual Monitor', 'Pro'], color: '#ff00a0' },
  { title: 'Esports Ready Setup', price: 4100, likes: '7.3k', tags: ['Esports', '360Hz', 'Ultrafast'], color: '#00ff88' },
];
function renderPopularSetups() {
  const grid = document.getElementById('popularSetups');
  if (!grid) return;
  grid.innerHTML = POPULAR_SETUPS_DATA.map(s => `
    <div class="setup-card">
      <div class="setup-card-thumb">
        <span class="thumb-icon">🖥️</span>
        <div class="thumb-glow" style="background:${s.color}"></div>
      </div>
      <div class="setup-card-body">
        <div class="setup-card-title">${s.title}</div>
        <div class="setup-card-tags">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div class="setup-card-meta">
          <span class="setup-card-price">$${s.price.toLocaleString()}</span>
          <span class="setup-card-likes">♡ ${s.likes}</span>
        </div>
      </div>
    </div>
  `).join('');
}

/* ===== PRODUCT GRID ===== */
let filteredProducts = [...PRODUCTS];
function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  grid.innerHTML = filteredProducts.map(p => {
    const inFav = state.favorites.includes(p.id);
    const inSetup = state.setup.find(i => i.id === p.id);
    return `
    <div class="product-card">
      <div class="product-card-thumb">${p.icon}</div>
      <div class="product-card-body">
        <div class="product-card-name">${p.name}</div>
        <div class="product-card-brand">${p.brand}</div>
        <div class="product-card-price">$${p.price.toLocaleString()}</div>
        <div class="product-card-rating">${'★'.repeat(Math.round(p.rating))}${'☆'.repeat(5 - Math.round(p.rating))} ${p.rating}</div>
        <div class="product-card-stock ${p.stock === 'in-stock' ? 'in-stock' : p.stock === 'limited' ? 'limited' : 'out-stock'}">
          ${p.stock === 'in-stock' ? '● In Stock' : p.stock === 'limited' ? '◐ Limited' : '○ Out of Stock'}
        </div>
        <div class="product-card-actions">
          <button class="add-btn" onclick="addToSetup('${p.id}')">${inSetup ? '✓ Added' : '+ Add'}</button>
          <button class="fav-btn ${inFav ? 'active' : ''}" onclick="toggleFav('${p.id}')">♡</button>
        </div>
      </div>
    </div>`;
  }).join('');
}
function filterProducts() {
  const search = document.getElementById('builderSearch').value.toLowerCase();
  const cat = document.getElementById('builderCat').value;
  const sort = document.getElementById('builderSort').value;
  filteredProducts = PRODUCTS.filter(p => {
    const matchCat = cat === 'all' || p.cat === cat;
    const matchSearch = !search || p.name.toLowerCase().includes(search) || p.brand.toLowerCase().includes(search);
    return matchCat && matchSearch;
  });
  if (sort === 'price-asc') filteredProducts.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filteredProducts.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') filteredProducts.sort((a, b) => b.rating - a.rating);
  else if (sort === 'name') filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  renderProductGrid();
}

/* ===== SETUP BUILDER ACTIONS ===== */
function addToSetup(id) {
  playSound('add');
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const existing = state.setup.find(i => i.id === id);
  if (existing) {
    existing.qty++;
    showNotif(`${product.name} qty increased`, 'info', '⊞');
  } else {
    state.setup.push({ ...product, qty: 1 });
    showNotif(`Added ${product.name}`, 'success', '✦');
  }
  renderSetupItems();
  renderProductGrid();
  saveToStorage();
  updateBudgetDisplay();
  checkAchievements();
}
function removeFromSetup(id) {
  state.setup = state.setup.filter(i => i.id !== id);
  renderSetupItems();
  renderProductGrid();
  saveToStorage();
  updateBudgetDisplay();
}
function changeQty(id, delta) {
  const item = state.setup.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  renderSetupItems();
  updateBudgetDisplay();
  saveToStorage();
}
function renderSetupItems() {
  const container = document.getElementById('setupItems');
  if (!container) return;
  if (state.setup.length === 0) {
    container.innerHTML = `<div class="empty-setup"><div class="empty-icon">◈</div><p>Your setup is empty.<br/>Browse and add products →</p></div>`;
    return;
  }
  container.innerHTML = state.setup.map(item => `
    <div class="setup-item">
      <div class="setup-item-icon">${item.icon}</div>
      <div class="setup-item-info">
        <div class="setup-item-name">${item.name}</div>
        <div class="setup-item-price">$${(item.price * item.qty).toLocaleString()}</div>
      </div>
      <div class="setup-item-qty">
        <button class="qty-btn" onclick="changeQty('${item.id}', -1)">−</button>
        <span class="qty-num">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty('${item.id}', 1)">+</button>
      </div>
      <button class="item-remove" onclick="removeFromSetup('${item.id}')">✕</button>
    </div>
  `).join('');
  const total = state.setup.reduce((t, i) => t + i.price * i.qty, 0);
  document.getElementById('totalPrice').textContent = `$${total.toLocaleString()}`;
  // Power & space
  const totalPower = state.setup.reduce((t, i) => t + (i.watt || 0) * i.qty, 0);
  const totalSpace = state.setup.reduce((t, i) => t + (i.space || 0) * i.qty, 0);
  const el = document.getElementById('scorePower'); if (el) el.textContent = `⚡ ${totalPower}W`;
  const es = document.getElementById('scoreSpace'); if (es) es.textContent = `📐 ${Math.round(totalSpace / 100)}cm²`;
  const eg = document.getElementById('scoreGaming');
  if (eg) {
    const hasMon = state.setup.some(i => i.cat === 'monitor');
    const hasPC = state.setup.some(i => i.cat === 'pc');
    const hasKB = state.setup.some(i => i.cat === 'keyboard');
    const score = Math.min(100, (hasMon ? 30 : 0) + (hasPC ? 40 : 0) + (hasKB ? 15 : 0) + state.setup.length * 2);
    eg.textContent = `🎮 ${score}`;
  }
  updateBudgetDisplay();
}
function updateBudget(val) {
  state.budget = +val;
  document.getElementById('budgetLimit').textContent = `/ $${(+val).toLocaleString()} limit`;
  updateBudgetDisplay();
}
function updateBudgetDisplay() {
  const spent = state.setup.reduce((t, i) => t + i.price * i.qty, 0);
  const pct = Math.min(100, (spent / state.budget) * 100);
  const fill = document.getElementById('budgetFill');
  if (fill) {
    fill.style.width = pct + '%';
    fill.classList.toggle('over', pct >= 100);
  }
  const spentEl = document.getElementById('budgetSpent');
  if (spentEl) spentEl.textContent = `$${spent.toLocaleString()}`;
}
function saveCurrentSetup() {
  if (state.setup.length === 0) { showNotif('Add some items first!', 'warning'); return; }
  playSound('save');
  const name = document.getElementById('setupName')?.value || 'My Setup';
  const total = state.setup.reduce((t, i) => t + i.price * i.qty, 0);
  const savedSetup = {
    id: Date.now().toString(),
    name,
    items: [...state.setup],
    total,
    date: new Date().toLocaleDateString(),
    itemCount: state.setup.length
  };
  state.savedSetups.push(savedSetup);
  saveToStorage();
  showNotif(`"${name}" saved!`, 'success', '💾');
  checkAchievements();
}
function resetSetup() {
  if (!confirm('Reset your current setup?')) return;
  state.setup = [];
  renderSetupItems();
  renderProductGrid();
  saveToStorage();
  showNotif('Setup cleared', 'info');
}
function duplicateSetup() {
  if (state.setup.length === 0) { showNotif('Nothing to duplicate', 'warning'); return; }
  saveCurrentSetup();
  showNotif('Setup duplicated!', 'success');
}
function toggleWishlist() {
  state.wishlistMode = document.getElementById('wishlistMode').checked;
  showNotif(state.wishlistMode ? '✦ Dream Setup Mode activated' : 'Budget Mode active', state.wishlistMode ? 'success' : 'info');
}
function toggleFav(id) {
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter(f => f !== id);
  } else {
    state.favorites.push(id);
    showNotif('Added to favorites ♡', 'success');
  }
  saveToStorage();
  renderProductGrid();
  renderFavorites();
}

/* ===== PC BUILDER ===== */
const PC_SLOT_ORDER = ['CPU', 'GPU', 'Motherboard', 'RAM', 'SSD', 'PSU', 'Cooling', 'Case', 'Fans'];
const PC_ICONS = { CPU:'⚙️', GPU:'🎮', Motherboard:'🔧', RAM:'💾', SSD:'💽', PSU:'⚡', Cooling:'❄️', Case:'🖥️', Fans:'🌀' };
let currentPCSlot = null;
function renderPCSlots() {
  const container = document.getElementById('pcComponentSlots');
  if (!container) return;
  container.innerHTML = PC_SLOT_ORDER.map(cat => {
    const selected = state.pcBuild[cat];
    return `
    <div class="pc-slot ${selected ? 'filled' : 'slot-empty'}" onclick="openPCModal('${cat}')">
      <div class="slot-cat-icon">${PC_ICONS[cat]}</div>
      <div class="slot-info">
        <div class="slot-cat">${cat}</div>
        <div class="slot-name">${selected ? selected.name : 'Choose ' + cat}</div>
        ${selected ? `<div style="font-size:0.72rem;color:var(--text-2);font-family:var(--font-mono)">${selected.specs || ''}</div>` : ''}
      </div>
      ${selected ? `<div class="slot-price">$${selected.price}</div>` : '<div class="slot-add-icon">+</div>'}
      ${selected ? `<button class="slot-remove" onclick="removePCPart('${cat}',event)">✕</button>` : ''}
    </div>`;
  }).join('');
}
function openPCModal(cat) {
  playSound('click');
  currentPCSlot = cat;
  document.getElementById('modalTitle').textContent = `Select ${cat}`;
  document.getElementById('pcModal').classList.remove('hidden');
  filterModalProducts();
}
function closePCModal() {
  document.getElementById('pcModal').classList.add('hidden');
  currentPCSlot = null;
}
function filterModalProducts() {
  const q = document.getElementById('modalSearch').value.toLowerCase();
  const items = PC_COMPONENTS[currentPCSlot] || [];
  const filtered = items.filter(i => !q || i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q));
  document.getElementById('modalGrid').innerHTML = filtered.map(item => `
    <div class="product-card" onclick="selectPCPart('${currentPCSlot}', '${item.id}')" style="cursor:pointer">
      <div class="product-card-thumb">${PC_ICONS[currentPCSlot]}</div>
      <div class="product-card-body">
        <div class="product-card-name">${item.name}</div>
        <div class="product-card-brand">${item.brand}</div>
        <div class="product-card-price">$${item.price}</div>
        <div style="font-size:0.72rem;color:var(--text-2);font-family:var(--font-mono);margin-top:0.25rem">${item.specs || ''}</div>
        ${item.watt > 0 ? `<div style="font-size:0.7rem;color:var(--gold)">⚡ ${item.watt}W</div>` : ''}
      </div>
    </div>
  `).join('');
}
function selectPCPart(cat, id) {
  playSound('add');
  const items = PC_COMPONENTS[cat];
  const item = items.find(i => i.id === id);
  if (item) {
    state.pcBuild[cat] = item;
    saveToStorage();
    renderPCSlots();
    updatePCSummary();
    closePCModal();
    showNotif(`${item.name} selected`, 'success', PC_ICONS[cat]);
  }
}
function removePCPart(cat, e) {
  e.stopPropagation();
  delete state.pcBuild[cat];
  saveToStorage();
  renderPCSlots();
  updatePCSummary();
}
function resetPCBuild() {
  state.pcBuild = {};
  saveToStorage();
  renderPCSlots();
  updatePCSummary();
  showNotif('PC Build reset', 'info');
}
function savePCBuild() {
  const parts = Object.keys(state.pcBuild).length;
  if (parts === 0) { showNotif('Add components first!', 'warning'); return; }
  playSound('save');
  showNotif(`PC Build saved (${parts} components)`, 'success', '💾');
}
function updatePCSummary() {
  const build = state.pcBuild;
  let totalCost = 0, totalWatt = 0, psuCap = 0;
  const fpsData = {};
  let buildScore = 0;
  Object.values(build).forEach(c => {
    if (!c) return;
    if (c.watt < 0) { psuCap = Math.abs(c.watt); }
    else { totalWatt += (c.watt || 0); }
    totalCost += (c.price || 0);
    if (c.score) buildScore = Math.max(buildScore, c.score);
    if (c.fps) Object.entries(c.fps).forEach(([game, fps]) => { fpsData[game] = Math.min(fpsData[game] || 999, fps); });
  });
  const cpuScore = build.CPU?.score || 0;
  const gpuScore = build.GPU?.score || 0;
  buildScore = Math.round((cpuScore + gpuScore) / 2);
  const el = id => document.getElementById(id);
  if (el('pcWattage')) el('pcWattage').textContent = `${totalWatt}W`;
  if (el('pcCost')) el('pcCost').textContent = `$${totalCost.toLocaleString()}`;
  if (el('pcScore')) el('pcScore').textContent = buildScore ? `${buildScore}/100` : '—';
  const perfTiers = [[90, 'Ultra High-End'], [75, 'High-End'], [60, 'Mid-Range'], [40, 'Entry-Level'], [0, 'Select components']];
  const tier = perfTiers.find(([min]) => buildScore >= min);
  if (el('pcPerf')) el('pcPerf').textContent = tier ? tier[1] : '—';
  // PSU gauge
  if (psuCap > 0) {
    const pct = Math.round((totalWatt / psuCap) * 100);
    if (el('psuFill')) el('psuFill').style.width = Math.min(pct, 100) + '%';
    if (el('psuPct')) el('psuPct').textContent = `${pct}%`;
  } else {
    if (el('psuFill')) el('psuFill').style.width = '0%';
    if (el('psuPct')) el('psuPct').textContent = '—';
  }
  // FPS Benchmarks
  const benchList = el('benchList');
  if (benchList) {
    if (Object.keys(fpsData).length === 0) { benchList.innerHTML = '<p style="color:var(--text-2);font-size:0.82rem">Select CPU & GPU for estimates</p>'; }
    else {
      benchList.innerHTML = Object.entries(fpsData).map(([game, fps]) => `
        <div class="bench-item">
          <span class="bench-game">${game}</span>
          <div class="bench-bar-wrap"><div class="bench-bar-fill" style="width:${Math.min(fps/5, 100)}%"></div></div>
          <span class="bench-fps">${fps}+ FPS</span>
        </div>`).join('');
    }
  }
  // Compatibility
  renderCompatibility(build, totalWatt, psuCap);
  checkAchievements();
}
function renderCompatibility(build, watt, psuCap) {
  const issues = [];
  if (build.CPU && build.Motherboard) {
    if (build.CPU.socket !== build.Motherboard.socket) {
      issues.push({ type:'error', msg:`CPU socket ${build.CPU.socket} ≠ Motherboard socket ${build.Motherboard.socket}` });
    }
  }
  if (build.RAM && build.Motherboard) {
    if (build.RAM.gen !== build.Motherboard.ramGen) {
      issues.push({ type:'error', msg:`RAM ${build.RAM.gen} ≠ Motherboard ${build.Motherboard.ramGen}` });
    }
  }
  if (psuCap > 0 && watt > psuCap * 0.9) {
    issues.push({ type:'error', msg:`PSU at ${Math.round(watt/psuCap*100)}% capacity — consider upgrading` });
  } else if (psuCap > 0 && watt > psuCap * 0.75) {
    issues.push({ type:'warn', msg:`PSU load is high (${Math.round(watt/psuCap*100)}%) — monitor temperatures` });
  }
  const el = document.getElementById('compatIssues');
  if (!el) return;
  if (issues.length === 0) { el.innerHTML = '<p class="compat-ok">All components compatible ✓</p>'; }
  else { el.innerHTML = issues.map(i => `<div class="compat-issue ${i.type === 'error' ? 'compat-error' : ''}">⚠ ${i.msg}</div>`).join(''); }
}

/* ===== LAPTOP FINDER ===== */
function setupPillGroups() {
  ['laptopBudget','laptopUse','laptopPort','laptopBat','aiBudget','aiUse','aiGames','aiStyle'].forEach(groupId => {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.pill:not(.toggle-pill)').forEach(pill => {
      pill.addEventListener('click', function() {
        group.querySelectorAll('.pill:not(.toggle-pill)').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
      });
    });
  });
  // Toggle pills (multi-select)
  ['aiPrefs'].forEach(groupId => {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.toggle-pill').forEach(pill => {
      pill.addEventListener('click', function() {
        this.classList.toggle('active');
      });
    });
  });
}
function getActivePill(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return null;
  const active = group.querySelector('.pill.active');
  return active ? active.dataset.val : null;
}
function getActiveTogglePills(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return [];
  return [...group.querySelectorAll('.toggle-pill.active')].map(p => p.dataset.val);
}
function findLaptops() {
  playSound('click');
  const budget = getActivePill('laptopBudget') || 'midrange';
  const use = getActivePill('laptopUse') || 'school';
  const portability = getActivePill('laptopPort') || 'balanced';
  const battery = getActivePill('laptopBat') || 'high';
  const results = document.getElementById('laptopResults');
  if (!results) return;

  let scored = LAPTOPS.map(l => {
    let score = l.score;
    if (l.budget === budget) score += 20;
    if (l.use.includes(use)) score += 25;
    if (l.portability === portability) score += 15;
    if (l.battery === battery) score += 10;
    return { ...l, matchScore: score };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 4);

  results.innerHTML = scored.map((l, idx) => `
    <div class="laptop-card ${idx === 0 ? 'recommended' : ''}">
      ${idx === 0 ? '<div class="laptop-rec-badge">✦ Best Match</div>' : ''}
      <div class="laptop-thumb">${l.thumb}</div>
      <div>
        <div class="laptop-name">${l.name}</div>
        <div class="laptop-brand">${l.brand}</div>
        <div class="laptop-specs">
          <span class="lspec">${l.cpu}</span>
          <span class="lspec">${l.gpu}</span>
          <span class="lspec">${l.ram}</span>
          <span class="lspec">${l.display}</span>
        </div>
        <div class="laptop-pros-cons">
          ${l.pros.map(p => `<div class="pro">✓ ${p}</div>`).join('')}
          ${l.cons.map(c => `<div class="con">✗ ${c}</div>`).join('')}
        </div>
      </div>
      <div class="laptop-price-col">
        <div class="laptop-price">$${l.price.toLocaleString()}</div>
        <div class="laptop-fps">🎮 ${l.fps.esports}fps Esports</div>
        <div class="laptop-battery">🔋 ${l.batteryLife} battery</div>
        <div style="margin-top:0.75rem;font-size:0.78rem;color:var(--accent);font-family:var(--font-mono)">Score: ${l.score}/100</div>
      </div>
    </div>
  `).join('');
  showNotif(`Found ${scored.length} matching laptops`, 'success');
}

/* ===== AI ADVISOR ===== */
function generateAIRecommendation() {
  playSound('click');
  const budget = +getActivePill('aiBudget') || 2000;
  const use = getActivePill('aiUse') || 'gaming';
  const games = getActivePill('aiGames') || 'esports';
  const style = getActivePill('aiStyle') || 'rgb';
  const prefs = getActiveTogglePills('aiPrefs');

  const output = document.getElementById('aiOutput');
  if (!output) return;
  output.innerHTML = `<div class="ai-waiting"><div class="ai-orb"></div><p>Analyzing your preferences...</p></div>`;

  setTimeout(() => {
    const rec = buildAIRec(budget, use, games, style, prefs);
    output.innerHTML = `
      <div class="ai-result">
        <div class="ai-theme-badge">✦ ${rec.theme}</div>
        <div class="ai-result-title">${rec.title}</div>
        <div class="ai-result-sub">${rec.sub}</div>
        <div class="ai-sections">
          ${Object.entries(rec.sections).map(([title, items]) => `
            <div class="ai-section-card">
              <div class="ai-section-title">${title}</div>
              ${items.map(item => `
                <div class="ai-item">
                  <span class="ai-item-name">${item.name}</span>
                  <span class="ai-item-val">${item.val}</span>
                </div>`).join('')}
            </div>`).join('')}
        </div>
        <div class="ai-total">
          <span class="ai-total-label">Estimated Total Budget</span>
          <span class="ai-total-val">$${rec.total.toLocaleString()}</span>
        </div>
      </div>`;
    showNotif('AI setup generated ◎', 'success');
  }, 1500);
}

function buildAIRec(budget, use, games, style, prefs) {
  const themes = {
    rgb: 'Full RGB Battle Station',
    minimal: 'Clean Minimal Workspace',
    dark: 'Stealth All-Black Setup',
    wood: 'Warm Wood & Warmth Setup'
  };
  const themeNames = {
    rgb: 'Cyberpunk RGB Mode',
    minimal: 'Nordic Minimalist',
    dark: 'Shadow Operator',
    wood: 'Zen Workstation'
  };
  const useSubs = {
    gaming: 'Optimized for maximum frames and competitive advantage',
    work: 'Designed for deep focus and professional productivity',
    creative: 'Built for creative freedom and color accuracy',
    streaming: 'Engineered for content creation and live broadcasting',
    dev: 'Configured for development velocity and code clarity'
  };

  const factor = budget / 2000;
  const pc = budget >= 1500 ? 'Custom PC' : 'Pre-built PC';
  const cpuChoice = budget >= 3000 ? 'AMD Ryzen 9 7950X' : budget >= 2000 ? 'AMD Ryzen 7 7700X' : 'AMD Ryzen 5 7600X';
  const gpuChoice = budget >= 4000 ? 'RTX 4090' : budget >= 2500 ? 'RTX 4080 Super' : budget >= 1500 ? 'RTX 4070 Ti' : 'RTX 4060 Ti';
  const monChoice = games === 'esports' ? 'ASUS ROG Swift 360Hz' : prefs.includes('ultra-wide') ? 'Samsung Odyssey G9 49"' : 'LG 27GP950-B 4K';
  const kbChoice = style === 'minimal' ? 'Logitech G915 TKL' : 'Keychron Q1 Pro';
  const deskChoice = budget >= 3000 ? 'Uplift V2 Standing Desk' : 'Flexispot E7 Pro';
  const chairChoice = budget >= 3000 ? 'Herman Miller Embody' : 'SecretLab Titan Evo';
  const lightingChoice = prefs.includes('rgb-fans') ? 'Govee RGBIC + Nanoleaf Hexagons' : 'Govee TV Backlight T2';
  const pcTotal = Math.round(budget * 0.55);
  const periTotal = Math.round(budget * 0.2);
  const deskTotal = Math.round(budget * 0.15);
  const lightingTotal = Math.round(budget * 0.1);

  return {
    title: `Your ${themes[style]} Build`,
    theme: themeNames[style],
    sub: useSubs[use] || 'Your personalized setup recommendation',
    total: budget,
    sections: {
      '🖥 Core PC Build': [
        { name: 'CPU', val: cpuChoice },
        { name: 'GPU', val: gpuChoice },
        { name: 'RAM', val: budget >= 2000 ? '32GB DDR5 6000MHz' : '16GB DDR4 3600MHz' },
        { name: 'Storage', val: '2TB NVMe SSD' },
        { name: 'Est. Budget', val: `$${pcTotal}` },
      ],
      '⌨ Peripherals': [
        { name: 'Monitor', val: monChoice },
        { name: 'Keyboard', val: kbChoice },
        { name: 'Mouse', val: 'Logitech G Pro X Superlight 2' },
        { name: 'Headset', val: 'SteelSeries Arctis Nova Pro' },
        { name: 'Est. Budget', val: `$${periTotal}` },
      ],
      '🪑 Desk Setup': [
        { name: 'Desk', val: deskChoice },
        { name: 'Chair', val: chairChoice },
        { name: 'Mousepad', val: 'Artisan Zero XL' },
        { name: 'Est. Budget', val: `$${deskTotal}` },
      ],
      '💡 Lighting & Vibe': [
        { name: 'Lighting', val: lightingChoice },
        { name: 'Theme', val: themes[style] },
        { name: 'RGB Mode', val: prefs.includes('rgb-fans') ? 'Full RGB' : 'Accent Only' },
        { name: 'Est. Budget', val: `$${lightingTotal}` },
      ],
    }
  };
}

/* ===== 3D VIEWER ===== */
function setView(view) {
  playSound('click');
  state.viewerMode = view;
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.view-btn[onclick="setView('${view}')"]`).classList.add('active');
  const scene = document.getElementById('viewerScene');
  if (!scene) return;
  const transforms = {
    front:  'rotateX(10deg) rotateY(0deg)',
    angle:  'rotateX(15deg) rotateY(-20deg)',
    top:    'rotateX(45deg) rotateY(0deg)',
    side:   'rotateX(10deg) rotateY(-45deg)'
  };
  scene.style.transform = transforms[view] || transforms.front;
}
function toggleDayNight() {
  state.dayMode = !state.dayMode;
  document.body.classList.toggle('day-mode', state.dayMode);
  const btn = document.getElementById('viewerDayNight');
  if (btn) btn.textContent = state.dayMode ? '🌑 Night Mode' : '🌙 Day Mode';
  showNotif(state.dayMode ? 'Day mode activated ☀' : 'Night mode activated 🌙');
}
let rgbInterval = null;
let rainbowMode = false;
function setRGBColor(color, el) {
  document.querySelectorAll('.rgb-swatch').forEach(s => s.classList.remove('active'));
  if (el) el.classList.add('active');
  clearInterval(rgbInterval);
  rainbowMode = false;
  if (color === 'rainbow') {
    rainbowMode = true;
    const colors = ['#00f0ff','#ff00a0','#a000ff','#00ff88','#ff6600','#f5c842'];
    let idx = 0;
    rgbInterval = setInterval(() => {
      idx = (idx + 1) % colors.length;
      applyRGB(colors[idx]);
    }, 500);
  } else {
    applyRGB(color);
  }
}
function applyRGB(color) {
  state.rgbColor = color;
  document.documentElement.style.setProperty('--rgb-color', color);
  document.querySelectorAll('.v-rgb-strip, .v-keyboard, .v-pc-rgb-fans').forEach(el => {
    el.style.boxShadow = `0 0 20px ${color}`;
  });
  const ambL = document.getElementById('vAmbL');
  const ambR = document.getElementById('vAmbR');
  if (ambL) ambL.style.background = `rgba(${hexToRgb(color)}, 0.08)`;
  if (ambR) ambR.style.background = `rgba(${hexToRgb(color)}, 0.06)`;
}
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
function cycleRGB() {
  const colors = ['#00f0ff','#ff00a0','#a000ff','#00ff88','#ff6600'];
  const idx = colors.indexOf(state.rgbColor);
  const next = colors[(idx + 1) % colors.length];
  applyRGB(next);
  showNotif('RGB color cycled 🌈', 'info');
}

/* ===== PRICE TRACKER ===== */
let selectedTracker = null;
function renderTrackerList() {
  const list = document.getElementById('trackerList');
  if (!list) return;
  const trackItems = PRODUCTS.slice(0, 16);
  list.innerHTML = trackItems.map(p => {
    if (!state.priceHistory[p.id]) state.priceHistory[p.id] = generatePriceHistory(p.price);
    const hist = state.priceHistory[p.id];
    const prev = hist[hist.length - 2] || p.price;
    const cur = hist[hist.length - 1];
    const delta = cur - prev;
    const pct = ((delta / prev) * 100).toFixed(1);
    const cls = delta > 0 ? 'price-up' : delta < 0 ? 'price-down' : 'price-same';
    return `
    <div class="tracker-card ${selectedTracker === p.id ? 'selected' : ''}" onclick="selectTracker('${p.id}')">
      <div class="tracker-icon">${p.icon}</div>
      <div class="tracker-info">
        <div class="tracker-name">${p.name}</div>
        <div class="tracker-brand">${p.brand}</div>
        <div class="tracker-stock ${p.stock === 'in-stock' ? 'in-stock' : 'limited'}">${p.stock === 'in-stock' ? '● In Stock' : '◐ Limited'}</div>
      </div>
      <div class="tracker-price-col">
        <div class="tracker-cur-price ${cls}">$${cur}</div>
        <div class="tracker-old-price">was $${prev}</div>
        <div class="tracker-delta ${cls}">${delta >= 0 ? '▲' : '▼'} ${Math.abs(pct)}%</div>
      </div>
    </div>`;
  }).join('');
}
function selectTracker(id) {
  selectedTracker = id;
  renderTrackerList();
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  document.getElementById('chartProductName').textContent = product.name;
  renderPriceChart(id);
}
function renderPriceChart(id) {
  const canvas = document.getElementById('priceChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hist = state.priceHistory[id] || [];
  const W = canvas.offsetWidth || 400, H = 200;
  canvas.width = W; canvas.height = H;
  const pad = 30, innerW = W - pad * 2, innerH = H - pad * 2;
  const min = Math.min(...hist) * 0.95, max = Math.max(...hist) * 1.05;
  const x = i => pad + (i / (hist.length - 1)) * innerW;
  const y = v => pad + innerH - ((v - min) / (max - min)) * innerH;
  ctx.clearRect(0, 0, W, H);
  // Grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const yy = pad + (i / 4) * innerH;
    ctx.beginPath(); ctx.moveTo(pad, yy); ctx.lineTo(W - pad, yy); ctx.stroke();
  }
  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad, 0, H - pad);
  grad.addColorStop(0, 'rgba(0,240,255,0.18)'); grad.addColorStop(1, 'rgba(0,240,255,0)');
  ctx.beginPath();
  ctx.moveTo(x(0), y(hist[0]));
  hist.forEach((v, i) => ctx.lineTo(x(i), y(v)));
  ctx.lineTo(x(hist.length - 1), H - pad); ctx.lineTo(x(0), H - pad);
  ctx.closePath(); ctx.fillStyle = grad; ctx.fill();
  // Line
  ctx.beginPath(); ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  hist.forEach((v, i) => i === 0 ? ctx.moveTo(x(i), y(v)) : ctx.lineTo(x(i), y(v)));
  ctx.stroke();
  // Dots: min, max, current
  const minIdx = hist.indexOf(Math.min(...hist));
  const maxIdx = hist.indexOf(Math.max(...hist));
  [[minIdx, '#00ff88'], [maxIdx, '#ff4060'], [hist.length - 1, '#00f0ff']].forEach(([idx, color]) => {
    ctx.beginPath(); ctx.arc(x(idx), y(hist[idx]), 5, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.fillStyle = color; ctx.font = '11px DM Mono, monospace';
    ctx.fillText(`$${hist[idx]}`, x(idx) + 7, y(hist[idx]) + 4);
  });
}
function simulatePriceUpdate() {
  Object.keys(state.priceHistory).forEach(id => {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;
    const hist = state.priceHistory[id];
    const last = hist[hist.length - 1];
    const newPrice = Math.max(product.price * 0.7, Math.min(product.price * 1.3, last + (Math.random() - 0.45) * product.price * 0.07));
    hist.push(Math.round(newPrice));
    if (hist.length > 31) hist.shift();
  });
  renderTrackerList();
  if (selectedTracker) renderPriceChart(selectedTracker);
  showNotif('Prices updated ⟳', 'info');
}

/* ===== COMMUNITY ===== */
function setCommTab(tab, el) {
  state.commTab = tab;
  document.querySelectorAll('.comm-tab').forEach(t => t.classList.remove('active'));
  if (el) el.classList.add('active');
  renderCommunity(tab);
}
function renderCommunity(tab) {
  const grid = document.getElementById('communityGrid');
  if (!grid) return;
  if (tab === 'battle') {
    const [a, b] = [COMMUNITY_SETUPS[0], COMMUNITY_SETUPS[2]];
    grid.innerHTML = `
      <div class="battle-section" style="grid-column:1/-1">
        ${renderCommunityCard(a)}
        <div class="vs-badge">VS</div>
        ${renderCommunityCard(b)}
      </div>`;
    return;
  }
  let data = [...COMMUNITY_SETUPS];
  if (tab === 'top') data.sort((a, b) => b.rating - a.rating);
  else data.sort((a, b) => b.likes - a.likes);
  grid.innerHTML = data.map(s => renderCommunityCard(s)).join('');
}
function renderCommunityCard(s) {
  const liked = state.profile.likedSetups?.includes(s.id);
  return `
    <div class="community-card">
      <div class="comm-thumb">
        <div class="comm-thumb-icon">${s.thumb}</div>
        <div class="comm-thumb-overlay"></div>
        <div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 30%, ${s.color}22, transparent 60%)"></div>
        <div class="comm-creator">
          <div class="creator-avatar">${s.creator[0]}</div>
          <span class="creator-name">${s.creator}</span>
        </div>
      </div>
      <div class="comm-body">
        <div class="comm-title">${s.title}</div>
        <div class="comm-tags">${s.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <div class="comm-rating">${'★'.repeat(Math.round(s.rating))}${'☆'.repeat(5 - Math.round(s.rating))} ${s.rating}</div>
        <div class="comm-actions">
          <button class="comm-like-btn ${liked ? 'liked' : ''}" onclick="likeSetup('${s.id}', this)">
            ${liked ? '♥' : '♡'} ${(s.likes + (liked ? 1 : 0)).toLocaleString()}
          </button>
          <span class="comm-price">$${s.price.toLocaleString()}</span>
        </div>
      </div>
    </div>`;
}
function likeSetup(id, btn) {
  playSound('click');
  if (!state.profile.likedSetups) state.profile.likedSetups = [];
  const liked = state.profile.likedSetups.includes(id);
  if (liked) {
    state.profile.likedSetups = state.profile.likedSetups.filter(i => i !== id);
  } else {
    state.profile.likedSetups.push(id);
    showNotif('Setup liked ♥', 'success');
  }
  saveToStorage();
  renderCommunity(state.commTab);
}

/* ===== PROFILE ===== */
function renderProfile() {
  const nameEl = document.getElementById('profileName');
  if (nameEl) nameEl.value = state.profile.name;
  const avatarEl = document.getElementById('profileAvatar');
  if (avatarEl) avatarEl.textContent = state.profile.avatar;
  const el = id => document.getElementById(id);
  if (el('pSetupCount')) el('pSetupCount').textContent = state.savedSetups.length;
  if (el('pLikeCount')) el('pLikeCount').textContent = state.profile.likedSetups?.length || 0;
  if (el('pFavCount')) el('pFavCount').textContent = state.favorites.length;
}
function saveProfile() {
  state.profile.name = document.getElementById('profileName')?.value || 'SetupForger';
  saveToStorage();
}
function changeAvatar() {
  const emojis = ['SF','⬡','◈','◎','◉','◐','⊞','⟁','⬟'];
  const cur = state.profile.avatar;
  const next = emojis[(emojis.indexOf(cur) + 1) % emojis.length];
  state.profile.avatar = next;
  const el = document.getElementById('profileAvatar');
  if (el) el.textContent = next;
  saveToStorage();
}
function renderSavedSetups() {
  const list = document.getElementById('savedSetupsList');
  if (!list) return;
  if (state.savedSetups.length === 0) { list.innerHTML = '<p class="empty-msg">No saved setups yet. Build and save one!</p>'; return; }
  list.innerHTML = state.savedSetups.map(s => `
    <div class="saved-setup-item">
      <div>
        <div class="saved-setup-name">${s.name}</div>
        <div class="saved-setup-meta">${s.itemCount} items · $${s.total.toLocaleString()} · ${s.date}</div>
      </div>
      <div class="saved-setup-actions">
        <button class="icon-btn" onclick="loadSavedSetup('${s.id}')" title="Load">↩</button>
        <button class="icon-btn" onclick="deleteSavedSetup('${s.id}')" title="Delete" style="color:var(--red)">✕</button>
      </div>
    </div>`).join('');
}
function loadSavedSetup(id) {
  const s = state.savedSetups.find(ss => ss.id === id);
  if (!s) return;
  state.setup = [...s.items];
  navigateTo('builder');
  renderSetupItems();
  saveToStorage();
  showNotif(`"${s.name}" loaded`, 'success', '↩');
}
function deleteSavedSetup(id) {
  state.savedSetups = state.savedSetups.filter(s => s.id !== id);
  saveToStorage();
  renderSavedSetups();
  renderProfile();
  showNotif('Setup deleted', 'info');
}
function renderFavorites() {
  const list = document.getElementById('favoritesList');
  if (!list) return;
  if (state.favorites.length === 0) { list.innerHTML = '<p class="empty-msg">No favorites yet.</p>'; return; }
  list.innerHTML = state.favorites.map(id => {
    const p = PRODUCTS.find(pr => pr.id === id);
    if (!p) return '';
    return `
    <div class="saved-setup-item">
      <div style="font-size:1.3rem;margin-right:0.5rem">${p.icon}</div>
      <div><div class="saved-setup-name">${p.name}</div><div class="saved-setup-meta">${p.brand} · $${p.price}</div></div>
      <button class="icon-btn" onclick="toggleFav('${p.id}')" style="color:var(--red)">✕</button>
    </div>`;
  }).join('');
}

/* ===== ACHIEVEMENTS ===== */
function checkAchievements() {
  renderAchievements();
}
function renderAchievements() {
  const list = document.getElementById('achievementsList');
  if (!list) return;
  list.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = a.unlock(state);
    return `
    <div class="achievement ${unlocked ? 'unlocked' : 'locked'}" title="${a.desc}">
      <div class="achievement-icon">${unlocked ? a.icon : '🔒'}</div>
      <div class="achievement-name">${a.name}</div>
    </div>`;
  }).join('');
}

/* ===== FLOATING DOCK ===== */
window.navigateTo = navigateTo;
window.addToSetup = addToSetup;
window.removeFromSetup = removeFromSetup;
window.changeQty = changeQty;
window.saveCurrentSetup = saveCurrentSetup;
window.resetSetup = resetSetup;
window.duplicateSetup = duplicateSetup;
window.toggleWishlist = toggleWishlist;
window.toggleFav = toggleFav;
window.filterProducts = filterProducts;
window.openPCModal = openPCModal;
window.closePCModal = closePCModal;
window.filterModalProducts = filterModalProducts;
window.selectPCPart = selectPCPart;
window.removePCPart = removePCPart;
window.savePCBuild = savePCBuild;
window.resetPCBuild = resetPCBuild;
window.findLaptops = findLaptops;
window.generateAIRecommendation = generateAIRecommendation;
window.setView = setView;
window.toggleDayNight = toggleDayNight;
window.setRGBColor = setRGBColor;
window.cycleRGB = cycleRGB;
window.selectTracker = selectTracker;
window.simulatePriceUpdate = simulatePriceUpdate;
window.setCommTab = setCommTab;
window.likeSetup = likeSetup;
window.changeAvatar = changeAvatar;
window.saveProfile = saveProfile;
window.loadSavedSetup = loadSavedSetup;
window.deleteSavedSetup = deleteSavedSetup;
window.openCmdPalette = openCmdPalette;
window.execCmd = execCmd;
window.updateBudget = updateBudget;

/* ===== START ===== */
document.addEventListener('DOMContentLoaded', init);

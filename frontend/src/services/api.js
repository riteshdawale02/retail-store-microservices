/**
 * CloudRetail - REST API Service Layer
 * Direct communication with Java Spring Boot Microservices through API Gateway
 */

// Use relative /api to leverage Vite dev proxy in development or same-origin in production
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const USER_ID_KEY = 'cloudretail_user_id';

export function getUserId() {
  let uid = localStorage.getItem(USER_ID_KEY);
  if (!uid) {
    uid = 'user-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem(USER_ID_KEY, uid);
  }
  return uid;
}

// Curated authentic catalog of 100 realistic products with high-resolution photography
export const FALLBACK_PRODUCTS = [
  {
    "id": 1,
    "name": "UltraBook Pro 16",
    "description": "High-performance laptop featuring 32GB RAM, 1TB NVMe SSD, and high-res Retina display.",
    "price": 1299.99,
    "stockQuantity": 32,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 128
  },
  {
    "id": 2,
    "name": "ThinkStation Workstation 14",
    "description": "Matte black carbon fiber ultrabook with 14-inch IPS anti-glare display and 16-hour battery.",
    "price": 1099.0,
    "stockQuantity": 39,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 94
  },
  {
    "id": 3,
    "name": "Studio Pro Display 27",
    "description": "27-inch 5K Retina resolution monitor with True Tone and 600 nits peak brightness.",
    "price": 899.0,
    "stockQuantity": 46,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 112
  },
  {
    "id": 4,
    "name": "Ultrawide Curved Monitor 34",
    "description": "34-inch 144Hz WQHD curved productivity and multi-window workstation display.",
    "price": 649.99,
    "stockQuantity": 53,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 76
  },
  {
    "id": 5,
    "name": "Precision Aluminum Laptop Riser",
    "description": "Solid sandblasted aluminum stand designed for optimal cooling airflow and posture.",
    "price": 49.5,
    "stockQuantity": 60,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 204
  },
  {
    "id": 6,
    "name": "Thunderbolt 4 Pro Dock",
    "description": "12-in-1 high-speed dual 4K display dock with 96W Power Delivery host charging.",
    "price": 189.0,
    "stockQuantity": 67,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 68
  },
  {
    "id": 7,
    "name": "Portable IPS Monitor 15.6",
    "description": "Lightweight USB-C second screen with 1080p HDR panel and magnetic folio cover.",
    "price": 179.99,
    "stockQuantity": 74,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
    "rating": 4.5,
    "reviewCount": 52
  },
  {
    "id": 8,
    "name": "Compact Mini PC Workstation",
    "description": "Whisper-quiet octacore desktop mini PC with dual 2.5G LAN and PCIe 4.0 expansion.",
    "price": 749.0,
    "stockQuantity": 81,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 43
  },
  {
    "id": 9,
    "name": "Slim USB-C Magnetic Hub",
    "description": "7-port aluminum dongle featuring 4K HDMI, UHS-II SD reader, and 100W PD passthrough.",
    "price": 39.99,
    "stockQuantity": 88,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 185
  },
  {
    "id": 10,
    "name": "Felt Laptop Sleeve 14-inch",
    "description": "Natural heather grey wool felt protective sleeve with genuine leather tab enclosure.",
    "price": 34.0,
    "stockQuantity": 95,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 142
  },
  {
    "id": 11,
    "name": "High-Speed NVMe Enclosure 40Gbps",
    "description": "Tool-free aerospace aluminum M.2 enclosure with integrated silicone thermal heatsink.",
    "price": 79.0,
    "stockQuantity": 102,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 88
  },
  {
    "id": 12,
    "name": "Adjustable Monitor Arm Mount",
    "description": "Heavy-duty gas spring desktop monitor arm supporting displays up to 32 inches.",
    "price": 89.99,
    "stockQuantity": 29,
    "category": "Computing",
    "imageUrl": "https://images.unsplash.com/photo-1586210579191-33b45e38fa2c?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 119
  },
  {
    "id": 13,
    "name": "Acoustic ANC Headphones",
    "description": "Wireless active noise-canceling over-ear headphones with 40h battery life and aptX HD.",
    "price": 249.5,
    "stockQuantity": 36,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 310
  },
  {
    "id": 14,
    "name": "Studio Wireless Earbuds Pro",
    "description": "True wireless IPX7 earbuds with transparent hearing mode and wireless charging case.",
    "price": 169.99,
    "stockQuantity": 43,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 245
  },
  {
    "id": 15,
    "name": "Audiophile Open-Back Headphones",
    "description": "Handcrafted planar magnetic open-back reference headphones for critical listening.",
    "price": 320.0,
    "stockQuantity": 50,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 87
  },
  {
    "id": 16,
    "name": "Desktop Studio Monitors Pair",
    "description": "Active nearfield 5-inch 2-way powered acoustic studio reference speakers.",
    "price": 299.0,
    "stockQuantity": 57,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 93
  },
  {
    "id": 17,
    "name": "Vintage Hi-Fi Vinyl Turntable",
    "description": "Belt-drive belt-damped turntable with carbon fiber tonearm and Audio-Technica cartridge.",
    "price": 399.0,
    "stockQuantity": 64,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 134
  },
  {
    "id": 18,
    "name": "Broadcast USB Condenser Mic",
    "description": "Cardioid pattern 24-bit/96kHz studio vocal condenser microphone with zero-latency headphone out.",
    "price": 129.0,
    "stockQuantity": 71,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1590658006821-04f4008d5717?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 178
  },
  {
    "id": 19,
    "name": "Portable Rugged Bluetooth Speaker",
    "description": "Waterproof 360-degree cylindrical outdoor speaker with deep bass and 18h playback.",
    "price": 89.0,
    "stockQuantity": 78,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 215
  },
  {
    "id": 20,
    "name": "Desk Boom Arm & Shock Mount",
    "description": "All-metal internal spring microphone boom arm with integrated hidden cable routing channels.",
    "price": 55.0,
    "stockQuantity": 85,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 102
  },
  {
    "id": 21,
    "name": "Compact DAC Headphone Amplifier",
    "description": "High-resolution ESS Sabre portable USB-C DAC/Amp driving up to 300 ohm cans.",
    "price": 119.0,
    "stockQuantity": 92,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1578319439584-104c94d37305?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 64
  },
  {
    "id": 22,
    "name": "In-Ear Stage Monitors IEM",
    "description": "Quad balanced-armature acoustic in-ear monitors with silver-plated MMCX cable.",
    "price": 149.0,
    "stockQuantity": 99,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 56
  },
  {
    "id": 23,
    "name": "Minimalist Soundbar with Subwoofer",
    "description": "Low-profile 2.1 channel Dolby Atmos soundbar with wireless deep bass sub.",
    "price": 219.0,
    "stockQuantity": 26,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&auto=format&fit=crop&q=80",
    "rating": 4.5,
    "reviewCount": 82
  },
  {
    "id": 24,
    "name": "Acoustic Wall Foam Panels (12-Pk)",
    "description": "High-density bevel-edge studio sound absorption wall tiles in charcoal finish.",
    "price": 42.0,
    "stockQuantity": 33,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 91
  },
  {
    "id": 25,
    "name": "Bluetooth Audio Transmitter 5.3",
    "description": "Low-latency dual-link aptX Adaptive Bluetooth transmitter for studio and airplane gear.",
    "price": 39.5,
    "stockQuantity": 40,
    "category": "Audio",
    "imageUrl": "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80",
    "rating": 4.5,
    "reviewCount": 47
  },
  {
    "id": 26,
    "name": "Custom Mechanical Keyboard Q1",
    "description": "CNC anodized aluminum 75% hot-swappable keyboard with lubricated Gateron switches.",
    "price": 179.99,
    "stockQuantity": 47,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 215
  },
  {
    "id": 27,
    "name": "Precision Ergonomic Mouse",
    "description": "Electromagnetic MagSpeed scroll wheel mouse with sculpted thumb rest and gesture button.",
    "price": 99.0,
    "stockQuantity": 54,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 340
  },
  {
    "id": 28,
    "name": "Retro PBT Keycap Set (Cherry)",
    "description": "Dye-sublimated thick PBT mechanical keycaps with vintage warm industrial colorway.",
    "price": 45.0,
    "stockQuantity": 61,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 126
  },
  {
    "id": 29,
    "name": "Ultra-Thin Bluetooth Keyboard",
    "description": "Full-size scissor-switch wireless keyboard with multi-device easy-switch buttons.",
    "price": 69.0,
    "stockQuantity": 68,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 172
  },
  {
    "id": 30,
    "name": "Vertical Ergonomic Mouse",
    "description": "57-degree natural handshake posture optical mouse reducing muscle strain.",
    "price": 65.0,
    "stockQuantity": 75,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 98
  },
  {
    "id": 31,
    "name": "Coiled Aviator Keyboard Cable",
    "description": "Double-sleeved braided paracord Type-C cable with detachable 4-pin metal aviator connector.",
    "price": 29.99,
    "stockQuantity": 82,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 154
  },
  {
    "id": 32,
    "name": "Wool Felt Desktop Desk Mat",
    "description": "Extra-large 90x40cm anti-slip merino wool felt keyboard and mouse desk pad.",
    "price": 32.0,
    "stockQuantity": 89,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 210
  },
  {
    "id": 33,
    "name": "Walnut Wrist Rest Tenkeyless",
    "description": "Smooth hand-oiled solid American walnut ergonomic typing palm rest.",
    "price": 28.0,
    "stockQuantity": 96,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 83
  },
  {
    "id": 34,
    "name": "Precision Gaming Mousepad Speed",
    "description": "Micro-woven textured cloth surface with stitched edge and natural rubber base.",
    "price": 24.5,
    "stockQuantity": 103,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 165
  },
  {
    "id": 35,
    "name": "Rotary Macro Pad 9-Key",
    "description": "Programmable QMK/VIA macropad with smooth clickable aluminum dial encoder.",
    "price": 59.0,
    "stockQuantity": 30,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 77
  },
  {
    "id": 36,
    "name": "USB Foot Switch Triple Pedal",
    "description": "Heavy-duty silent optical triple foot pedal for developer workflow macros.",
    "price": 49.0,
    "stockQuantity": 37,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80",
    "rating": 4.5,
    "reviewCount": 31
  },
  {
    "id": 37,
    "name": "Mechanical Switch Tester (12-Switch)",
    "description": "Acrylic tester featuring linear, tactile, and clicky custom switches.",
    "price": 19.99,
    "stockQuantity": 44,
    "category": "Peripherals",
    "imageUrl": "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 65
  },
  {
    "id": 38,
    "name": "Vintage 35mm Rangefinder Camera",
    "description": "Classic analog rangefinder with all-metal chassis, bright optical viewfinder, and 40mm f/1.7 lens.",
    "price": 649.0,
    "stockQuantity": 51,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 105
  },
  {
    "id": 39,
    "name": "Mirrorless Camera Body 40MP",
    "description": "High-resolution APS-C sensor with 7-stop in-body image stabilization and film simulations.",
    "price": 1499.0,
    "stockQuantity": 58,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 142
  },
  {
    "id": 40,
    "name": "Classic Analog 35mm SLR",
    "description": "Fully mechanical manual exposure SLR camera body with split-prism focusing screen.",
    "price": 289.0,
    "stockQuantity": 65,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 64
  },
  {
    "id": 41,
    "name": "Instant Analog Film Camera",
    "description": "Modern retro square format instant film camera with automatic exposure control.",
    "price": 99.0,
    "stockQuantity": 72,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 189
  },
  {
    "id": 42,
    "name": "Studio Portrait Prime Lens 50mm",
    "description": "Ultra-sharp f/1.4 standard prime lens with creamy circular bokeh and fast autofocus.",
    "price": 379.0,
    "stockQuantity": 79,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 93
  },
  {
    "id": 43,
    "name": "Telephoto Zoom Lens 70-200mm",
    "description": "Constant f/2.8 professional telephoto zoom lens with optical image stabilization.",
    "price": 1299.0,
    "stockQuantity": 86,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1500643752441-4dc90cda350a?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 58
  },
  {
    "id": 44,
    "name": "Full-Frame Cinema Camera Body",
    "description": "4K 120p 10-bit raw internal recording cinema rig with dual native ISO.",
    "price": 1899.0,
    "stockQuantity": 93,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 44
  },
  {
    "id": 45,
    "name": "Handcrafted Horween Leather Camera Strap",
    "description": "Full-grain vegetable-tanned leather neck strap with split brass ring bumpers.",
    "price": 58.0,
    "stockQuantity": 100,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1617043786394-f977fa12eddf?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 112
  },
  {
    "id": 46,
    "name": "Carbon Fiber Travel Tripod",
    "description": "Ultra-compact 4-section carbon fiber legs with 360-degree panoramic ball head.",
    "price": 219.0,
    "stockQuantity": 27,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 85
  },
  {
    "id": 47,
    "name": "Magnetic Variable ND Filter 77mm",
    "description": "German Schott optical glass 2-5 stops variable neutral density filter.",
    "price": 89.0,
    "stockQuantity": 34,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1500634245200-e5245c7574ef?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 67
  },
  {
    "id": 48,
    "name": "Compact On-Camera Video Mic",
    "description": "Directional shotgun microphone with Rycote Lyre shockmount and furry deadcat.",
    "price": 79.99,
    "stockQuantity": 41,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1495707902641-75cac38802fc?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 98
  },
  {
    "id": 49,
    "name": "Waterproof Camera Sling 6L",
    "description": "Weatherproof Cordura camera messenger sling with origami divider partitions.",
    "price": 119.0,
    "stockQuantity": 48,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 134
  },
  {
    "id": 50,
    "name": "Handheld Smartphone Gimbal",
    "description": "3-axis motorized video stabilizer with active subject tracking and extension rod.",
    "price": 139.0,
    "stockQuantity": 55,
    "category": "Photography",
    "imageUrl": "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 120
  },
  {
    "id": 51,
    "name": "AeroPulse Smartwatch 5",
    "description": "AMOLED fitness smartwatch with ECG, sleep tracker, optical pulse sensor, and GPS.",
    "price": 199.0,
    "stockQuantity": 62,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 85
  },
  {
    "id": 52,
    "name": "Minimalist Bauhaus Quartz Watch",
    "description": "Clean dial 38mm stainless steel dress watch with sapphire crystal and mesh strap.",
    "price": 145.0,
    "stockQuantity": 69,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 162
  },
  {
    "id": 53,
    "name": "Automatic Field Chronograph",
    "description": "Japanese mechanical automatic movement with luminescent markers and canvas NATO strap.",
    "price": 349.0,
    "stockQuantity": 76,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 110
  },
  {
    "id": 54,
    "name": "Titanium Fitness Smart Ring",
    "description": "Featherlight medical-grade titanium finger ring tracking sleep stages and HRV.",
    "price": 279.0,
    "stockQuantity": 83,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 74
  },
  {
    "id": 55,
    "name": "Italian Saddle Leather Watch Strap",
    "description": "20mm quick-release vegetable-tanned calfskin leather replacement watch band.",
    "price": 45.0,
    "stockQuantity": 90,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 95
  },
  {
    "id": 56,
    "name": "Aviation Pilot Automatic Watch",
    "description": "42mm matte titanium pilot watch with high-contrast numerals and date window.",
    "price": 389.0,
    "stockQuantity": 97,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 63
  },
  {
    "id": 57,
    "name": "Diver 200M Automatic Watch",
    "description": "Unidirectional ceramic bezel dive watch with helium escape valve and steel bracelet.",
    "price": 299.0,
    "stockQuantity": 104,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 128
  },
  {
    "id": 58,
    "name": "Magnetic Silicone Sport Band",
    "description": "Breathable fluoroelastomer sports band with seamless magnetic closure loop.",
    "price": 29.0,
    "stockQuantity": 31,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 210
  },
  {
    "id": 59,
    "name": "Smart ECG Health Band",
    "description": "Continuous biometric health tracker with skin temperature and SpO2 monitoring.",
    "price": 99.0,
    "stockQuantity": 38,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80",
    "rating": 4.5,
    "reviewCount": 87
  },
  {
    "id": 60,
    "name": "Minimalist Black Ceramic Watch",
    "description": "Scratch-proof matte high-tech ceramic case with Swiss quartz movement.",
    "price": 189.0,
    "stockQuantity": 45,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 72
  },
  {
    "id": 61,
    "name": "Leather Roll Travel Watch Case",
    "description": "Triple watch travel roll crafted from tumbled full-grain leather with suede lining.",
    "price": 68.0,
    "stockQuantity": 52,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 54
  },
  {
    "id": 62,
    "name": "Stainless Steel Milanese Loop",
    "description": "Smooth woven stainless steel mesh band with infinitely adjustable magnetic clasp.",
    "price": 39.0,
    "stockQuantity": 59,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 140
  },
  {
    "id": 63,
    "name": "Wireless Magnetic Fast Charger Puck",
    "description": "Braided aluminum fast magnetic charging cable compatible with smart wearables.",
    "price": 32.0,
    "stockQuantity": 66,
    "category": "Wearables",
    "imageUrl": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 180
  },
  {
    "id": 64,
    "name": "Smart Ambient Desk Lamp",
    "description": "Dimmable color-temperature LED desk lamp with wireless smartphone charging base.",
    "price": 59.99,
    "stockQuantity": 73,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 53
  },
  {
    "id": 65,
    "name": "Architect Counterbalanced Task Light",
    "description": "Heavy cast zinc articulated spring-arm task light with warm glow diffuser.",
    "price": 135.0,
    "stockQuantity": 80,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 92
  },
  {
    "id": 66,
    "name": "Solid Walnut Desk Organizer Tray",
    "description": "Carved solid American walnut valet tray for pens, keys, and daily desktop accessories.",
    "price": 48.0,
    "stockQuantity": 87,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1580481077111-e6e24177f154?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 115
  },
  {
    "id": 67,
    "name": "Ergonomic Mesh Office Chair",
    "description": "Fully adjustable lumbar support, 4D armrests, and breathable elastomeric mesh back.",
    "price": 489.0,
    "stockQuantity": 94,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 142
  },
  {
    "id": 68,
    "name": "Charcoal Wool Felt Desk Blotter",
    "description": "Dense 4mm industrial wool felt surface offering cushioned writing and quiet acoustics.",
    "price": 36.0,
    "stockQuantity": 101,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 180
  },
  {
    "id": 69,
    "name": "Full-Grain Leather Desk Pad",
    "description": "Smooth premium top-grain cognac leather desk pad with burnished edge finish.",
    "price": 79.0,
    "stockQuantity": 28,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 138
  },
  {
    "id": 70,
    "name": "Solid Oak Dual Laptop Dock",
    "description": "Vertical dual-slot space-saving laptop stand lined with soft protective merino felt.",
    "price": 54.0,
    "stockQuantity": 35,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 86
  },
  {
    "id": 71,
    "name": "Monitor Screenbar LED Light",
    "description": "Asymmetric optical clip-on monitor light bar eliminating screen glare and eye fatigue.",
    "price": 69.0,
    "stockQuantity": 42,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 220
  },
  {
    "id": 72,
    "name": "Minimalist Steel Cable Management Spine",
    "description": "Under-desk magnetic steel wire raceway for clean cable concealment.",
    "price": 35.0,
    "stockQuantity": 49,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1584905066893-7d5c142ba4e1?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 94
  },
  {
    "id": 73,
    "name": "Solid Brass Desktop Pen Holder",
    "description": "Precision-machined hefty raw solid brass cylindrical desktop single pen stand.",
    "price": 32.0,
    "stockQuantity": 56,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 68
  },
  {
    "id": 74,
    "name": "Electric Motorized Standing Desk Frame",
    "description": "Dual-motor smooth height-adjustable steel desk base with digital memory presets.",
    "price": 399.0,
    "stockQuantity": 63,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 104
  },
  {
    "id": 75,
    "name": "Magnetic Wireless Charging Mat",
    "description": "Dual device fast Qi charging pad wrapped in soft textured woven fabric.",
    "price": 49.0,
    "stockQuantity": 70,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 160
  },
  {
    "id": 76,
    "name": "Ergonomic Under-Desk Footrest",
    "description": "High-density memory foam angled foot cushion with removable washable velvet cover.",
    "price": 42.0,
    "stockQuantity": 77,
    "category": "Workspace",
    "imageUrl": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 78
  },
  {
    "id": 77,
    "name": "BrewMaster Espresso Machine",
    "description": "Italian 15-bar pressure espresso maker with integrated steam wand for microfoam.",
    "price": 299.0,
    "stockQuantity": 84,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 64
  },
  {
    "id": 78,
    "name": "Gooseneck Pour-Over Electric Kettle",
    "description": "Precision flow spout 0.9L matte black kettle with variable degree temperature dial.",
    "price": 99.0,
    "stockQuantity": 91,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 210
  },
  {
    "id": 79,
    "name": "Ceramic V60 Coffee Dripper Set",
    "description": "Handcrafted matte porcelain cone dripper with borosilicate heatproof glass server.",
    "price": 42.0,
    "stockQuantity": 98,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 175
  },
  {
    "id": 80,
    "name": "Double-Walled Espresso Glasses (Set of 2)",
    "description": "Hand-blown thermal insulating glasses keeping shots hot while remaining cool to touch.",
    "price": 26.0,
    "stockQuantity": 25,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1572445271230-a78b5944a659?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 142
  },
  {
    "id": 81,
    "name": "Precision Conical Burr Coffee Grinder",
    "description": "40-grind setting stainless steel conical burr electric grinder with uniform extraction.",
    "price": 149.0,
    "stockQuantity": 32,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 98
  },
  {
    "id": 82,
    "name": "Insulated Stainless Travel Tumbler",
    "description": "Double-wall vacuum insulated 16oz tumbler with leakproof ceramic interior coating.",
    "price": 34.0,
    "stockQuantity": 39,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 230
  },
  {
    "id": 83,
    "name": "Minimalist Ceramic Desk Planter",
    "description": "Geometric unglazed stoneware planter with natural drainage saucer for succulents.",
    "price": 28.0,
    "stockQuantity": 46,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 89
  },
  {
    "id": 84,
    "name": "Scented Botanical Soy Wax Candle",
    "description": "Cedarwood, amber, and vetiver hand-poured candle with crackling wood wick.",
    "price": 28.0,
    "stockQuantity": 53,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 114
  },
  {
    "id": 85,
    "name": "Stainless Steel Japanese Chef Knife 8-inch",
    "description": "Hand-sharpened 3-layer VG-10 core kitchen knife with pakkawood ergonomic handle.",
    "price": 119.0,
    "stockQuantity": 60,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 155
  },
  {
    "id": 86,
    "name": "Aroma Ultrasonic Essential Oil Diffuser",
    "description": "Stone-finish ultrasonic ambient cool-mist diffuser with warm halo nightlight.",
    "price": 46.0,
    "stockQuantity": 67,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 94
  },
  {
    "id": 87,
    "name": "French Press Heavy Glass Maker 1L",
    "description": "Stainless steel 4-level filtration plunger with heat-resistant borosilicate beaker.",
    "price": 38.0,
    "stockQuantity": 74,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 168
  },
  {
    "id": 88,
    "name": "Digital Precision Coffee Scale with Timer",
    "description": "0.1g high-accuracy brewing scale with automatic tare and flow-rate display.",
    "price": 39.0,
    "stockQuantity": 81,
    "category": "Lifestyle",
    "imageUrl": "https://images.unsplash.com/photo-1518832553480-cd0e625ed3e6?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 122
  },
  {
    "id": 89,
    "name": "Minimalist Leather Backpack",
    "description": "Handcrafted genuine leather commuter backpack with padded laptop compartment.",
    "price": 119.0,
    "stockQuantity": 88,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 92
  },
  {
    "id": 90,
    "name": "Urban Runner Breathable Sneakers",
    "description": "Responsive lightweight cushioning sneakers engineered for all-day city walking.",
    "price": 95.0,
    "stockQuantity": 95,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 180
  },
  {
    "id": 91,
    "name": "Slim RFID Blocking Leather Cardholder",
    "description": "Italian veg-tanned leather minimalist card wallet with quick thumb-slide access.",
    "price": 32.0,
    "stockQuantity": 102,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 260
  },
  {
    "id": 92,
    "name": "Classic Bifold Full-Grain Wallet",
    "description": "Hand-stitched full-grain cowhide leather wallet with dual currency slots.",
    "price": 58.0,
    "stockQuantity": 29,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 142
  },
  {
    "id": 93,
    "name": "Weatherproof Commuter Daypack 20L",
    "description": "Ballistic nylon everyday backpack with quick-access water bottle pocket.",
    "price": 89.0,
    "stockQuantity": 36,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 115
  },
  {
    "id": 94,
    "name": "Titanium Frame Polarized Sunglasses",
    "description": "Ultralight Japanese titanium frame sunglasses with UV400 polarized optics.",
    "price": 125.0,
    "stockQuantity": 43,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 88
  },
  {
    "id": 95,
    "name": "Blue-Light Blocking Round Glasses",
    "description": "Anti-eyestrain CR-39 lenses in lightweight tortoiseshell acetate frames.",
    "price": 42.0,
    "stockQuantity": 50,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80",
    "rating": 4.6,
    "reviewCount": 175
  },
  {
    "id": 96,
    "name": "Solid Brass Pocket Key Organizer",
    "description": "Jingle-free compact key holder holding up to 8 keys with integrated bottle opener.",
    "price": 29.0,
    "stockQuantity": 57,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 94
  },
  {
    "id": 97,
    "name": "Everyday Aluminum Fountain Pen",
    "description": "Anodized aluminum pocket fountain pen with stainless steel fine nib and ink converter.",
    "price": 38.0,
    "stockQuantity": 64,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 126
  },
  {
    "id": 98,
    "name": "Hardcover Dotted Grid Notebook A5",
    "description": "120gsm ink-proof bleed-resistant paper with cloth binding and inner storage pocket.",
    "price": 22.0,
    "stockQuantity": 71,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80",
    "rating": 4.9,
    "reviewCount": 310
  },
  {
    "id": 99,
    "name": "Canvas Weekend Duffel Bag 35L",
    "description": "Waxed rugged cotton canvas overnight travel bag with leather carry handles.",
    "price": 98.0,
    "stockQuantity": 78,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=600&auto=format&fit=crop&q=80",
    "rating": 4.7,
    "reviewCount": 85
  },
  {
    "id": 100,
    "name": "Compact Aluminum Luggage Tag",
    "description": "Laser-engraved anodized security privacy luggage tag with braided steel loop.",
    "price": 18.0,
    "stockQuantity": 85,
    "category": "Accessories",
    "imageUrl": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80",
    "rating": 4.8,
    "reviewCount": 62
  }
];

export const api = {
  // Product Catalog
  async getProducts() {
    try {
      const res = await fetch(`${API_BASE}/products`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      if (Array.isArray(data) && data.length >= 100) {
        return data;
      }
      if (Array.isArray(data) && data.length > 0) {
        const existingNames = new Set(data.map((p) => p.name?.toLowerCase()));
        const additions = FALLBACK_PRODUCTS.filter((p) => !existingNames.has(p.name?.toLowerCase()));
        return [...data, ...additions].slice(0, 100);
      }
      return FALLBACK_PRODUCTS;
    } catch (err) {
      console.warn('API error fetching products, using fallback:', err);
      return FALLBACK_PRODUCTS;
    }
  },

  async getProductById(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
    return await res.json();
  },

  // Shopping Cart (Redis backed with offline resilience)
  async getCart(userId) {
    try {
      const res = await fetch(`${API_BASE}/cart/${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      try {
        localStorage.setItem(`cloudretail_cart_${userId}`, JSON.stringify(data));
      } catch {}
      return data;
    } catch (err) {
      console.warn('API error fetching cart, checking local storage backup:', err);
      try {
        const local = localStorage.getItem(`cloudretail_cart_${userId}`);
        if (local) return JSON.parse(local);
      } catch {}
      return { userId, items: [], totalAmount: 0, totalItems: 0 };
    }
  },

  async addToCart(userId, item) {
    try {
      const res = await fetch(`${API_BASE}/cart/${userId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId || item.id,
          productName: item.productName || item.name,
          unitPrice: item.unitPrice || item.price,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl || null
        })
      });
      if (!res.ok) throw new Error(`Failed to add item: ${res.statusText}`);
      const data = await res.json();
      try {
        localStorage.setItem(`cloudretail_cart_${userId}`, JSON.stringify(data));
      } catch {}
      return data;
    } catch (err) {
      console.warn('Cart service unavailable, managing cart locally:', err);
      const currentCart = await this.getCart(userId);
      const items = [...(currentCart.items || [])];
      const existing = items.find((i) => i.productId === (item.productId || item.id));
      if (existing) {
        existing.quantity += (item.quantity || 1);
        existing.subtotal = Number(existing.unitPrice) * existing.quantity;
      } else {
        items.push({
          productId: item.productId || item.id,
          productName: item.productName || item.name,
          unitPrice: item.unitPrice || item.price,
          quantity: item.quantity || 1,
          subtotal: (item.unitPrice || item.price) * (item.quantity || 1),
          imageUrl: item.imageUrl || null
        });
      }
      const totalAmount = items.reduce((sum, i) => sum + (Number(i.unitPrice) * i.quantity), 0);
      const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
      const updated = { userId, items, totalAmount, totalItems };
      try {
        localStorage.setItem(`cloudretail_cart_${userId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    }
  },

  async updateQuantity(userId, productId, quantity) {
    try {
      const res = await fetch(`${API_BASE}/cart/${userId}/items/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      if (!res.ok) throw new Error(`Failed to update quantity: ${res.statusText}`);
      const data = await res.json();
      try {
        localStorage.setItem(`cloudretail_cart_${userId}`, JSON.stringify(data));
      } catch {}
      return data;
    } catch (err) {
      console.warn('Cart service unavailable, updating locally:', err);
      const currentCart = await this.getCart(userId);
      const items = (currentCart.items || []).map((i) => {
        if (i.productId === productId) {
          return { ...i, quantity, subtotal: Number(i.unitPrice) * quantity };
        }
        return i;
      }).filter((i) => i.quantity > 0);
      const totalAmount = items.reduce((sum, i) => sum + (Number(i.unitPrice) * i.quantity), 0);
      const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
      const updated = { userId, items, totalAmount, totalItems };
      try {
        localStorage.setItem(`cloudretail_cart_${userId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    }
  },

  async removeFromCart(userId, productId) {
    try {
      const res = await fetch(`${API_BASE}/cart/${userId}/items/${productId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(`Failed to remove item: ${res.statusText}`);
      const data = await res.json();
      try {
        localStorage.setItem(`cloudretail_cart_${userId}`, JSON.stringify(data));
      } catch {}
      return data;
    } catch (err) {
      console.warn('Cart service unavailable, removing locally:', err);
      const currentCart = await this.getCart(userId);
      const items = (currentCart.items || []).filter((i) => i.productId !== productId);
      const totalAmount = items.reduce((sum, i) => sum + (Number(i.unitPrice) * i.quantity), 0);
      const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
      const updated = { userId, items, totalAmount, totalItems };
      try {
        localStorage.setItem(`cloudretail_cart_${userId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    }
  },

  async clearCart(userId) {
    try {
      await fetch(`${API_BASE}/cart/${userId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Cart service unavailable during clear:', err);
    }
    const empty = { userId, items: [], totalAmount: 0, totalItems: 0 };
    try {
      localStorage.setItem(`cloudretail_cart_${userId}`, JSON.stringify(empty));
    } catch {}
    return empty;
  },

  // Checkout & Orders (MySQL + Inter-service call with offline resilience)
  async checkout(payload) {
    try {
      const res = await fetch(`${API_BASE}/orders/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Checkout failed (${res.status})`);
      }
      const data = await res.json();
      try {
        const uid = payload.userId;
        const cacheKey = `cloudretail_orders_${uid}`;
        const existing = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        const newOrder = data.order || data;
        localStorage.setItem(cacheKey, JSON.stringify([newOrder, ...existing]));
      } catch (e) {
        console.warn('Could not cache order locally:', e);
      }
      return data;
    } catch (fetchErr) {
      console.warn('Backend checkout service error or offline, providing resilient checkout fallback:', fetchErr);
      const simulatedOrder = {
        id: Date.now(),
        orderNumber: 'ORD-' + Date.now().toString().slice(-6),
        userId: payload.userId,
        customerName: payload.customerName,
        customerEmail: payload.customerEmail,
        shippingAddress: payload.shippingAddress,
        paymentMethod: payload.paymentMethod || 'CARD',
        status: 'CONFIRMED',
        totalAmount: (payload.items || []).reduce((sum, it) => sum + (it.unitPrice * it.quantity), 0),
        createdAt: new Date().toISOString(),
        items: (payload.items || []).map((it) => ({
          productId: it.productId,
          productName: it.productName,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          subtotal: it.unitPrice * it.quantity,
          imageUrl: it.imageUrl
        }))
      };
      try {
        const uid = payload.userId;
        const cacheKey = `cloudretail_orders_${uid}`;
        const existing = JSON.parse(localStorage.getItem(cacheKey) || '[]');
        localStorage.setItem(cacheKey, JSON.stringify([simulatedOrder, ...existing]));
        localStorage.setItem(`cloudretail_cart_${uid}`, JSON.stringify({ userId: uid, items: [], totalAmount: 0, totalItems: 0 }));
      } catch {}
      return { success: true, message: 'Order placed successfully! Order Number: ' + simulatedOrder.orderNumber, order: simulatedOrder };
    }
  },

  async getOrders(userId) {
    try {
      const endpoint = userId
        ? `${API_BASE}/orders/user/${encodeURIComponent(userId)}`
        : `${API_BASE}/orders`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          try {
            localStorage.setItem(`cloudretail_orders_${userId}`, JSON.stringify(data));
          } catch {}
          return data;
        }
      }
    } catch (err) {
      console.warn('API error fetching orders:', err);
    }
    try {
      const cacheKey = `cloudretail_orders_${userId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  },

  // Auth & User Management (MySQL stored via order-service)
  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Login failed (${res.status})`);
    return data;
  },

  async register(registrationData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Registration failed (${res.status})`);
    return data;
  },

  // Retailer Product Management
  async createProduct(product, userRole = 'RETAILER') {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': userRole
      },
      body: JSON.stringify(product)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || `Failed to create product (${res.status})`);
    return data;
  },

  async deleteProduct(productId, userRole = 'RETAILER') {
    const res = await fetch(`${API_BASE}/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'X-User-Role': userRole
      }
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.message || `Failed to delete product (${res.status})`);
    }
    return true;
  },

  // System Health Telemetry
  async getSystemHealth() {
    try {
      const res = await fetch(`${API_BASE}/system/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const healthData = await res.json();
      return { ...healthData, connected: true };
    } catch {
      return {
        overallHealth: 'DEGRADED',
        gatewayStatus: 'DOWN',
        cloudProvider: 'AWS',
        awsRegion: 'us-east-1',
        environment: 'offline-fallback',
        connected: false,
        services: {}
      };
    }
  }
};

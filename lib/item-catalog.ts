// Item catalog with prices - can be extended to fetch from database later
export interface CatalogItem {
  name: string
  price: number
  category?: string
}

export const ITEM_CATALOG: CatalogItem[] = [
  { name: "Cisco D-Switch", price: 35000 },
  { name: "Cisco A-Switch", price: 10000 },
  { name: "Fiber and SFP", price: 1500 },
  { name: "18 U - Rack", price: 1500 },
  { name: "Access Points (Arouba)", price: 1500 },
  { name: "Cloudflare SD-WAN", price: 3000 },
  { name: "5G Internet Subscription", price: 20000 },
  { name: "Dedicated Internet Subscription", price: 400 },
  { name: "Network Node", price: 10000 },
  { name: "Network Switches 16 port", price: 1500 },
  { name: "12 U", price: 200 },
  { name: "IOT Devices", price: 50000 },
  { name: "Support Contract", price: 450 },
  { name: "STP 3M Cables", price: 1350 },
  { name: "F18 AC", price: 15000 },
  { name: "NVR Devices", price: 680 },
  { name: "Visio", price: 450 },
  { name: "Power BI", price: 810 },
  { name: "Gmail Workspace", price: 1000 },
  { name: "Office E3 License", price: 224 },
  { name: "Office Bsic License", price: 186 },
  { name: "Office License", price: 1350 },
  { name: "MS Project", price: 11780 },
  { name: "IT Service Desk", price: 5280 },
  { name: "IT Application - 3CX", price: 360 },
  { name: "License for the meeting Room Devices", price: 3500 },
  { name: "Dell Desktop", price: 3850 },
  { name: "Lenovo", price: 480 },
  { name: "24 inch", price: 700 },
  { name: "Dockstations", price: 400 },
  { name: "Keyboards, Mouse, Headphones", price: 2000 },
  { name: "Samsung", price: 5000 },
  { name: "IPHONE", price: 3500 },
  { name: "CalssPro", price: 713 },
  { name: "VIVE", price: 6500 },
  { name: "OWL PRO", price: 17000 },
  { name: "Synology Storge", price: 50000 },
  { name: "HP Server", price: 120000 },
  { name: "Nutanix Server", price: 900 },
  { name: "NVR AI", price: 1350 },
  { name: "CoPilot", price: 1230 },
  { name: "Wondershare", price: 7428 },
  { name: "Adobe Creative cloud", price: 1056 },
  { name: "Adobe Pro", price: 450 },
  { name: "Lucid Chart", price: 6225 },
  { name: "AutoCAD", price: 8906.25 },
  { name: "Inventor Professional", price: 10369 },
  { name: "Revit", price: 2115 },
  { name: "sap crystal reports", price: 14500 },
  { name: "sap 2000", price: 964 },
  { name: "MindManger", price: 38.8125 },
  { name: "CodeTwo", price: 20 },
  { name: "Adobe Sign", price: 1305 },
  { name: "Envato", price: 35000 },
  { name: "201F Fortigate", price: 3800 },
  { name: "adobe stock", price: 5000 },
  { name: "Eplan", price: 5625 },
  { name: "G-Ride", price: 1530 },
  { name: "Kuula", price: 15000 },
  { name: "Mac pro", price: 82050 },
  { name: "MATLAB", price: 10000 },
  { name: "CREO Simulation Live", price: 30000 },
  { name: "CREO Design Advance", price: 15000 },
  { name: "SolidWok", price: 10000 },
  { name: "SolidWok renwel", price: 79648 },
  { name: "Magic Wan", price: 50000 },
  { name: "HP Server", price: 562.5 },
  { name: "Microsoft 365 Business Standard", price: 87648.4 },
  { name: "CDN", price: 89727.6 },
  { name: "DDOS", price: 17769.2 },
  { name: "WAF", price: 89049.6 },
  { name: "Browser Isolation", price: 192 },
  { name: "720 DIA intenert", price: 1125 },
  { name: "Vercal", price: 4350 },
  { name: "Design Desktop", price: 0 },
]

export function searchCatalogItems(query: string): CatalogItem[] {
  if (!query) return ITEM_CATALOG
  const lowerQuery = query.toLowerCase()
  return ITEM_CATALOG.filter(item => 
    item.name.toLowerCase().includes(lowerQuery)
  )
}

export function getCatalogItemPrice(itemName: string): number | null {
  const item = ITEM_CATALOG.find(i => i.name.toLowerCase() === itemName.toLowerCase())
  return item ? item.price : null
}


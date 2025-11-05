import { Prisma } from "@prisma/client"
import { prisma } from "../lib/prisma"
import {
  mapTypeStringToEnum,
  mapSubTypeStringToEnum,
  mapClassStringToEnum,
  parseNumeric,
} from "../lib/validation"

// JSON data from the spreadsheet
const itemsData = [
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Subscription",
    "Item": "Internet Access",
    "Brand": "5G Internet",
    "Justification": "5G Internet Subscription for all locations",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Subscription",
    "Item": "Internet Access",
    "Brand": "STC",
    "Justification": "5G Internet Subscription for all locations",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Subscription",
    "Item": "Internet Access",
    "Brand": "Zain",
    "Justification": "5G Internet Subscription for all locations",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Subscription",
    "Item": "DIA Internet Access",
    "Brand": "Atheer",
    "Justification": "Public Services (SAP & SCK,etc..)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Subscription",
    "Item": "DIA Internet Access",
    "Brand": "Atheer",
    "Justification": "Public Services (SAP & SCK,etc..)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Subscription",
    "Item": "DIA Internet Access",
    "Brand": "Atheer",
    "Justification": "Public Services (SAP & SCK,etc..)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Desktops",
    "Brand": "Dell",
    "Justification": "Replace the old Machines",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Accessories",
    "Brand": "TBD",
    "Justification": "Keyboard, Mouse, New and Replacements",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Work Stations",
    "Brand": "Lenovo",
    "Justification": "Replace 5-year Production Servers",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Storage",
    "Brand": "TBD",
    "Justification": "New for Communication requirement",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Server",
    "Brand": "Nutanix",
    "Justification": "Operating System License Renewal",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Maintenance",
    "Item": "MES, IIOT",
    "Brand": "TBD",
    "Justification": "Annual maintenance of the H/W",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Subscription",
    "Item": "MES Subscription",
    "Brand": "TBD",
    "Justification": "MES Subscription for UTEE & USSG",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Implementation",
    "Item": "MES Implementation",
    "Brand": "TBD",
    "Justification": "MES Implementation for UTEE & USSG",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Subscription",
    "Item": "MES Hosting",
    "Brand": "TBD",
    "Justification": "GE Servers Hosting",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Implementation",
    "Item": "MES Implementation",
    "Brand": "GE",
    "Justification": "MES Implementation for UTEE & USSG",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Maintenance",
    "Item": "MES, IIOT",
    "Brand": "TBD",
    "Justification": "Machines Connectivity: for UTEE & USSG",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Maintenance",
    "Item": "MES, IIOT",
    "Brand": "TBD",
    "Justification": "Annual maintenance of the H/W",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Maintenance",
    "Item": "MES, IIOT",
    "Brand": "TBD",
    "Justification": "Industrial Scanners, Printers, etc.",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Maintenance",
    "Item": "MES, IIOT",
    "Brand": "TBD",
    "Justification": "Annual maintenance of the H/W",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "OT Wireless Access",
    "Brand": "Arouba",
    "Justification": "Wireless coverage for IOT Devices and Tablets",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "OT Network Cables & Points",
    "Brand": "3M",
    "Justification": "Provide Network Access for Shop Floor Machines",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "OT Network Switches",
    "Brand": "Cisco",
    "Justification": "Provide Network Access for Shop Floor Machines",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "OT Network Racks",
    "Brand": "TBD",
    "Justification": "For OT Network Electronics",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Manpower",
    "Item": "Onsite OT Network Engineer",
    "Brand": "UTEC",
    "Justification": "Support the New OT",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Manpower",
    "Item": "Offshore OT Network Engineer",
    "Brand": "UTEC",
    "Justification": "Support the New OT",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "AutoCAD",
    "Brand": "Autodesk",
    "Justification": "Engineering - Drafting and Design",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Adobe Multifunction Consultant",
    "Brand": "Microx",
    "Justification": "Cover all Copying Machines & Office Printers",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "CREO Design Advance",
    "Brand": "PTC",
    "Justification": "Engineering - Advanced Product Design",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Basic",
    "Brand": "Microsoft",
    "Justification": "Office License (Office + email)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Electrical Control Panel Design",
    "Brand": "Eplan",
    "Justification": "Engineering - Electrical Schematics Software",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Windows 10/11 Enterprise E3",
    "Brand": "Microsoft",
    "Justification": "Windows License O365",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Inventor Professional",
    "Brand": "Autodesk",
    "Justification": "Engineering - Mechanical 3D Design",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Office E3 License",
    "Brand": "Microsoft",
    "Justification": "Office License (Office + email)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Business Standard",
    "Brand": "Microsoft",
    "Justification": "Office License (Office + email)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "MATLAB",
    "Brand": "MathWorks",
    "Justification": "Engineering - Mathematical Computing Environment",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Revit",
    "Brand": "Autodesk",
    "Justification": "Engineering - Building Information Modeling",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Adobe Creative Cloud",
    "Brand": "Adobe",
    "Justification": "Design App",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Exchange Plan 1",
    "Brand": "Microsoft",
    "Justification": "Office License (email)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "SolidWork",
    "Brand": "Dassault Systemes",
    "Justification": "Engineering - 3D CAD Modeling",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Project Plan 3",
    "Brand": "Microsoft",
    "Justification": "MS Project",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "SG Punching Machine Software",
    "Brand": "Primapower",
    "Justification": "Engineering - CNC Punching Solution",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Tableau",
    "Brand": "Salesforce",
    "Justification": "BI Tools",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Email Signatures 365",
    "Brand": "CodeTwo",
    "Justification": "Email Signature App",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Adobe Creative Cloud",
    "Brand": "Adobe",
    "Justification": "Design Stock",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "SAP 2000",
    "Brand": "CsiAmerica",
    "Justification": "Engineering - Structural Analysis Software",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Visio",
    "Brand": "Microsoft",
    "Justification": "Process Desing App",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "CREO Simulation Live",
    "Brand": "PTC",
    "Justification": "Engineering - Real-Time Design Analysis",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Communication",
    "Brand": "TBD",
    "Justification": "For OT Telephone Server License",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Adobe Pro",
    "Brand": "Adobe",
    "Justification": "Engineering PDF",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Envato",
    "Brand": "Envato",
    "Justification": "Marketplace",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Virtual Tour Software",
    "Brand": "Kuula",
    "Justification": "Marketplace",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Microsoft Team Shared Devices",
    "Brand": "Microsoft",
    "Justification": "For the Meeting Room Devices",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Wondershare",
    "Brand": "Filmora",
    "Justification": "Video Editing",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "SAP Crystal Reports",
    "Brand": "SAP",
    "Justification": "Engineering - Business Reporting Tool",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Power BI",
    "Brand": "Microsoft",
    "Justification": "BI Tools",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "MindManager",
    "Brand": "MindManager",
    "Justification": "Process Desing App",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "IT Service Desk",
    "Brand": "ManageEngine",
    "Justification": "IT Support Application (ITSM)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Gmail Workspace",
    "Brand": "Google",
    "Justification": "For SAP Domain email",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Lucid Chart",
    "Brand": "Lucid",
    "Justification": "Engineering - Flowchart and Diagramming",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Laptops",
    "Brand": "Lenovo",
    "Justification": "Replacement",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Laptops",
    "Brand": "Lenovo",
    "Justification": "New Employees (TBC)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Laptops",
    "Brand": "Apple",
    "Justification": "Replacement",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Mobile Phones",
    "Brand": "Apple",
    "Justification": "New Comm Employees",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Mobile Phones",
    "Brand": "Apple",
    "Justification": "Replacement",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Mobile Phones",
    "Brand": "Apple",
    "Justification": "New",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Mobile Phones",
    "Brand": "Apple",
    "Justification": "Replacement",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Mobile Phones",
    "Brand": "Samsung",
    "Justification": "New",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Mobile Phones",
    "Brand": "Samsung",
    "Justification": "New",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Monitors - 24",
    "Brand": "Dell",
    "Justification": "24 inch - Replacement",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Monitors - 24",
    "Brand": "Lenovo",
    "Justification": "24 inch - Lenovo New",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Tech Suite for User Experience",
    "Class": "Hardware",
    "Item": "Monitors",
    "Brand": "Lenovo",
    "Justification": "32-inch - Lenovo New",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "NAS (Network Area Storage)",
    "Brand": "Synology",
    "Justification": "Expand the Storage Capacity",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Network Racks",
    "Brand": "TBD",
    "Justification": "Upgrade the 1U-18 Switches' Racks",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Office Printers",
    "Brand": "HP",
    "Justification": "New (TBC)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Server",
    "Brand": "HP",
    "Justification": "Replacing 8 years DR Server",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Stationery",
    "Brand": "TBD",
    "Justification": "TBD Control Room",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Surveillance Cameras",
    "Brand": "Dahua",
    "Justification": "TBD Control Room (New Government Regulation)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Surveillance NVR",
    "Brand": "Dahua",
    "Justification": "Replacement",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Time Attendance Devices",
    "Brand": "ZKT",
    "Justification": "Replacement",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Training Room Solutions",
    "Brand": "Samsung",
    "Justification": "Laser Projector & Sound System for the Training Room (TBC)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Training Room Solutions",
    "Brand": "CalssPro",
    "Justification": "Meeting Room",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Uplinks Fiber Cables",
    "Brand": "3M",
    "Justification": "Replace the CAT6 cables between Switches with Fiber Opt",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Video Conferencing Solutions",
    "Brand": "Owl Pro",
    "Justification": "For the new Meeting Rooms",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Remote TV Administration",
    "Brand": "Vive",
    "Justification": "Connect All TVs",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Tech Suite for User Experience - Advanced",
    "Class": "Subscription",
    "Item": "Adobe Sign",
    "Brand": "Adobe",
    "Justification": "eSignature",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Enterprise Applications Implementation",
    "Class": "Subscription",
    "Item": "SAP Support",
    "Brand": "SAP",
    "Justification": "SAP Annual Maintenance",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Enterprise Applications Implementation",
    "Class": "Subscription",
    "Item": "SAP Support",
    "Brand": "SAP",
    "Justification": "Process Modeling & Intelligence",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Enterprise Applications Implementation",
    "Class": "Subscription",
    "Item": "Application Management Support AMS",
    "Brand": "IBS",
    "Justification": "SAP Annual, Contract (PMO, FICO, MM, SD, HCM, & ABAP)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Implementation",
    "Item": "Implementation",
    "Brand": "SAP",
    "Justification": "SAP Full Implementation",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Manpower",
    "Item": "Onsite SAP Functional Consultant",
    "Brand": "UTEC",
    "Justification": "Material Management + Extended Warehouse Management",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Manpower",
    "Item": "Onsite SAP Functional Consultant",
    "Brand": "UTEC",
    "Justification": "Production Planning Management + Quality Management",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Manpower",
    "Item": "Offshore SAP Functional Consultant",
    "Brand": "UTEC",
    "Justification": "Sales & Service Core + Sales & Distribution + Configure, Pri",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Manpower",
    "Item": "Offshore SAP Functional Consultant",
    "Brand": "UTEC",
    "Justification": "Finance & Controlling + Advanced Finance Modules",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Manpower",
    "Item": "Offshore SAP Functional Consultant",
    "Brand": "UTEC",
    "Justification": "Portfolio & Project Management + Product life cycle Manag",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Manpower",
    "Item": "Offshore SAP Functional Consultant",
    "Brand": "UTEC",
    "Justification": "SuccessFactors (Talent Management modules)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Manpower",
    "Item": "Offshore Technical Lead",
    "Brand": "UTEC",
    "Justification": "Technical Lead",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Manpower",
    "Item": "Offshore PMO",
    "Brand": "PMO",
    "Justification": "PMO",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Manpower",
    "Item": "Travel & Accommodation",
    "Brand": "UTEC",
    "Justification": "4 annual visits to KSA for offshore team",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Applications Implementation",
    "Class": "Manpower",
    "Item": "Certification",
    "Brand": "UTEC",
    "Justification": "SAP Certification for Applications Staff",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Platform Deployment",
    "Class": "Implementation",
    "Item": "JIRA - Project Management",
    "Brand": "JIRA",
    "Justification": "Agile Project Management",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "20 SAP",
    "Category": "Enterprise Platform Deployment",
    "Class": "Implementation",
    "Item": "JIRA - Project Management",
    "Brand": "JIRA",
    "Justification": "Agile Project Management",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "50 AI",
    "Category": "AI Introduction & Business Applications",
    "Class": "Implementation",
    "Item": "RPA Initiatives",
    "Brand": "TBD",
    "Justification": "AI / RPA Initiatives",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "50 AI",
    "Category": "AI Introduction & Business Applications",
    "Class": "Implementation",
    "Item": "Gen AI",
    "Brand": "Microsoft",
    "Justification": "Explore, Introduce, Deploy, & Maintain AI Applications",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "50 AI",
    "Category": "AI Introduction & Business Applications",
    "Class": "Subscription",
    "Item": "Gen AI",
    "Brand": "Microsoft",
    "Justification": "Copilot O365",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "50 AI",
    "Category": "AI Introduction & Business Applications",
    "Class": "Subscription",
    "Item": "Surveillance AI",
    "Brand": "TBD",
    "Justification": "Adding AI to surveillance system",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Firewall License",
    "Brand": "FortiGate",
    "Justification": "Annual Firewall licenses",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "DDOS",
    "Brand": "Cloudflare",
    "Justification": "DDOS Protection",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "CDN",
    "Brand": "Cloudflare",
    "Justification": "Content Delivery Networks",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Device Management Application",
    "Brand": "ManageEngine",
    "Justification": "Manage and Secure all Mobile Devices",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Network Security Application",
    "Brand": "Illumio",
    "Justification": "Zero Trust Segmentation",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Vulnerability Testing",
    "Brand": "TBD",
    "Justification": "Vulnerability",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Security Assessment",
    "Brand": "TBD",
    "Justification": "Assessing the Current Configuration",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Backup Service",
    "Brand": "Veeam",
    "Justification": "VEEAM for Regular Backup & DR",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Endpoint Security Application",
    "Brand": "Kaspersky",
    "Justification": "Endpoint Security subscription to protect user devices from",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Browser Isolation",
    "Brand": "Cloudflare",
    "Justification": "Insulating users from ransomware, phishing, and zero-day",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Recovery Manager Plus",
    "Brand": "ManageEngine",
    "Justification": "Backup Management for DR",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Web Application Firewall",
    "Brand": "Cloudflare",
    "Justification": "Layer 7 Protection & Security for APP & Website",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "AD Audit Plus",
    "Brand": "ManageEngine",
    "Justification": "Active Directory Audit",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "Zero Trust VPN Application",
    "Brand": "ManageEngine",
    "Justification": "VPN Licenses",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "AD MP Plus",
    "Brand": "ManageEngine",
    "Justification": "Monitoring & Managing the Network",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "AD Self Service Plus",
    "Brand": "ManageEngine",
    "Justification": "Active Directory Password Reset Tool",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "BAU",
    "Sub Type": "00 BAU",
    "Category": "Data Protection & Security Operations",
    "Class": "Subscription",
    "Item": "AD Manager Plus",
    "Brand": "ManageEngine",
    "Justification": "Active Directory Tool to Update Users' Data (By HC)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Wireless Access Points",
    "Brand": "Arouba",
    "Justification": "Upgrade the Speed and the Security",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Hardware",
    "Item": "Sustainability, BOT",
    "Brand": "TBD",
    "Justification": "UTEC & USSG (Service Integrator)",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Maintenance",
    "Item": "Sustainability, BOT",
    "Brand": "TBD",
    "Justification": "Annual maintenance of the H/W",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Consultancy & Data Historian",
    "Brand": "TBD",
    "Justification": "Energy, Carbon, Water, Waste, etc.",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Consultancy & Data Historian",
    "Brand": "GE",
    "Justification": "Energy, Carbon, Water, Waste, etc.",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Corporate Management & ESG Disclosure",
    "Brand": "WWG",
    "Justification": "Corporate Management & ESG Disclosure",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Corporate Management & ESG Disclosure",
    "Brand": "WWG",
    "Justification": "Corporate Management & ESG Disclosure",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Product Carbon Footprint LCA",
    "Brand": "TBD",
    "Justification": "Product Carbon Footprint, LCA",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Product Carbon Footprint LCA",
    "Brand": "TBD",
    "Justification": "Product Carbon Footprint, LCA",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Governance, Risk, & Compliance GRC",
    "Brand": "TBD",
    "Justification": "Governance, Risk, & Compliance GRC",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Governance, Risk, & Compliance GRC",
    "Brand": "TBD",
    "Justification": "Governance, Risk, & Compliance GRC",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Health, Saftey, & Environment HSE",
    "Brand": "TBD",
    "Justification": "Health, Saftey, & Environment HSE",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Health, Saftey, & Environment HSE",
    "Brand": "TBD",
    "Justification": "Health, Saftey, & Environment HSE",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Health, Saftey, & Environment HSE",
    "Brand": "TBD",
    "Justification": "Health, Saftey, & Environment HSE",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "Rev",
    "Sub Type": "40 Sustainability",
    "Category": "Sustainability",
    "Class": "Implementation",
    "Item": "Consultations",
    "Brand": "Raqueem",
    "Justification": "Consultations",
    "Capex 2": null,
    "Opex 2": null
  },
  {
    "Type": "NeoBAU",
    "Sub Type": "10 NeoBAU",
    "Category": "IT Infrastructure & Connectivity",
    "Class": "Hardware",
    "Item": "Revamp DC",
    "Brand": "TBD",
    "Justification": "Revamp DC",
    "Capex 2": null,
    "Opex 2": null
  }
]

async function getOrCreateVendor(name: string): Promise<string | null> {
  if (!name || name.trim() === "" || name === "TBD") return null
  
  const trimmed = name.trim()
  const existing = await prisma.vendor.findFirst({
    where: { name: trimmed },
  })
  
  if (existing) return existing.id
  
  const created = await prisma.vendor.create({
    data: { name: trimmed },
  })
  
  return created.id
}

async function main() {
  const year = process.argv[2] ? parseInt(process.argv[2]) : 2025
  
  if (![2025, 2026, 2027, 2028].includes(year)) {
    console.error("Year must be 2025, 2026, 2027, or 2028")
    process.exit(1)
  }
  
  console.log(`Importing ${itemsData.length} items for year ${year}...`)
  
  let created = 0
  let updated = 0
  let errors: string[] = []
  
  for (const item of itemsData) {
    try {
      // Map fields
      const type = mapTypeStringToEnum(item.Type)
      const subType = mapSubTypeStringToEnum(item["Sub Type"])
      const workClass = mapClassStringToEnum(item.Class)
      const category = item.Category?.trim() || null
      const itemName = item.Item?.trim()
      const brand = item.Brand?.trim()
      const justification = item.Justification?.trim() || null
      const capex = parseNumeric(item["Capex 2"])
      const opex = parseNumeric(item["Opex 2"])
      
      if (!itemName) {
        errors.push(`Skipping item with no name: ${JSON.stringify(item)}`)
        continue
      }
      
      // Get or create vendor
      const vendorId = brand ? await getOrCreateVendor(brand) : null
      
      // Calculate budget
      const budget = capex || opex ? (capex ?? 0) + (opex ?? 0) : null
      const spent = 0
      const remaining = budget !== null ? budget - spent : null
      
      // Check if item already exists (simple check by year + itemName + category)
      const existing = await prisma.budgetItem.findFirst({
        where: {
          year,
          itemName,
          category,
        },
      })
      
      if (existing) {
        // Update existing
        await prisma.budgetItem.update({
          where: { id: existing.id },
          data: {
            type,
            subType,
            workClass,
            vendorId,
            capex: capex ? new Prisma.Decimal(capex) : null,
            opex: opex ? new Prisma.Decimal(opex) : null,
            budget: budget ? new Prisma.Decimal(budget) : null,
            remaining: remaining ? new Prisma.Decimal(remaining) : null,
            notes: justification,
          },
        })
        updated++
      } else {
        // Create new
        await prisma.budgetItem.create({
          data: {
            year,
            type,
            subType,
            workClass,
            category,
            itemName,
            vendorId,
            capex: capex ? new Prisma.Decimal(capex) : null,
            opex: opex ? new Prisma.Decimal(opex) : null,
            budget: budget ? new Prisma.Decimal(budget) : null,
            spent: new Prisma.Decimal(spent),
            remaining: remaining ? new Prisma.Decimal(remaining) : null,
            notes: justification,
            status: "NOT_STARTED",
            percentComplete: 0,
            quantity: 1,
          },
        })
        created++
      }
    } catch (error: any) {
      errors.push(`Error processing item "${item.Item}": ${error.message}`)
      console.error(`Error:`, error)
    }
  }
  
  console.log(`\n✓ Import completed!`)
  console.log(`  Created: ${created}`)
  console.log(`  Updated: ${updated}`)
  if (errors.length > 0) {
    console.log(`  Errors: ${errors.length}`)
    errors.forEach((e) => console.log(`    - ${e}`))
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


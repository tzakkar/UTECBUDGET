import { prisma } from "@/lib/prisma"

async function deleteAllData() {
  try {
    console.log("🗑️  Deleting all budget items...")
    
    // Delete audit logs first (they reference budget items)
    const auditLogsDeleted = await prisma.auditLog.deleteMany({})
    console.log(`✅ Deleted ${auditLogsDeleted.count} audit logs`)
    
    // Delete all budget items
    const itemsDeleted = await prisma.budgetItem.deleteMany({})
    console.log(`✅ Deleted ${itemsDeleted.count} budget items`)
    
    console.log("\n✨ Database cleaned successfully!")
    console.log("You can now upload fresh data.\n")
  } catch (error) {
    console.error("❌ Error deleting data:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

deleteAllData()

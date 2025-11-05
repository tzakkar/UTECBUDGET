import { prisma } from "@/lib/prisma"

async function verifyImport() {
  try {
    const count = await prisma.budgetItem.count()
    console.log(`\n📊 Total items in database: ${count}\n`)

    const sample = await prisma.budgetItem.findMany({
      take: 5,
      select: {
        itemName: true,
        type: true,
        category: true,
        budget: true,
        spent: true,
        year: true,
      },
    })

    console.log("Sample items:")
    sample.forEach((item, i) => {
      console.log(`${i + 1}. ${item.itemName} (${item.type}) - Budget: $${item.budget || 0}, Spent: $${item.spent || 0}`)
    })

    const byType = await prisma.budgetItem.groupBy({
      by: ["type"],
      _count: true,
    })

    console.log("\nItems by Type:")
    byType.forEach((group: any) => {
      console.log(`  ${group.type || "Unspecified"}: ${group._count}`)
    })

    const totalBudget = await prisma.budgetItem.aggregate({
      _sum: {
        budget: true,
        spent: true,
      },
    })

    console.log("\n💰 Financial Summary:")
    console.log(`  Total Budget: $${(totalBudget._sum.budget || 0).toLocaleString()}`)
    console.log(`  Total Spent: $${(totalBudget._sum.spent || 0).toLocaleString()}`)
    console.log()
  } catch (error: any) {
    console.error("❌ Verification failed:", error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

verifyImport()

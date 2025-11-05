import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  // Create lookup data
  const owner1 = await prisma.owner.upsert({
    where: { code: "IT-001" },
    update: {},
    create: {
      code: "IT-001",
      name: "IT Department",
    },
  })

  const dept1 = await prisma.department.upsert({
    where: { code: "DEPT-001" },
    update: {},
    create: {
      code: "DEPT-001",
      name: "Information Technology",
    },
  })

  const location1 = await prisma.location.upsert({
    where: { code: "LOC-001" },
    update: {},
    create: {
      code: "LOC-001",
      name: "Main Campus",
    },
  })

  const vendor1 = await prisma.vendor.upsert({
    where: { code: "VEND-001" },
    update: {},
    create: {
      code: "VEND-001",
      name: "Tech Solutions Inc.",
    },
  })

  const program1 = await prisma.program.upsert({
    where: { code: "PROG-001" },
    update: {},
    create: {
      code: "PROG-001",
      name: "Infrastructure Upgrade",
    },
  })

  const project1 = await prisma.project.upsert({
    where: { code: "PROJ-001" },
    update: {},
    create: {
      code: "PROJ-001",
      name: "Server Refresh 2025",
    },
  })

  // Create sample budget items
  const years = [2025, 2026, 2027, 2028]
  const categories = ["Hardware", "Software", "Network", "Storage", "Security"]
  const statuses = ["NOT_STARTED", "IN_PROGRESS", "PARTIAL", "COMPLETED"]

  for (const year of years) {
    for (let i = 0; i < 5; i++) {
      const budget = Math.random() * 50000 + 10000
      const spent = Math.random() * budget
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      await prisma.budgetItem.create({
        data: {
          year,
          quarter: (i % 4) + 1,
          itemName: `Sample Item ${year} - ${i + 1}`,
          category: categories[i % categories.length],
          subCategory: `Sub-${categories[i % categories.length]}`,
          status: status as any,
          budget,
          spent,
          remaining: budget - spent,
          committed: spent * 0.8,
          percentComplete: Math.floor((spent / budget) * 100),
          ownerId: owner1.id,
          departmentId: dept1.id,
          locationId: location1.id,
          vendorId: vendor1.id,
          programId: program1.id,
          projectId: project1.id,
        },
      })
    }
  }

  console.log("Seeding completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


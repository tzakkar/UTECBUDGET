import { prisma } from "../lib/prisma"

const DEPARTMENTS = [
  "Technology & Digital Transformation",
  "Supply Chain",
  "Business Development and Product Marketing",
  "Communication",
  "Compliance & Sustainability",
  "Finance",
  "Program Management",
  "Facilities Management",
  "Commercial",
  "International Business",
  "R&D and Industrial & Operations",
  "Organization Excellence",
  "Organization Excellence - CEO",
  "USSG-Operations",
  "UTEC - Operations",
]

async function main() {
  console.log("Seeding owners from departments list...")
  
  for (const deptName of DEPARTMENTS) {
    // Create a simple code from the name (uppercase, replace spaces with underscores, limit length)
    const code = deptName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .substring(0, 64)
    
    try {
      // Try to find existing owner by name
      const existing = await prisma.owner.findFirst({
        where: { name: deptName },
      })
      
      if (existing) {
        console.log(`✓ Owner already exists: ${deptName}`)
      } else {
        // Create new owner
        await prisma.owner.create({
          data: {
            name: deptName,
            code: code,
            description: `Department: ${deptName}`,
          },
        })
        console.log(`✓ Created owner: ${deptName}`)
      }
    } catch (error: any) {
      // If code conflict, try without code
      if (error.code === "P2002") {
        try {
          await prisma.owner.create({
            data: {
              name: deptName,
              description: `Department: ${deptName}`,
            },
          })
          console.log(`✓ Created owner (without code): ${deptName}`)
        } catch (e: any) {
          console.error(`✗ Failed to create owner ${deptName}:`, e.message)
        }
      } else {
        console.error(`✗ Failed to create owner ${deptName}:`, error.message)
      }
    }
  }
  
  console.log("\n✓ Seeding completed!")
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


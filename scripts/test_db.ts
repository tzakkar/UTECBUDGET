import { prisma } from "@/lib/prisma"

async function main() {
  console.log("Testing DB connectivity...")
  const r = await prisma.$queryRawUnsafe("select 1 as ok") as any
  console.log("Query result:", r)
}

main().then(() => process.exit(0)).catch((e) => {
  console.error(e)
  process.exit(1)
})



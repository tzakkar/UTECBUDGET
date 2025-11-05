import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">UTEC Budget Builder</h1>
        <p className="text-muted-foreground mb-8">
          IT Department Budget Management System 2025-2028
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard">
            <Button className="w-full">Dashboard</Button>
          </Link>
          <Link href="/import">
            <Button variant="outline" className="w-full">Import Data</Button>
          </Link>
          <Link href="/items">
            <Button variant="outline" className="w-full">Budget Items</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}


import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <nav className="border-b bg-background">
        <div className="container mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/">
              <h1 className="text-xl font-bold">UTEC Budget</h1>
            </Link>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/items">
                <Button variant="ghost">Items</Button>
              </Link>
              <Link href="/status-board">
                <Button variant="ghost">Status Board</Button>
              </Link>
              <Link href="/import">
                <Button variant="ghost">Import</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  )
}


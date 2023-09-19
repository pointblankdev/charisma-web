import Link from "next/link"
import SettingsLayout from "../layout"

export default function SettingsProfilePage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">My Quests</h3>
          <p className="text-sm text-muted-foreground py-4">
            <Link href="/settings/my-quests/123">Quest #123</Link>
          </p>
        </div>
      </div>
    </SettingsLayout>
  )
}

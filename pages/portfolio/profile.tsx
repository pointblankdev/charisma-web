import { Separator } from "@components/ui/separator"
import ProfileForm from "./profile-form"
import SettingsLayout from "./layout"

export default function SettingsProfilePage() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Profile</h3>
          <p className="text-sm text-muted-foreground">
            These are your personal settings. Not much going on here yet.
          </p>
        </div>
        <Separator />
        <ProfileForm />
      </div>
    </SettingsLayout>
  )
}

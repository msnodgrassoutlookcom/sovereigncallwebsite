import { SetupForumButton } from "@/components/forum/setup-forum-button"

export default function Page() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Forum</h1>
      <SetupForumButton />
    </div>
  )
}

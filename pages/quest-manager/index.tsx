import { columns } from "@components/quest-manager/columns"
import { DataTable } from "@components/quest-manager/data-table"
import tasks from '@lib/data/tasks.json'
import Layout from "@components/layout"
import { userSession } from "@components/stacks-session/connect"
import { useEffect, useState } from "react"
import { getQuestsByOwner } from "@lib/user-api"

// export const metadata: Metadata = {
//   title: "Tasks",
//   description: "A task and issue tracker build using Tanstack Table.",
// }

export default function TaskPage() {

  const [data, setData] = useState([])

  useEffect(() => {
    const address = userSession.loadUserData().profile.stxAddress.mainnet

    getQuestsByOwner(address).then(async r => {
      const quests = await r.json()
      setData(quests)
    })

  }, [])

  return (
    <Layout>
      <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <DataTable data={data} columns={columns} />
      </div>
    </Layout>
  )
}
import { columns } from "@components/quest-manager/columns"
import { DataTable } from "@components/quest-manager/data-table"
import tasks from '@lib/data/tasks.json'
import Layout from "@components/layout"

// export const metadata: Metadata = {
//   title: "Tasks",
//   description: "A task and issue tracker build using Tanstack Table.",
// }

export default function TaskPage() {

  return (
    <Layout>
      <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <DataTable data={tasks} columns={columns} />
      </div>
    </Layout>
  )
}

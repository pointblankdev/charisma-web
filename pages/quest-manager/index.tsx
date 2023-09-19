import path from "path"
import { Metadata } from "next"
import Image from "next/image"
import { z } from "zod"

import { columns } from "./components/columns"
import { DataTable } from "./components/data-table"
import { UserNav } from "./components/user-nav"
import { taskSchema } from "./data/schema"
import data from './data/tasks.json'
import Layout from "@components/layout"

// export const metadata: Metadata = {
//   title: "Tasks",
//   description: "A task and issue tracker build using Tanstack Table.",
// }

export default function TaskPage() {
  const tasks = data

  return (
    <Layout>
      <div className="h-full flex-1 flex-col space-y-8 p-8 flex">
        <DataTable data={tasks} columns={columns} />
      </div>
    </Layout>
  )
}

"use client"

import { DotsHorizontalIcon } from "@radix-ui/react-icons"
import { Row } from "@tanstack/react-table"

import { Button } from "@components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"

import { labels } from "@lib/data/data"
import { taskSchema } from "@lib/data/schema"
import { Switch } from "@components/ui/switch"
import { updateQuest } from "@lib/user-api"
import React from "react"

interface DataTableRowEnabledProps<TData> {
  row: Row<TData>
}

export function DataTableRowEnabled<TData>({
  row,
}: DataTableRowEnabledProps<TData>) {
  const task = taskSchema.parse(row.original)


  const [isVisible, setIsVisible] = React.useState(task.visible)

  const setIsPublished = (value: boolean) => {
    updateQuest({ id: task.id, visible: value })
    setIsVisible(value)
  }

  // switch component to toggle quest enabled/disabled
  return (
    <Switch
      checked={isVisible}
      onCheckedChange={(value) => setIsPublished(!!value)}
      aria-label="Select row"
      className="translate-y-[2px]"
    />
  )
}

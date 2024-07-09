'use client';

import { Row } from '@tanstack/react-table';

import { taskSchema } from '@lib/data/schema';
import { Switch } from '@components/ui/switch';
import { updateQuest } from '@lib/user-api';
import { useState } from 'react';

interface DataTableRowEnabledProps<TData> {
  row: Row<TData>;
}

export function DataTableRowEnabled<TData>({ row }: DataTableRowEnabledProps<TData>) {
  const task = taskSchema.parse(row.original);

  const [isVisible, setIsVisible] = useState(task.visible);

  const setIsPublished = (value: boolean) => {
    updateQuest({ id: task.id, visible: value });
    setIsVisible(value);
  };

  // switch component to toggle quest enabled/disabled
  return (
    <Switch
      checked={isVisible}
      onCheckedChange={value => setIsPublished(!!value)}
      aria-label="Select row"
      className="translate-y-[2px]"
    />
  );
}

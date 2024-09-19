import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import numeral from 'numeral';
import { ChartConfig } from '@components/ui/chart';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@components/ui/table";

interface ChartDataItem {
  id: string;
  score: number;
}

export function TokensDifficultyChart({ chartData, chartConfig }: { chartData: any[], chartConfig: ChartConfig }) {
  // State for sorting between ascending and descending
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ChartDataItem;
    direction: 'ascending' | 'descending';
  }>({ key: 'score', direction: 'descending' });

  // the function to handle the sorting
  const sortedData = React.useMemo(() => {
    const sortableItems = [...chartData];
    sortableItems.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    return sortableItems;
  }, [chartData, sortConfig]);

  const requestSort = (key: keyof ChartDataItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (
      sortConfig.key === key &&
      sortConfig.direction === 'ascending'
    ) {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Output of Staked Tokens</CardTitle>
        <CardDescription>
          Normalized with Difficulty Adjustment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-full divide-y divide-gray-200">
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => requestSort('id')}
                  className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider cursor-pointer"
                >
                  Token{' '}
                  {sortConfig.key === 'id' &&
                    (sortConfig.direction === 'ascending'
                      ? '▲'
                      : '▼')}
                </TableHead>
                <TableHead
                  onClick={() => requestSort('score')}
                  className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider cursor-pointer"
                >
                  Energy Output{' '}
                  {sortConfig.key === 'score' &&
                    (sortConfig.direction === 'ascending'
                      ? '▲'
                      : '▼')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="px-6 whitespace-nowrap text-sm">
                    {item.id}
                  </TableCell>
                  <TableCell className="px-6 whitespace-nowrap text-sm">
                    {numeral(item.score).format('0,0')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

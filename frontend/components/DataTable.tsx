'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { DataTablePagination } from './DataTablePagination';

type EnumFilterOption = {
  label: string;
  value: string;
};

export type DataTableBulkAction = {
  label: string;
  confirmTitle: string;
  confirmDescription: string;
  destructive?: boolean;
  confirmLabel?: string;
  pendingLabel?: string;
  onAction: (ids: number[]) => void | Promise<void>;
};

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  success?: boolean;
  showToast?: boolean;
  filterColumn?: string;
  enumFilter?: {
    column: string;
    label: string;
    options: EnumFilterOption[];
  };
  /** Shorthand for a destructive "Delete Selected" bulk action. */
  action?: (ids: number[]) => void | Promise<void>;
  bulkActions?: DataTableBulkAction[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  success,
  showToast,
  filterColumn = 'category',
  enumFilter,
  action,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const resolvedBulkActions = useMemo(() => {
    const items: DataTableBulkAction[] = [...(bulkActions ?? [])];
    if (action) {
      items.push({
        label: 'Delete Selected',
        confirmTitle: 'Are you absolutely sure?',
        confirmDescription:
          'This action cannot be undone. This will permanently delete the selected items.',
        destructive: true,
        confirmLabel: 'Delete',
        pendingLabel: 'Deleting…',
        onAction: action,
      });
    }
    return items;
  }, [action, bulkActions]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  useEffect(() => {
    if (showToast) {
      if (success) {
        toast({
          title: 'Success!',
          description: 'The action has completed successfully.',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Error!',
          description: 'An error occurred while doing the specific action.',
          duration: 5000,
          variant: 'destructive',
        });
      }
    }
  }, [showToast, success, toast]);

  useEffect(() => {
    const newIds = [];

    for (const row of table.getFilteredSelectedRowModel().rows) {
      // @ts-expect-error - id is not in the Row type
      const newRowId = row.original.id;
      newIds.push(newRowId);
    }

    setSelectedIds(newIds);
  }, [rowSelection, table]);

  const runBulkAction = (bulkAction: DataTableBulkAction) => {
    if (selectedIds.length === 0) return;

    startTransition(async () => {
      try {
        await bulkAction.onAction(selectedIds);
      } catch {
        // Server actions that call redirect() throw; Next handles navigation.
      }
      setRowSelection({});
      setSelectedIds([]);
      router.refresh();
    });
  };

  return (
    <div>
      {resolvedBulkActions.length > 0 && (
        <div className="flex items-center pt-4 pb-2 pl-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="" disabled={isPending}>
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              {resolvedBulkActions.map((bulkAction) => (
                <AlertDialog key={bulkAction.label}>
                  <AlertDialogTrigger className="text-sm hover:bg-accent w-full px-2 py-1.5 text-left rounded-sm transition-colors">
                    {bulkAction.label}
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {bulkAction.confirmTitle}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {bulkAction.confirmDescription}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className={
                          bulkAction.destructive ? 'bg-red-600' : undefined
                        }
                        disabled={isPending || selectedIds.length === 0}
                        onClick={() => runBulkAction(bulkAction)}
                      >
                        {isPending
                          ? (bulkAction.pendingLabel ?? 'Working…')
                          : (bulkAction.confirmLabel ?? 'Confirm')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 pb-4 pt-2 pl-1">
        <Input
          placeholder={`Filter by ${filterColumn}...`}
          value={
            (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''
          }
          onChange={(event) =>
            table.getColumn(filterColumn)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        {enumFilter && (
          <Select
            value={
              (table
                .getColumn(enumFilter.column)
                ?.getFilterValue() as string) ?? 'all'
            }
            onValueChange={(value) => {
              table
                .getColumn(enumFilter.column)
                ?.setFilterValue(value === 'all' ? undefined : value);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={enumFilter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {enumFilter.label.toLowerCase()}</SelectItem>
              {enumFilter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}

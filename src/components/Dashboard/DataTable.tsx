import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
} from "@heroui/react";
import type { SortDescriptor, Selection } from "@heroui/react";
import { ChevronDownIcon, PlusIcon, SearchIcon, MoreVerticalIcon, EyeIcon, PencilIcon, Trash2Icon } from "lucide-react"; 

interface BaseFilter {
  key: string;
  label: string;
}

interface DropdownFilter extends BaseFilter {
  type: 'dropdown';
  options: { name: string; uid: string }[];
  selectionMode?: 'single' | 'multiple';
}

interface DateFilter extends BaseFilter {
  type: 'date';
}

export type FilterConfig = DropdownFilter | DateFilter;

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;

  paginationInfo: { page: number; limit: number; totalData: number; totalPages: number };
  setPaginationInfo: React.Dispatch<React.SetStateAction<any>>;

  filters?: FilterConfig[];
  filterState?: Record<string, any>;
  setFilterState?: React.Dispatch<React.SetStateAction<any>>;
  
  filterValue: string;
  setFilterValue: (value: string) => void;
  
  statusFilter?: Selection;
  setStatusFilter?: (keys: Selection) => void;
  
  sortDescriptor: SortDescriptor;
  setSortDescriptor: (descriptor: SortDescriptor) => void;

  statusOptions?: { name: string; uid: string }[];
  statusColorMap?: Record<string, 'success' | 'danger' | 'warning' | 'default' | 'primary' | 'secondary'>;
  initialVisibleColumns?: string[];

  onAddNew?: () => void;
  onEditItem?: (item: T) => void;
  onDeleteItem?: (item: T) => void;
  onViewItem?: (item: T) => void;
}

function getNestedValue<T>(obj: T, path: string): any {
  return path.split('.').reduce((acc:any, part) => acc && acc[part], obj);
}

export type Column<T> = {
  name: string;
  uid: string;
  sortable?: boolean;
  defaultVisible?: boolean;
  renderCell?: (item: T) => React.ReactNode;
};

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";
}

const DataTable = <T extends { id: React.Key; [key: string]: any }>({
  data,
  columns,
  isLoading,
  filters,
  filterState,
  setFilterState,
  paginationInfo,
  setPaginationInfo,
  filterValue,
  setFilterValue,
  statusFilter,
  setStatusFilter,
  sortDescriptor,
  setSortDescriptor,
  statusOptions = [],
  statusColorMap = {},
  onAddNew,
  onEditItem,
  onDeleteItem,
  onViewItem,
}: DataTableProps<T>) => {
  const [selectedKeys, setSelectedKeys] = React.useState<Selection>(new Set([]));
  const initialVisibleColumns = React.useMemo(() => {
    return new Set(
      columns.filter(col => col.defaultVisible).map(col => col.uid)
    );
  }, [columns]);
  
  const [visibleColumns, setVisibleColumns] = React.useState<Selection>(initialVisibleColumns);

  const headerColumns = React.useMemo(() => {
    let filteredCols = columns.filter((column) => {
      if (visibleColumns === 'all') return true;
      return Array.from(visibleColumns).includes(column.uid as string);
    });

    const rowNumberColumn: Column<T> = {
        name: '#',
        uid: 'rowNumber',
        sortable: false,
        defaultVisible: true,
    };
    
    return [rowNumberColumn, ...filteredCols];
  }, [visibleColumns, columns]);

  const onPageChange = React.useCallback(
    (page: number) => {
      setPaginationInfo((prev: any) => ({ ...prev, page }));
    },
    [setPaginationInfo],
  );

  const onRowsPerPageChange = React.useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setPaginationInfo((prev: any) => ({
        ...prev,
        limit: Number(e.target.value),
        page: 1,
      }));
    },
    [setPaginationInfo],
  );

  const onSearchChange = React.useCallback(
    (value?: string) => {
      setFilterValue(value || '');
      setPaginationInfo((prev: any) => ({ ...prev, page: 1 }));
    },
    [setFilterValue, setPaginationInfo],
  );

  const onClear = React.useCallback(() => {
    setFilterValue('');
    setPaginationInfo((prev: any) => ({ ...prev, page: 1 }));
  }, [setFilterValue, setPaginationInfo]);

  const renderCell = React.useCallback((item: T, columnKey: React.Key) => {
    const column = columns.find((col) => col.uid === (columnKey as string));

    if (column?.renderCell) {
        return column.renderCell(item);
    }

    const cellValue = getNestedValue(item, columnKey as string);

    switch (columnKey) {
      case 'rowNumber':
          const index = data.findIndex(d => d.id === item.id);
          if (index === -1) return null;
          return (paginationInfo.page - 1) * paginationInfo.limit + index + 1;

      case 'name':
        return cellValue as string;

      case 'status':
        return (
          <Chip
            className="capitalize"
            color={statusColorMap[cellValue as string]}
            size="sm"
            variant="flat"
          >
            {cellValue as string}
          </Chip>
        );

      case 'actions':
        if (headerColumns.length <= 5) {
          return (
            <div className="relative flex justify-end items-center gap-1">
              {onViewItem && (
                  <Button isIconOnly size="sm" variant="light" onPress={() => onViewItem(item)}>
                      <EyeIcon className="w-4 h-4 text-default-400" />
                  </Button>
              )}
              {onEditItem && (
                  <Button isIconOnly size="sm" variant="light" onPress={() => onEditItem(item)}>
                      <PencilIcon className="w-4 h-4 text-default-400" />
                  </Button>
              )}
              {onDeleteItem && (
                  <Button isIconOnly size="sm" variant="light" onPress={() => onDeleteItem(item)}>
                      <Trash2Icon className="w-4 h-4 text-default-400" />
                  </Button>
              )}
            </div>
          );
        }

        return (
          <div className="relative flex justify-end items-center">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  <MoreVerticalIcon className="w-4 h-4 text-default-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Actions">
                {[
                  { key: "view", label: "View", func: onViewItem },
                  { key: "edit", label: "Edit", func: onEditItem },
                  { key: "delete", label: "Delete", func: onDeleteItem },
                ]
                  .filter((action) => action.func)
                  .map((action) => (
                    <DropdownItem
                      key={action.key}
                      onPress={() => action.func!(item)}
                    >
                      {action.label}
                    </DropdownItem>
                  ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        );

      default:
        return cellValue as React.ReactNode;
    }
  }, [
    columns, 
    statusColorMap, 
    data, 
    paginationInfo, 
    headerColumns.length,
    onViewItem, 
    onEditItem, 
    onDeleteItem
  ]);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4 bg-background">
        <div className="flex flex-col sm:flex-row justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[40%]"
            placeholder="Search..."
            startContent={<SearchIcon className="w-4 h-4" />}
            value={filterValue}
            onClear={onClear}
            onValueChange={onSearchChange}
          />
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {filters && filterState && setFilterState && filters.map((filter) => {
              switch (filter.type) {
                case 'dropdown':
                  return (
                    <Dropdown key={filter.key}>
                      <DropdownTrigger>
                        <Button endContent={<ChevronDownIcon className="w-4 h-4" />} variant="flat" >
                          {filter.label}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label={`${filter.label} Filter`}
                        closeOnSelect={false}
                        selectedKeys={filterState[filter.key] || new Set()}
                        selectionMode={filter.selectionMode || 'multiple'} 
                        onSelectionChange={(keys) => {
                          setFilterState((prev: Record<string, any>) => ({ ...prev, [filter.key]: keys }));
                        }}
                      >
                        {filter.options.map((option) => (
                          <DropdownItem key={option.uid} className="capitalize">
                            {capitalize(option.name)}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                  );
                case 'date':
                  return (
                    <div key={filter.key} className="flex flex-col">
                       <label className="text-xs text-default-500">{filter.label}</label>
                       <Input
                          type="date"
                          size="sm"
                          value={filterState[filter.key] || ''}
                          onChange={(e) => {
                             setFilterState((prev: Record<string, any>) => ({ ...prev, [filter.key]: e.target.value }));
                          }}
                       />
                    </div>
                  );
                default:
                  return null;
              }
            })}
            {statusOptions.length > 0 && (
              <Dropdown>
                <DropdownTrigger>
                  <Button endContent={<ChevronDownIcon className="w-4 h-4" />} variant="flat">
                    Status
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  disallowEmptySelection
                  closeOnSelect={false}
                  selectedKeys={statusFilter}
                  selectionMode="multiple"
                  onSelectionChange={setStatusFilter}
                >
                  {statusOptions.map((status) => (
                    <DropdownItem key={status.uid} className="capitalize">
                      {capitalize(status.name)}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            )}
            <Dropdown>
              <DropdownTrigger>
                <Button endContent={<ChevronDownIcon className="w-4 h-4" />} variant="flat">
                  Columns
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={setVisibleColumns}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid as string} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            {onAddNew && (
              <Button color="primary" endContent={<PlusIcon className="w-4 h-4" />} onPress={onAddNew}>
                Add New
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-default-400">
          <span>Total {paginationInfo.totalData} items</span>
          <label className="flex items-center gap-1">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-sm"
              onChange={onRowsPerPageChange}
              value={paginationInfo.limit}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [
    filterValue,
    onSearchChange,
    onClear,
    statusFilter,
    setStatusFilter,
    statusOptions,
    visibleColumns,
    setVisibleColumns,
    columns,
    onRowsPerPageChange,
    paginationInfo.totalData,
    paginationInfo.limit,
    onAddNew,
    filters,
    filterState,
    setFilterState,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-4 flex flex-col sm:flex-row justify-between items-center gap-3 bg-background">
        <span className="text-small text-default-400">
          {selectedKeys === 'all'
            ? 'All items selected'
            : `${selectedKeys.size} of ${data.length} selected`}
        </span>
        <Pagination
          isCompact
          showControls
          showShadow
          color="primary"
          page={paginationInfo.page}
          total={paginationInfo.totalPages}
          onChange={onPageChange}
        />
        <div className="flex gap-2 sm:hidden">
          <Button isDisabled={paginationInfo.page <= 1} size="sm" variant="flat" onPress={() => onPageChange(paginationInfo.page - 1)}>
            Prev
          </Button>
          <Button isDisabled={paginationInfo.page >= paginationInfo.totalPages} size="sm" variant="flat" onPress={() => onPageChange(paginationInfo.page + 1)}>
            Next
          </Button>
        </div>
      </div>
    );
  }, [selectedKeys, data.length, paginationInfo, onPageChange]);

  return (
    <div className="w-full flex flex-col">
      {/* Top Content (Filter, Search, dll) */}
      {topContent}

      {/* Scrollable Table Container */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 sm:px-0">
        <div className="inline-block min-w-full align-middle overflow-x-auto w-[100px] p-2">
          <Table
            isHeaderSticky
            aria-label="Responsive data table"
            sortDescriptor={sortDescriptor}
            onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}
            className="min-w-full"
            style={{ minWidth: '800px' }} // Pastikan tabel tidak terlalu sempit saat discroll
          >
            <TableHeader columns={headerColumns}>
              {(column) => (
                <TableColumn
                  key={column.uid as string}
                  align={column.uid === 'actions' ? 'center' : 'start'}
                  allowsSorting={column.sortable}
                  className="text-xs sm:text-sm"
                >
                  {column.name}
                </TableColumn>
              )}
            </TableHeader>
            <TableBody
              items={data}
              isLoading={isLoading}
              emptyContent={!isLoading && 'No data found'}
            >
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell className="text-xs sm:text-sm">
                      {renderCell(item, columnKey)}
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Bottom Content (Pagination) */}
      {bottomContent}
    </div>
  );
};

export default DataTable;
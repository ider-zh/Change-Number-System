import { useState, useMemo } from 'react';
import { ChevronDown, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

export interface ProjectItem {
  id: number;
  code: string;
  name: string;
  status: string;
  created_by?: string;
  created_at: string;
  approved_at?: string;
}

interface FilterableProjectSelectorProps {
  projects: ProjectItem[];
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}

type SortField = 'created_at' | 'code';
type SortOrder = 'asc' | 'desc';
type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

export function FilterableProjectSelector({
  projects,
  value,
  onChange,
  placeholder = '请选择项目',
}: FilterableProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 过滤和排序后的项目列表
  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // 状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // 关键字搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.code.toLowerCase().includes(query) ||
          p.name.toLowerCase().includes(query)
      );
    }

    // 排序
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [projects, searchQuery, statusFilter, sortField, sortOrder]);

  // 选中的项目
  const selectedProject = projects.find((p) => p.code === value);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const handleSortFieldChange = (field: SortField) => {
    if (sortField === field) {
      toggleSortOrder();
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground" />;
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-primary" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary" />
    );
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return <Badge variant="default" className="text-xs px-1.5 py-0">已通过</Badge>;
    if (status === 'pending') return <Badge variant="secondary" className="text-xs px-1.5 py-0">待审核</Badge>;
    if (status === 'rejected') return <Badge variant="destructive" className="text-xs px-1.5 py-0">已拒绝</Badge>;
    return null;
  };

  return (
    <div className="relative">
      {/* 触发器 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !value && 'text-muted-foreground'
        )}
      >
        <span className="truncate">
          {selectedProject ? (
            <span className="flex items-center gap-2">
              {selectedProject.code} - {selectedProject.name}
              {statusBadge(selectedProject.status)}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <>
          {/* 遮罩 */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-1 w-full max-h-80 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
            {/* 搜索框 */}
            <div className="p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="搜索项目代号或名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-8 pr-2 text-sm rounded-md border border-input bg-background px-2"
                  autoFocus
                />
              </div>
            </div>

            {/* 状态筛选 */}
            <div className="flex items-center gap-1 p-2 border-b overflow-x-auto">
              <Filter className="h-3 w-3 text-muted-foreground shrink-0" />
              {(['all', 'approved', 'pending', 'rejected'] as StatusFilter[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-md whitespace-nowrap transition-colors',
                    statusFilter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {status === 'all' ? '全部' : status === 'approved' ? '已通过' : status === 'pending' ? '待审核' : '已拒绝'}
                </button>
              ))}
            </div>

            {/* 排序按钮 */}
            <div className="flex items-center gap-2 p-2 border-b text-xs text-muted-foreground">
              <span>排序:</span>
              <button
                type="button"
                onClick={() => handleSortFieldChange('created_at')}
                className="flex items-center gap-1 hover:text-foreground"
              >
                {getSortIcon('created_at')}
                时间
              </button>
              <button
                type="button"
                onClick={() => handleSortFieldChange('code')}
                className="flex items-center gap-1 hover:text-foreground"
              >
                {getSortIcon('code')}
                代号
              </button>
            </div>

            {/* 项目列表 */}
            <div className="overflow-y-auto max-h-48 p-1">
              {filteredProjects.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  没有找到匹配的项目
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => {
                      onChange(project.code);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      value === project.code && 'bg-accent text-accent-foreground'
                    )}
                  >
                    <span className="flex-1 text-left">
                      <span className="font-medium">{project.code}</span>
                      <span className="text-muted-foreground ml-2">{project.name}</span>
                    </span>
                    {statusBadge(project.status)}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

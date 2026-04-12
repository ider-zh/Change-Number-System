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
          'flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm ring-offset-background transition-all',
          'hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !value && 'text-slate-400'
        )}
      >
        <span className="truncate font-medium">
          {selectedProject ? (
            <span className="flex items-center gap-2">
              <span className="text-slate-900">{selectedProject.code}</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600 truncate">{selectedProject.name}</span>
              {statusBadge(selectedProject.status)}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={cn('h-4 w-4 opacity-50 transition-transform duration-200', isOpen && 'rotate-180')} />
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <>
          {/* 遮罩 */}
          <div className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-2 w-full max-h-[400px] overflow-hidden rounded-2xl border border-slate-100 bg-white text-popover-foreground shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            {/* 搜索框 */}
            <div className="p-3 border-b border-slate-50 bg-slate-50/30">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索项目代号或名称..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2 border-b border-slate-50 bg-white">
              {/* 状态筛选 */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {(['all', 'approved', 'pending', 'rejected'] as StatusFilter[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      'px-2.5 py-1 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all border',
                      statusFilter === status
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    {status === 'all' ? '全部' : status === 'approved' ? '已通过' : status === 'pending' ? '待审核' : '已拒绝'}
                  </button>
                ))}
              </div>

              {/* 排序按钮 */}
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400 px-1">
                <span className="hidden xs:inline">排序:</span>
                <button
                  type="button"
                  onClick={() => handleSortFieldChange('created_at')}
                  className={cn(
                    "flex items-center gap-1 transition-colors hover:text-slate-900",
                    sortField === 'created_at' && "text-slate-900 font-bold"
                  )}
                >
                  {getSortIcon('created_at')}
                  时间
                </button>
                <button
                  type="button"
                  onClick={() => handleSortFieldChange('code')}
                  className={cn(
                    "flex items-center gap-1 transition-colors hover:text-slate-900",
                    sortField === 'code' && "text-slate-900 font-bold"
                  )}
                >
                  {getSortIcon('code')}
                  代号
                </button>
              </div>
            </div>

            {/* 项目列表 */}
            <div className="overflow-y-auto max-h-60 p-2 space-y-1">
              {filteredProjects.length === 0 ? (
                <div className="py-10 text-center flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Filter className="h-5 w-5 text-slate-300" />
                  </div>
                  <span className="text-sm text-slate-400">没有找到匹配的项目</span>
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
                      'relative flex w-full cursor-pointer select-none items-center rounded-xl px-3 py-3 text-sm outline-none transition-all group',
                      'hover:bg-slate-50',
                      value === project.code ? 'bg-primary/5 text-primary' : 'text-slate-700'
                    )}
                  >
                    <div className="flex-1 flex flex-col items-start overflow-hidden">
                      <div className="flex items-center gap-2 w-full">
                        <span className={cn(
                          "font-bold tracking-tight",
                          value === project.code ? "text-primary" : "text-slate-900"
                        )}>{project.code}</span>
                        {statusBadge(project.status)}
                      </div>
                      <span className="text-xs text-slate-500 truncate w-full mt-0.5">{project.name}</span>
                    </div>
                    {value === project.code && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
                    )}
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

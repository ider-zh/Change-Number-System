import React, { useState, useEffect, useCallback, useRef } from 'react';
import { applicationAPI, projectAPI, numberTypeAPI } from '../services';
import type { Project, NumberType, Application } from '../services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Copy, Check, Search, Filter, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsData {
  total: number;
  byType?: Array<{ number_type: string; count: number }>;
}

export function ApplicationList() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({
    keyword: '',
    project_code: '',
    number_type: '',
    start_date: '',
    end_date: '',
    applicant_name: '',
    ip_address: ''
  });
  const [stats, setStats] = useState<StatsData | null>(null);
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 高级筛选的候选数据
  const [projects, setProjects] = useState<Project[]>([]);
  const [numberTypes, setNumberTypes] = useState<NumberType[]>([]);

  // 复制状态
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  // 搜索防抖 ref
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 处理 end_date，添加结束时间 23:59:59
      const apiFilters = { ...filters };
      if (apiFilters.end_date) {
        apiFilters.end_date = apiFilters.end_date + ' 23:59:59';
      }

      const [appsRes, statsRes] = await Promise.all([
        applicationAPI.getAll({ ...apiFilters, page: pagination.page, limit: pagination.limit }),
        applicationAPI.getStats(),
      ]);
      setApplications((appsRes as { data: { data: Application[]; pagination: typeof pagination } }).data?.data || []);
      setPagination((appsRes as { data: { data: Application[]; pagination: typeof pagination } }).data?.pagination || pagination);
      setStats((statsRes as { data: StatsData }).data || null);
    } catch (err) {
      console.error('加载数据失败', err);
    } finally {
      setLoading(false);
    }
  }, [filters.keyword, filters.project_code, filters.number_type, filters.start_date, filters.end_date, filters.applicant_name, filters.ip_address, pagination.page, pagination.limit]);
  
  // 加载高级筛选的候选数据
  const loadFilterOptions = useCallback(async () => {
    try {
      const [projectsRes, numberTypesRes] = await Promise.all([
        projectAPI.getAll('approved'),
        numberTypeAPI.getAll('approved'),
      ]);
      setProjects((projectsRes as { data: Project[] }).data || []);
      setNumberTypes((numberTypesRes as { data: NumberType[] }).data || []);
    } catch (err) {
      console.error('加载筛选选项失败', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadFilterOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.keyword, filters.project_code, filters.number_type, filters.start_date, filters.end_date, filters.applicant_name, filters.ip_address, pagination.page, loadFilterOptions]);

  // 清理搜索防抖
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 重置到第一页
    setPagination(prev => ({ ...prev, page: 1 }));
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, keyword: e.target.value }));
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleExport = async () => {
    if (!isAdmin) return;
    try {
      await applicationAPI.exportCSV();
    } catch (err) {
      console.error('导出失败', err);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(applications.map(app => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`确定要删除选中的 ${selectedIds.length} 条记录吗？`)) return;

    try {
      await applicationAPI.batchDelete(selectedIds);
      setSelectedIds([]);
      loadData();
    } catch (err) {
      console.error('批量删除失败', err);
    }
  };

  // 复制编号到剪贴板
  const copyToClipboard = useCallback(async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedNumber(number);
      setTimeout(() => setCopiedNumber(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = number;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedNumber(number);
      setTimeout(() => setCopiedNumber(null), 2000);
    }
  }, []);

  // 检查记录是否应该高亮（30 秒内创建的记录）
  const isRecent = useCallback((createdAt: string) => {
    // SQLite 的 CURRENT_TIMESTAMP 是 UTC 时间，需要正确解析
    // 如果字符串不包含时区信息，添加 'Z' 表示 UTC
    const timeString = createdAt.endsWith('Z') ? createdAt : createdAt + 'Z';
    const recordTime = new Date(timeString).getTime();
    const now = Date.now();
    return (now - recordTime) < 30000;
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">累计总申请</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{stats.total}</span>
              <span className="text-xs text-slate-400 font-medium ml-1">次</span>
            </div>
          </div>
          {stats.byType?.map((item: { number_type: string; count: number }) => (
            <div key={item.number_type} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">{item.number_type} 类型</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">{item.count}</span>
                <span className="text-xs text-slate-400 font-medium ml-1">次</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="px-6 py-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/30">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="搜索申请人/项目/编号..."
                value={filters.keyword}
                onChange={handleSearch}
                className="pl-10 h-10 bg-white border-slate-200 rounded-xl focus:ring-primary/10 transition-all"
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn("rounded-xl h-10 px-4 transition-all", showAdvancedFilters && "bg-slate-900 text-white border-slate-900")}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? '收起筛选' : '筛选'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            {isAdmin && selectedIds.length > 0 && (
              <Button variant="destructive" size="sm" onClick={handleBatchDelete} className="rounded-xl h-10 shadow-lg shadow-destructive/10">
                批量删除 ({selectedIds.length})
              </Button>
            )}
            {isAdmin && (
              <Button variant="default" onClick={handleExport} className="rounded-xl h-10 shadow-lg shadow-primary/10">
                导出报告
              </Button>
            )}
          </div>
        </div>

        {showAdvancedFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6 bg-slate-50/50 border-b border-slate-50 animate-in slide-in-from-top-2 duration-300">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">开始日期</label>
              <Input
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters(prev => ({ ...prev, start_date: e.target.value }))}
                className="h-9 rounded-lg border-slate-200 bg-white text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">结束日期</label>
              <Input
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters(prev => ({ ...prev, end_date: e.target.value }))}
                className="h-9 rounded-lg border-slate-200 bg-white text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">项目代号</label>
              <select
                value={filters.project_code}
                onChange={(e) => setFilters(prev => ({ ...prev, project_code: e.target.value }))}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="">所有项目</option>
                {projects.map(p => (
                  <option key={p.id} value={p.code}>{p.code}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">编号类型</label>
              <select
                value={filters.number_type}
                onChange={(e) => setFilters(prev => ({ ...prev, number_type: e.target.value }))}
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="">所有类型</option>
                {numberTypes.map(nt => (
                  <option key={nt.id} value={nt.type_code}>{nt.type_code}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">申请人</label>
              <Input
                type="text"
                placeholder="姓名搜索"
                value={filters.applicant_name}
                onChange={(e) => setFilters(prev => ({ ...prev, applicant_name: e.target.value }))}
                className="h-9 rounded-lg border-slate-200 bg-white text-xs"
              />
            </div>
            {isAdmin && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">IP 地址</label>
                <Input
                  type="text"
                  placeholder="IP 地址"
                  value={filters.ip_address}
                  onChange={(e) => setFilters(prev => ({ ...prev, ip_address: e.target.value }))}
                  className="h-9 rounded-lg border-slate-200 bg-white text-xs"
                />
              </div>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-slate-400 font-medium">加载数据中...</span>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Database className="h-8 w-8 text-slate-200" />
              </div>
              <h4 className="text-slate-900 font-bold">暂无申请记录</h4>
              <p className="text-slate-400 text-sm max-w-xs mt-1">目前还没有任何编号申请记录，请在上方提交您的第一条申请。</p>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    {isAdmin && <th className="px-6 py-4 text-left w-12">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={applications.length > 0 && selectedIds.length === applications.length}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                      />
                    </th>}
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">编号详情</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">申请人</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">项目/类型</th>
                    <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">申请时间</th>
                    {isAdmin && <th className="px-6 py-4 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">访问来源</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {applications.map(app => {
                    const recent = isRecent(app.created_at);
                    return (
                      <tr
                        key={app.id}
                        className={cn(
                          'group transition-all hover:bg-slate-50/80',
                          recent && 'bg-primary/[0.02] border-l-4 border-l-primary animate-in fade-in duration-1000'
                        )}
                      >
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(app.id)}
                              onChange={(e) => handleSelectOne(app.id, e.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(app.full_number)}
                              className="flex items-center gap-2 w-fit group/btn transition-transform active:scale-95"
                              title="点击复制"
                            >
                              <code className="bg-slate-900 text-slate-50 px-3 py-1 rounded-lg font-mono text-sm font-bold shadow-sm group-hover/btn:bg-primary transition-colors">
                                {app.full_number}
                              </code>
                              {copiedNumber === app.full_number ? (
                                <Check className="h-3.5 w-3.5 text-green-500 animate-in zoom-in" />
                              ) : (
                                <Copy className="h-3.5 w-3.5 text-slate-300 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                              )}
                            </button>
                            {copiedNumber === app.full_number && (
                              <span className="text-[10px] text-green-500 font-bold ml-1 animate-in slide-in-from-left-1">已复制</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{app.applicant_name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">正式职员</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="rounded-md border-slate-200 text-slate-600 bg-white font-bold text-[10px]">{app.project_code}</Badge>
                            <span className="text-slate-300">/</span>
                            <Badge variant="secondary" className="rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border-none font-bold text-[10px]">{app.number_type}</Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-600 font-medium">
                              {new Date(app.created_at).toLocaleDateString('zh-CN')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(app.created_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              <span className="text-xs font-mono text-slate-400">{app.ip_address || '0.0.0.0'}</span>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="px-6 py-6 border-t border-slate-50 flex justify-between items-center bg-slate-50/20">
                <p className="text-xs text-slate-400 font-medium">
                  显示第 {(pagination.page - 1) * pagination.limit + 1} 到 {Math.min(pagination.page * pagination.limit, pagination.total)} 条，共 {pagination.total} 条记录
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl h-9 px-4 hover:bg-white hover:shadow-sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    上一页
                  </Button>
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900 text-white text-xs font-bold">
                    {pagination.page}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl h-9 px-4 hover:bg-white hover:shadow-sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

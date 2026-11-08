import { useCallback, useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { FixtureNumberForm } from '../components/FixtureNumberForm';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { fixtureAPI, type FixtureRequest, type FixtureStatsRow } from '../services';
import { formatBeijingTime } from '../utils/timezone';

const TYPE_NAMES = { FT: '工装治具', AM: '辅助物料', TL: '工具' } as const;
const TYPES = ['FT', 'AM', 'TL'] as const;

interface RequestPage {
  data: FixtureRequest[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function FixtureNumberPage() {
  const [records, setRecords] = useState<FixtureRequest[]>([]);
  const [stats, setStats] = useState<FixtureStatsRow[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 8, total: 0, totalPages: 1 });
  const [draftSearch, setDraftSearch] = useState('');
  const [draftType, setDraftType] = useState('');
  const [search, setSearch] = useState('');
  const [typeCode, setTypeCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState('');
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const loadRecords = useCallback(async (page: number, searchValue: string, typeValue: string) => {
    setLoading(true);
    setError('');
    try {
      const [recordsResponse, statsResponse] = await Promise.all([
        fixtureAPI.getRequests({ page, limit: pagination.limit, search: searchValue, type_code: typeValue }),
        fixtureAPI.getStats(),
      ]);
      const recordPage = (recordsResponse as { data: RequestPage }).data;
      setRecords(recordPage.data || []);
      setPagination(recordPage.pagination);
      setStats((statsResponse as { data: FixtureStatsRow[] }).data || []);
    } catch {
      setError('加载工装申请记录失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    loadRecords(pagination.page, search, typeCode);
  }, [loadRecords, pagination.page, search, typeCode]);

  const applyFilter = () => {
    setSearch(draftSearch.trim());
    setTypeCode(draftType);
    setPagination(previous => ({ ...previous, page: 1 }));
  };

  const onApplicationSubmitted = () => {
    setPagination(previous => ({ ...previous, page: 1 }));
    loadRecords(1, search, typeCode);
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError('');
    try {
      await fixtureAPI.exportCSV();
    } catch {
      setExportError('导出工装申请记录失败，请重新登录后重试');
    } finally {
      setExporting(false);
    }
  };

  const totalApplications = stats.reduce((sum, row) => sum + row.applications, 0);
  const typeTotals = Object.fromEntries(TYPES.map(type => [type, stats.filter(row => row.type_code === type).reduce((sum, row) => sum + row.applications, 0)])) as Record<typeof TYPES[number], number>;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] min-h-[calc(100vh-7rem)]">
          <div className="min-w-0">
            <FixtureNumberForm onApplicationSubmitted={onApplicationSubmitted} />
          </div>
          <div className="min-w-0">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>工装治具申请记录</CardTitle>
                  {isAdmin && <Button variant="default" onClick={handleExport} disabled={exporting}>{exporting ? '导出中...' : '导出记录'}</Button>}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {exportError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{exportError}</p>}
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-3 bg-sky-50/60 border border-sky-100 rounded-lg px-3 py-2 text-center shadow-sm flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">总申请数量</span>
                    <span className="text-xl font-black font-mono text-sky-600">{totalApplications}</span>
                  </div>
                  {TYPES.map(type => <div key={type} className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-center shadow-sm">
                    <span className="block text-[10px] text-slate-500 font-medium">{TYPE_NAMES[type]}</span>
                    <span className="block text-sm font-bold font-mono text-slate-700">{typeTotals[type]}</span>
                  </div>)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input value={draftSearch} onChange={event => setDraftSearch(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') applyFilter(); }} placeholder="搜索编号、项目或申请人" />
                  <select value={draftType} onChange={event => setDraftType(event.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500">
                    <option value="">全部类别</option>
                    {TYPES.map(type => <option key={type} value={type}>{TYPE_NAMES[type]} · {type}</option>)}
                  </select>
                </div>
                <Button onClick={applyFilter}>查询</Button>

                {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                {loading ? <div className="text-center py-10 text-muted-foreground">加载中...</div> :
                  <div className="overflow-x-auto rounded-lg border shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-muted text-xs md:text-sm"><tr>
                        <th className="px-3.5 py-3 font-semibold whitespace-nowrap">申请人</th>
                        <th className="px-3.5 py-3 font-semibold whitespace-nowrap">工装编号</th>
                        <th className="px-3.5 py-3 font-semibold whitespace-nowrap">种类名称</th>
                      </tr></thead>
                      <tbody className="text-xs md:text-sm">
                        {records.length === 0 ? <tr><td colSpan={3} className="px-3.5 py-8 text-center text-muted-foreground">暂无记录</td></tr> : records.map(record =>
                          <tr key={record.id} className="border-b align-top hover:bg-muted/50">
                            <td className="px-3.5 py-3 whitespace-nowrap text-slate-700"><div>{record.applicant_name}</div><div className="mt-1 text-[10px] text-slate-400">{formatBeijingTime(record.created_at)}</div></td>
                            <td className="px-3.5 py-3 font-medium text-slate-800 font-mono">{record.numbers.map(number => <div key={number} className="whitespace-nowrap select-all">{number}</div>)}<span className="text-[10px] font-sans text-sky-700">{record.quantity} 个编号</span></td>
                            <td className="px-3.5 py-3 text-slate-600">{record.label || '-'}</td>
                          </tr>)}
                      </tbody>
                    </table>
                  </div>}
                {!loading && pagination.total > 0 && <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600">共 {pagination.total} 条申请记录</span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination(previous => ({ ...previous, page: previous.page - 1 }))}>上一页</Button>
                    <span className="text-sm text-slate-700">第 {pagination.page} / {pagination.totalPages} 页</span>
                    <Button variant="outline" size="sm" disabled={pagination.page >= pagination.totalPages} onClick={() => setPagination(previous => ({ ...previous, page: previous.page + 1 }))}>下一页</Button>
                  </div>
                </div>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

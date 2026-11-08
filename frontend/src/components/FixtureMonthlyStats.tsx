import { useEffect, useState } from 'react';
import { fixtureAPI, type FixtureRequest, type FixtureStatsRow } from '../services';
import { formatBeijingTime } from '../utils/timezone';
import { Button } from './ui/button';

const TYPES = [
  { code: 'FT', name: '工装治具', color: 'bg-sky-500' },
  { code: 'AM', name: '辅助物料', color: 'bg-teal-500' },
  { code: 'TL', name: '工具', color: 'bg-amber-500' },
] as const;

interface Props {
  months: string[];
  stats: FixtureStatsRow[];
}

interface Selection {
  month: string;
  typeCode?: string;
  title: string;
}

interface RequestPage {
  data: FixtureRequest[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export function FixtureMonthlyStats({ months, stats }: Props) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<FixtureRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selection) return;
    let active = true;
    fixtureAPI.getRequests({ month: selection.month, type_code: selection.typeCode, page, limit: 10 })
      .then(response => {
        if (!active) return;
        const result = (response as { data: RequestPage }).data;
        setRecords(result.data || []);
        setTotal(result.pagination.total);
        setTotalPages(result.pagination.totalPages);
        setError('');
      })
      .catch(() => { if (active) setError('加载申请明细失败'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selection, page]);

  const openDetails = (month: string, typeCode?: string) => {
    const typeName = TYPES.find(type => type.code === typeCode)?.name;
    setRecords([]);
    setTotal(0);
    setTotalPages(1);
    setLoading(true);
    setPage(1);
    setSelection({ month, typeCode, title: `${month} 月度${typeName ? ` ${typeName}` : '工装治具全部'}申请明细` });
  };

  const monthly = months.map(month => {
    const rows = stats.filter(row => row.month === month);
    const counts = Object.fromEntries(TYPES.map(type => [type.code, rows.find(row => row.type_code === type.code)?.applications || 0])) as Record<typeof TYPES[number]['code'], number>;
    return { month, counts, total: Object.values(counts).reduce((sum, count) => sum + count, 0) };
  });
  const maxTotal = Math.max(...monthly.map(item => item.total), 5);

  return <>
    <div className="flex flex-wrap gap-4 justify-center items-center mb-6 select-none">
      {TYPES.map(type => <div key={type.code} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <span className={`w-3.5 h-3.5 rounded-full ${type.color} shadow-sm`} />
        <span>{type.name} ({type.code})</span>
      </div>)}
    </div>
    <div className="flex pb-2 mb-2 items-end max-w-3xl mx-auto px-4">
      <div className="flex flex-col justify-between text-[10px] text-slate-400 font-bold font-mono h-56 pr-4 select-none pb-6">
        <span>{maxTotal}</span><span>{Math.round(maxTotal * 0.75)}</span><span>{Math.round(maxTotal * 0.5)}</span><span>{Math.round(maxTotal * 0.25)}</span><span>0</span>
      </div>
      <div className="flex-1 flex justify-around items-end h-56 pb-6 relative border-b border-slate-200 border-l border-slate-100">
        <div className="absolute inset-x-0 top-0 border-t border-slate-100/50 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/4 border-t border-slate-100/50 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 border-t border-slate-100/50 pointer-events-none" />
        <div className="absolute inset-x-0 top-3/4 border-t border-slate-100/50 pointer-events-none" />
        {monthly.map(item => <div key={item.month} className="flex flex-col items-center justify-end w-12 sm:w-16 h-full relative z-10 group">
          {item.total > 0 && <button onClick={() => openDetails(item.month)} className="text-[10px] font-black text-slate-600 bg-slate-100 hover:bg-sky-100 hover:text-sky-700 px-1.5 py-0.5 rounded transition mb-2 shadow-sm" title={`点击查看 ${item.month} 月工装申请明细`}>{item.total}</button>}
          <div className="w-7 sm:w-9 bg-slate-50 border border-slate-200/60 rounded-t-md overflow-hidden flex flex-col-reverse justify-start shadow-sm group-hover:shadow-md transition-all duration-200" style={{ height: `${Math.max((item.total / maxTotal) * 100, 2)}%`, minHeight: item.total > 0 ? '8px' : '0px' }}>
            {TYPES.map(type => {
              const count = item.counts[type.code];
              if (!count) return null;
              return <button key={type.code} onClick={() => openDetails(item.month, type.code)} style={{ height: `${(count / item.total) * 100}%` }} className={`w-full ${type.color} hover:brightness-95 transition-all cursor-pointer relative group/segment`} title={`${item.month} ${type.name}: ${count}条 (点击查看详情)`}>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white opacity-0 group-hover/segment:opacity-100 transition-opacity">{count}</span>
              </button>;
            })}
          </div>
          <span className="absolute -bottom-6 text-[10px] sm:text-xs font-bold text-slate-400 select-none">{item.month.slice(5)}月</span>
        </div>)}
      </div>
    </div>

    {selection && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-label={selection.title} className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="px-6 py-5 bg-gradient-to-r from-slate-50 via-slate-100/50 to-slate-50 border-b flex items-center justify-between">
          <div><h3 className="text-xl font-bold text-slate-900">{selection.title}</h3><p className="text-xs text-slate-500 mt-0.5">共计 {total} 条申请记录</p></div>
          <button onClick={() => setSelection(null)} aria-label="关闭" className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? <p className="text-center py-8 text-sm text-slate-500">加载中...</p> : error ? <p role="alert" className="text-center py-8 text-sm text-red-700">{error}</p> : records.length === 0 ? <p className="text-center py-8 text-sm text-slate-500">暂无记录</p> :
            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm"><table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-xs text-slate-600 border-b"><tr><th className="px-4 py-3">工装编号</th><th className="px-4 py-3">申请人</th><th className="px-4 py-3">项目代号</th><th className="px-4 py-3">编号类型</th><th className="px-4 py-3">申请时间</th></tr></thead>
              <tbody className="text-xs md:text-sm">{records.map(record => <tr key={record.id} className="border-b hover:bg-slate-50/50">
                <td className="px-4 py-3 font-semibold font-mono text-slate-800">{record.numbers.map(number => <div key={number} className="select-all whitespace-nowrap">{number}</div>)}</td>
                <td className="px-4 py-3 text-slate-700">{record.applicant_name}</td>
                <td className="px-4 py-3 text-slate-600">{record.project_code}</td>
                <td className="px-4 py-3 text-slate-600">{record.type_code}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{formatBeijingTime(record.created_at)}</td>
              </tr>)}</tbody>
            </table></div>}
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">第 {page} / {totalPages} 页</span>
          <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => { setLoading(true); setPage(value => value - 1); }}>上一页</Button><Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={() => { setLoading(true); setPage(value => value + 1); }}>下一页</Button><Button variant="outline" size="sm" onClick={() => setSelection(null)}>关闭</Button></div>
        </div>
      </div>
    </div>}
  </>;
}

import { useEffect, useState, type FormEvent } from 'react';
import { Check, Copy } from 'lucide-react';
import { fixtureAPI, projectAPI, type FixtureKind, type Project } from '../services';
import { CapVerification } from './CapVerification';
import { FilterableProjectSelector } from './FilterableProjectSelector';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { formatBeijingTime } from '../utils/timezone';

interface Props {
  onApplicationSubmitted?: () => void;
}

type Mode = 'new' | 'replica' | 'existing';
const TYPE_NAMES = { FT: '工装治具', AM: '辅助物料', TL: '工具' } as const;

export function FixtureNumberForm({ onApplicationSubmitted }: Props) {
  const [mode, setMode] = useState<Mode>('new');
  const [applicant, setApplicant] = useState('');
  const [typeCode, setTypeCode] = useState('FT');
  const [replicaBaseNumber, setReplicaBaseNumber] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectLoadError, setProjectLoadError] = useState(false);
  const [label, setLabel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [includeQuantity, setIncludeQuantity] = useState(true);
  const [specialCategory, setSpecialCategory] = useState(false);
  const [search, setSearch] = useState('');
  const [kinds, setKinds] = useState<FixtureKind[]>([]);
  const [loadingKinds, setLoadingKinds] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [capToken, setCapToken] = useState<string | null>(null);
  const [capKey, setCapKey] = useState(0);
  const [error, setError] = useState('');
  const [numbers, setNumbers] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem('userInfo');
    if (cached) {
      try { setApplicant(JSON.parse(cached).name || ''); } catch { /* 忽略损坏的缓存 */ }
    }
  }, []);

  useEffect(() => {
    let active = true;
    projectAPI.getAll('approved,pending').then(response => {
      if (active) setProjects((response as { data: Project[] }).data || []);
    }).catch(() => {
      if (active) setProjectLoadError(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (mode !== 'existing') return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setLoadingKinds(true);
      try {
        const response = await fixtureAPI.getKinds(search);
        if (active) setKinds((response as { data: FixtureKind[] }).data || []);
      } catch {
        if (active) setError('加载已有种类失败');
      } finally {
        if (active) setLoadingKinds(false);
      }
    }, 200);
    return () => { active = false; window.clearTimeout(timer); };
  }, [mode, search]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === 'existing') return;
    setError('');
    setNumbers([]);
    if (mode === 'new' && !specialCategory && !projectCode) { setError('请选择项目代号'); return; }
    if (mode === 'replica' && !replicaBaseNumber.trim()) { setError('请输入复刻的种类编号'); return; }
    if (!capToken) { setError('请完成人机验证'); return; }
    setSubmitting(true);
    try {
      localStorage.setItem('userInfo', JSON.stringify({ name: applicant.trim() }));
      const response = await fixtureAPI.issue({
        mode,
        applicant_name: applicant.trim(),
        quantity,
        ...(mode === 'new'
          ? { type_code: typeCode, project_code: specialCategory ? '' : projectCode, label, omit_type_separator: specialCategory }
          : { base_number: replicaBaseNumber.trim().toUpperCase() }),
        include_quantity: mode === 'replica' || quantity > 1 || includeQuantity,
        capToken,
      });
      const data = (response as { data: { base_number: string; numbers: string[] } }).data;
      setNumbers(data.numbers);
      setCapToken(null);
      setCapKey(value => value + 1);
      setSearch('');
      setCopied(false);
      onApplicationSubmitted?.();
    } catch (cause: unknown) {
      setError(cause && typeof cause === 'object' && 'message' in cause ? String(cause.message) : '取号失败');
      setCapToken(null);
      setCapKey(value => value + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(numbers.join('\n'));
      setCopied(true);
    } catch { setError('复制失败，请手动选择编号'); }
  };

  const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100';
  const labelClass = 'block text-sm font-semibold text-slate-700';
  const sectionClass = 'space-y-2 p-4 rounded-2xl border border-slate-200 bg-white';

  return (
    <Card className="w-full max-w-full relative overflow-hidden border-2 border-sky-300/30 shadow-2xl shadow-sky-200/40">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-transparent to-white pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 animate-pulse" />
      <CardHeader className="relative bg-gradient-to-r from-sky-50 via-cyan-50 to-slate-50 border-b border-sky-200/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-200/40 border-2 border-sky-300"><span className="text-2xl">🧰</span></div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">工装治具编号申请</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">FT 工装治具 / AM 辅助物料 / TL 工具</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative pt-6 px-4 sm:px-6 space-y-6">
        {error && <p role="alert" className="bg-red-50 border-2 border-red-200 text-red-800 px-5 py-4 rounded-lg font-medium">{error}</p>}
        {numbers.length > 0 && <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 border-2 border-emerald-500/30 rounded-2xl p-5 shadow-xl shadow-emerald-500/5" aria-live="polite">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-bold text-emerald-800">🎉 成功生成 {numbers.length} 个工装编号</p>
            <button type="button" onClick={copyAll} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline">{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? '已复制' : '复制全部'}</button>
          </div>
          <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl bg-slate-900 p-4 font-mono text-sm font-bold text-emerald-400">{numbers.map(number => <div key={number} className="select-all">{number}</div>)}</div>
        </div>}
        <form onSubmit={submit} className="space-y-5">
          <div className={sectionClass}>
            <p className="text-sm font-semibold">🧭 取号方式 <span className="text-destructive">*</span></p>
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1" role="group" aria-label="取号方式">
              {([['new', '全新种类'], ['replica', '复刻种类'], ['existing', '已有种类']] as const).map(([value, title]) => (
                <button key={value} type="button" onClick={() => { setMode(value); setNumbers([]); setError(''); if (value === 'existing') setLoadingKinds(true); }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === value ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{title}</button>
              ))}
            </div>
          </div>

          {mode !== 'existing' && (
            <div className={sectionClass}>
              <label className={labelClass}>👤 申请人姓名 <span className="text-destructive">*</span>
                <input className={inputClass} value={applicant} onChange={event => setApplicant(event.target.value)} maxLength={100} required placeholder="请输入姓名" />
              </label>
            </div>
          )}

          {mode === 'new' ? (
            <div className={sectionClass}>
              <p className="text-sm font-semibold">🧰 工装类别与项目 <span className="text-destructive">*</span></p>
              <div className="grid grid-cols-[1fr_1.4fr] gap-3">
                <label className={labelClass}>类型代码
                  <select className={inputClass} value={typeCode} onChange={event => setTypeCode(event.target.value)}>
                    <option value="FT">FT · 工装治具</option>
                    <option value="AM">AM · 辅助物料</option>
                    <option value="TL">TL · 工具</option>
                  </select>
                </label>
                <div className={labelClass}>项目代号
                  <div className="mt-1.5">
                    {specialCategory ? (
                      <button type="button" disabled className="flex h-10 w-full items-center rounded-md border border-input bg-slate-100 px-3 py-2 text-sm text-slate-500 disabled:cursor-not-allowed">特殊类别不选择项目代号</button>
                    ) : (
                      <FilterableProjectSelector projects={projects} value={projectCode} onChange={setProjectCode} placeholder="请选择项目代号" />
                    )}
                  </div>
                </div>
              </div>
              {!specialCategory && projectLoadError && <p className="text-xs text-red-700">加载项目代号失败，请刷新页面重试。</p>}
              <p className="text-xs text-slate-500">{specialCategory ? `特殊类别编号如 ${typeCode}-01-01。` : '从项目列表选择；若代号包含连接符，如 QCI-ABC，编号使用 QCI。'}</p>
              <label className={labelClass}>种类名称 <span className="font-normal text-slate-400">选填，便于以后查找</span>
                <input className={inputClass} value={label} onChange={event => setLabel(event.target.value)} maxLength={100} placeholder="如测试定位治具" />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={specialCategory} onChange={event => { setSpecialCategory(event.target.checked); if (event.target.checked) setProjectCode(''); }} />
                特殊类别，不需要选择项目代号
              </label>
            </div>
          ) : mode === 'replica' ? (
            <div className={sectionClass}>
              <label className={labelClass}>复刻种类编号 <span className="text-destructive">*</span>
                <input className={inputClass} value={replicaBaseNumber} onChange={event => setReplicaBaseNumber(event.target.value.toUpperCase())} placeholder="如 FT-CM-01" />
                <span className="mt-1 block text-xs font-normal text-slate-500">请输入复刻的种类编号，如：FT-CM-XXX</span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800">🧰 已有种类编号</p>
                {!loadingKinds && <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">显示 {kinds.length} 条</span>}
              </div>
              <Input
                aria-label="搜索已有种类编号"
                value={search}
                onChange={event => { setSearch(event.target.value); setLoadingKinds(true); }}
                placeholder="搜索种类编号或名称"
              />
              <div className="max-h-[36rem] overflow-auto rounded-lg border border-slate-200 shadow-sm">
                <table className="w-full min-w-[620px] border-collapse text-left">
                  <thead className="sticky top-0 z-10 bg-muted text-xs md:text-sm">
                    <tr>
                      <th className="whitespace-nowrap px-3.5 py-3 font-semibold">种类编号</th>
                      <th className="whitespace-nowrap px-3.5 py-3 font-semibold">类别 / 项目</th>
                      <th className="whitespace-nowrap px-3.5 py-3 font-semibold">种类名称</th>
                      <th className="whitespace-nowrap px-3.5 py-3 font-semibold">发放情况</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs md:text-sm">
                    {loadingKinds ? <tr><td colSpan={4} className="px-3.5 py-10 text-center text-muted-foreground">加载中...</td></tr> : kinds.length === 0 ? (
                      <tr><td colSpan={4} className="px-3.5 py-10 text-center text-muted-foreground">暂无匹配的种类编号</td></tr>
                    ) : kinds.map(kind => (
                      <tr key={kind.id} className="border-b align-top hover:bg-muted/50">
                        <td className="px-3.5 py-3">
                          <div className="select-all whitespace-nowrap font-mono font-semibold text-slate-800">{kind.base_number}</div>
                          <div className="mt-1 whitespace-nowrap text-[10px] text-slate-400">{formatBeijingTime(kind.created_at)}</div>
                        </td>
                        <td className="px-3.5 py-3 text-slate-700">
                          <div className="whitespace-nowrap font-medium">{TYPE_NAMES[kind.type_code]} · {kind.type_code}</div>
                          <div className="mt-1 text-xs text-slate-500">{kind.project_code || '特殊类别'}</div>
                        </td>
                        <td className="px-3.5 py-3 text-slate-600">{kind.label || '-'}</td>
                        <td className="px-3.5 py-3 text-slate-700">
                          <div className="whitespace-nowrap font-medium">已发放 {kind.issued_count} 个</div>
                          <div className="mt-1 whitespace-nowrap text-xs text-slate-500">申请 {kind.request_count} 次</div>
                          <div className="mt-1 whitespace-nowrap font-mono text-[11px] text-sky-700">最新 {kind.max_quantity_serial ? `${kind.base_number}-${String(kind.max_quantity_serial).padStart(2, '0')}` : kind.issued_count ? kind.base_number : '尚未发放'}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {mode !== 'existing' && <div className={sectionClass}>
            <div className="grid grid-cols-2 items-end gap-3">
              <label className={labelClass}>🔢 申请数量 <span className="text-destructive">*</span>
                <input type="number" min="1" max="999" step="1" className={inputClass} value={quantity} onChange={event => setQuantity(Number(event.target.value))} required />
              </label>
              <p className="pb-2 text-xs leading-5 text-slate-500">{mode === 'replica' ? '从该种类历史最大数量号继续发放' : '新种类从 01 开始发放'}</p>
            </div>
            {mode === 'new' && quantity === 1 && (
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={includeQuantity} onChange={event => setIncludeQuantity(event.target.checked)} />
                生成数量流水号（如 FT-QCI-01-01）
              </label>
            )}
            {mode === 'new' && quantity > 1 && <p className="text-xs text-sky-700">申请多套时，每套都会生成独立的数量流水号。</p>}
          </div>}

          {mode !== 'existing' && <div className="space-y-2 p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-sm font-semibold">🔒 人机验证 <span className="text-destructive">*</span></p>
            <CapVerification key={capKey} endpoint="/cap/" onSolve={setCapToken} onReset={() => setCapToken(null)} />
          </div>}
          {mode !== 'existing' && <button type="submit" disabled={submitting || !capToken} className="w-full h-14 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 text-lg font-bold text-white shadow-xl transition hover:from-sky-700 hover:to-cyan-700 disabled:opacity-60">{submitting ? '正在发号…' : `提交申请${quantity > 1 ? ` · ${quantity} 个` : ''}`}</button>}
        </form>
      </CardContent>
    </Card>
  );
}

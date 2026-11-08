import { useEffect, useState, type FormEvent } from 'react';
import { Check, Copy } from 'lucide-react';
import { fixtureAPI, type FixtureKind } from '../services';
import { CapVerification } from './CapVerification';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface Props {
  onApplicationSubmitted?: () => void;
}

type Mode = 'new' | 'existing';

export function FixtureNumberForm({ onApplicationSubmitted }: Props) {
  const [mode, setMode] = useState<Mode>('new');
  const [applicant, setApplicant] = useState('');
  const [typeCode, setTypeCode] = useState('FT');
  const [projectCode, setProjectCode] = useState('');
  const [label, setLabel] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [includeQuantity, setIncludeQuantity] = useState(true);
  const [omitTypeSeparator, setOmitTypeSeparator] = useState(false);
  const [search, setSearch] = useState('');
  const [baseNumber, setBaseNumber] = useState('');
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
    setError('');
    setNumbers([]);
    if (!capToken) { setError('请完成人机验证'); return; }
    if (mode === 'existing' && !baseNumber.trim()) { setError('请选择或输入已有种类编号'); return; }
    setSubmitting(true);
    try {
      localStorage.setItem('userInfo', JSON.stringify({ name: applicant.trim() }));
      const response = await fixtureAPI.issue({
        mode,
        applicant_name: applicant.trim(),
        quantity,
        type_code: typeCode,
        project_code: projectCode,
        label,
        base_number: baseNumber,
        include_quantity: quantity > 1 || includeQuantity,
        omit_type_separator: omitTypeSeparator,
        capToken,
      });
      const data = (response as { data: { base_number: string; numbers: string[] } }).data;
      setNumbers(data.numbers);
      setBaseNumber(data.base_number);
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
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1" role="group" aria-label="取号方式">
              {([['new', '全新种类'], ['existing', '已有种类']] as const).map(([value, title]) => (
                <button key={value} type="button" onClick={() => { setMode(value); setNumbers([]); setError(''); }} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${mode === value ? 'bg-white text-sky-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>{title}</button>
              ))}
            </div>
          </div>

          <div className={sectionClass}>
            <label className={labelClass}>👤 申请人姓名 <span className="text-destructive">*</span>
              <input className={inputClass} value={applicant} onChange={event => setApplicant(event.target.value)} maxLength={100} required placeholder="请输入姓名" />
            </label>
          </div>

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
                <label className={labelClass}>项目代号
                  <input className={inputClass} value={projectCode} onChange={event => setProjectCode(event.target.value.toUpperCase())} required placeholder="如 QCI" />
                </label>
              </div>
              <p className="text-xs text-slate-500">项目代号填 2–6 位字母；如填 QCI-ABC，编号使用 QCI。</p>
              <label className={labelClass}>种类名称 <span className="font-normal text-slate-400">选填，便于以后查找</span>
                <input className={inputClass} value={label} onChange={event => setLabel(event.target.value)} maxLength={100} placeholder="如测试定位治具" />
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-600">
                <input type="checkbox" checked={omitTypeSeparator} onChange={event => setOmitTypeSeparator(event.target.checked)} />
                类型代码与项目代号之间省略连接符（如 FTQCI-01）
              </label>
            </div>
          ) : (
            <div className={sectionClass}>
              <p className="text-sm font-semibold">🧰 已有种类编号 <span className="text-destructive">*</span></p>
              <label className={labelClass}>查找已有种类
                <input className={inputClass} value={search} onChange={event => setSearch(event.target.value)} placeholder="输入编号或种类名称搜索" />
              </label>
              <label className={labelClass}>种类编号
                <input className={inputClass} value={baseNumber} onChange={event => setBaseNumber(event.target.value.toUpperCase())} required placeholder="如 FT-QCI-01" />
              </label>
              <div className="max-h-32 overflow-y-auto rounded-xl border border-slate-200">
                {loadingKinds ? <p className="p-3 text-xs text-slate-500">加载中…</p> : kinds.length ? kinds.map(kind => (
                  <button key={kind.id} type="button" onClick={() => setBaseNumber(kind.base_number)} className="flex w-full justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left text-sm hover:bg-sky-50">
                    <span className="font-mono font-semibold text-slate-900">{kind.base_number}</span>
                    <span className="truncate text-slate-500">{kind.label ? `${kind.label} · ` : ''}已发至 {kind.max_quantity_serial ? String(kind.max_quantity_serial).padStart(2, '0') : '基础号'}</span>
                  </button>
                )) : <p className="p-3 text-xs text-slate-500">暂无匹配种类；也可直接输入系统内编号。</p>}
              </div>
            </div>
          )}

          <div className={sectionClass}>
            <div className="grid grid-cols-2 items-end gap-3">
              <label className={labelClass}>🔢 申请数量 <span className="text-destructive">*</span>
                <input type="number" min="1" max="999" step="1" className={inputClass} value={quantity} onChange={event => setQuantity(Number(event.target.value))} required />
              </label>
              <p className="pb-2 text-xs leading-5 text-slate-500">{mode === 'existing' ? '从历史最大数量流水号继续发放' : '新种类从 01 开始发放'}</p>
            </div>
            {mode === 'new' && quantity === 1 && (
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={includeQuantity} onChange={event => setIncludeQuantity(event.target.checked)} />
                生成数量流水号（如 FT-QCI-01-01）
              </label>
            )}
            {mode === 'new' && quantity > 1 && <p className="text-xs text-sky-700">申请多套时，每套都会生成独立的数量流水号。</p>}
          </div>

          <div className="space-y-2 p-4 rounded-2xl border border-slate-200 bg-white">
            <p className="text-sm font-semibold">🔒 人机验证 <span className="text-destructive">*</span></p>
            <CapVerification key={capKey} endpoint="/cap/" onSolve={setCapToken} onReset={() => setCapToken(null)} />
          </div>
          <button type="submit" disabled={submitting || !capToken} className="w-full h-14 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 text-lg font-bold text-white shadow-xl transition hover:from-sky-700 hover:to-cyan-700 disabled:opacity-60">{submitting ? '正在发号…' : `提交申请${quantity > 1 ? ` · ${quantity} 个` : ''}`}</button>
        </form>
      </CardContent>
    </Card>
  );
}

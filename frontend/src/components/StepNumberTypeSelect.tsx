import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { numberTypeAPI, settingsAPI } from '../services';

interface NumberTypeItem {
  id: number;
  type_code: string;
  type_name: string;
  description?: string;
  status: string;
  created_at: string;
}

interface StepNumberTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepNumberTypeSelect({
  value,
  onChange,
  onNext,
  onBack
}: StepNumberTypeSelectProps) {
  const [numberTypes, setNumberTypes] = useState<NumberTypeItem[]>([]);
  const [showNumberTypeRequest, setShowNumberTypeRequest] = useState(false);
  const [newNumberType, setNewNumberType] = useState({ type_code: '', type_name: '', description: '' });
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [featureToggles, setFeatureToggles] = useState({
    allow_request_number_type: false
  });

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [numberTypesRes, togglesRes] = await Promise.all([
          numberTypeAPI.getAll('approved,pending'),
          settingsAPI.getFeatureToggles(),
        ]);
        setNumberTypes((numberTypesRes as { data: NumberTypeItem[] }).data || []);
        const toggles = (togglesRes as { data: typeof featureToggles }).data;
        if (toggles) {
          setFeatureToggles(toggles);
        }
      } catch {
        setError('加载数据失败');
      }
    };
    loadData();
  }, []);

  const handleNumberTypeRequest = async () => {
    if (!newNumberType.type_code.trim()) {
      setError('请填写类型代码');
      return;
    }
    setRequestLoading(true);
    try {
      await numberTypeAPI.request({
        type_code: newNumberType.type_code,
        type_name: newNumberType.type_name,
        description: newNumberType.description,
        applicant_name: '匿名用户',
      });
      setNewNumberType({ type_code: '', type_name: '', description: '' });
      setShowNumberTypeRequest(false);
      setError(null);
      const res = await numberTypeAPI.getAll('approved,pending');
      setNumberTypes((res as { data: NumberTypeItem[] }).data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '申请失败');
    } finally {
      setRequestLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium leading-none">
            编号类型 *
          </label>
          {(featureToggles.allow_request_number_type || isAdmin) && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setShowNumberTypeRequest(!showNumberTypeRequest)}
            >
              {showNumberTypeRequest ? '取消申请' : '申请新编号类型'}
            </Button>
          )}
        </div>

        {showNumberTypeRequest ? (
          <div className="space-y-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <Input
              placeholder="类型代码 *"
              value={newNumberType.type_code}
              onChange={(e) => setNewNumberType(prev => ({ ...prev, type_code: e.target.value }))}
            />
            <Input
              placeholder="类型名称 (可选)"
              value={newNumberType.type_name}
              onChange={(e) => setNewNumberType(prev => ({ ...prev, type_name: e.target.value }))}
            />
            <Input
              placeholder="描述 (可选)"
              value={newNumberType.description}
              onChange={(e) => setNewNumberType(prev => ({ ...prev, description: e.target.value }))}
            />
            <Button
              type="button"
              size="sm"
              className="w-full"
              loading={requestLoading}
              onClick={handleNumberTypeRequest}
            >
              提交申请
            </Button>
          </div>
        ) : (
          <Select
            value={value}
            onValueChange={onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="请选择编号类型" />
            </SelectTrigger>
            <SelectContent>
              {numberTypes.map(nt => (
                <SelectItem key={nt.id} value={nt.type_code}>
                  {nt.type_code} - {nt.type_name} {nt.status === 'pending' ? '(待审核)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          上一步
        </Button>
        <Button type="button" onClick={onNext} disabled={!value}>
          下一步
        </Button>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { projectAPI, numberTypeAPI, applicationAPI, settingsAPI } from '../services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FilterableProjectSelector } from './FilterableProjectSelector';
import { CapVerification } from './CapVerification';
import { Copy, Check } from 'lucide-react';

interface ProjectItem {
  id: number;
  code: string;
  name: string;
  status: string;
  created_at: string;
}

interface NumberTypeItem {
  id: number;
  type_code: string;
  type_name: string;
  description?: string;
  status: string;
  created_at: string;
}

interface FeatureToggles {
  allow_request_project: boolean;
  allow_request_number_type: boolean;
}

interface ApplicationFormProps {
  onApplicationSubmitted?: () => void;
}

export function ApplicationForm({ onApplicationSubmitted }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    applicant_name: '',
    project_code: '',
    number_type: '',
  });

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [numberTypes, setNumberTypes] = useState<NumberTypeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showProjectRequest, setShowProjectRequest] = useState(false);
  const [showNumberTypeRequest, setShowNumberTypeRequest] = useState(false);
  const [newProject, setNewProject] = useState({ project_code: '', project_name: '' });
  const [newNumberType, setNewNumberType] = useState({ type_code: '', type_name: '', description: '' });
  const [requestLoading, setRequestLoading] = useState(false);

  // 功能开关状态
  const [featureToggles, setFeatureToggles] = useState<FeatureToggles>({
    allow_request_project: false,
    allow_request_number_type: false
  });
  
  // 检查是否是管理员
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // 冷却时间状态
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  
  // 冷却时间配置（从API获取）
  const [cooldownConfig, setCooldownConfig] = useState(10);

  // 复制状态
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  
  // 验证码组件的 key，用于强制重新渲染以重置状态
  const [captchaKey, setCaptchaKey] = useState(0);

  // 人机验证 token
  const [capToken, setCapToken] = useState<string | null>(null);
  
  // 处理验证码重置
  const handleCaptchaReset = useCallback(() => {
    setCapToken(null);
  }, []);

  // 加载功能开关状态
  const loadFeatureToggles = useCallback(async () => {
    try {
      // 每次都从API获取最新状态，确保刷新后立即生效
      const [togglesRes, cooldownRes] = await Promise.all([
        settingsAPI.getFeatureToggles(),
        settingsAPI.getCooldown(),
      ]);

      const toggles = (togglesRes as { data: FeatureToggles }).data;
      if (toggles) {
        setFeatureToggles(toggles);
      }

      const cooldown = (cooldownRes as { data: { cooldown_seconds: number } }).data?.cooldown_seconds;
      if (cooldown) {
        setCooldownConfig(cooldown);
      }
    } catch {
      console.error('加载功能开关失败');
    }
  }, []);

  // 加载项目和编号类型（包括 pending 状态）
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, numberTypesRes] = await Promise.all([
          projectAPI.getAll('approved,pending'),
          numberTypeAPI.getAll('approved,pending'),
        ]);
        setProjects((projectsRes as { data: ProjectItem[] }).data || []);
        setNumberTypes((numberTypesRes as { data: NumberTypeItem[] }).data || []);
      } catch {
        setError('加载数据失败');
      }
    };
    loadData();
    loadFeatureToggles();
  }, [loadFeatureToggles]);

  // 从 localStorage 加载缓存
  useEffect(() => {
    const cachedUser = localStorage.getItem('userInfo');
    if (cachedUser) {
      const userInfo = JSON.parse(cachedUser);
      setFormData(prev => ({
        ...prev,
        applicant_name: userInfo.name || '',
      }));
    }
  }, []);

  const handleProjectRequest = async () => {
    if (!newProject.project_code || !newProject.project_name) {
      setError('请填写完整信息');
      return;
    }
    setRequestLoading(true);
    try {
      await projectAPI.request({
        project_code: newProject.project_code,
        project_name: newProject.project_name,
        applicant_name: formData.applicant_name || '匿名用户',
      });
      setNewProject({ project_code: '', project_name: '' });
      setShowProjectRequest(false);
      setError(null);
      // 刷新项目列表（包括 pending）
      const res = await projectAPI.getAll('approved,pending');
      setProjects((res as { data: ProjectItem[] }).data || []);
    } catch (err: Error) {
      setError(err.message || '申请失败');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleNumberTypeRequest = async () => {
    if (!newNumberType.type_code || !newNumberType.type_name) {
      setError('请填写完整信息');
      return;
    }
    setRequestLoading(true);
    try {
      await numberTypeAPI.request({
        type_code: newNumberType.type_code,
        type_name: newNumberType.type_name,
        description: newNumberType.description,
        applicant_name: formData.applicant_name || '匿名用户',
      });
      setNewNumberType({ type_code: '', type_name: '', description: '' });
      setShowNumberTypeRequest(false);
      setError(null);
      // 刷新编号类型列表（包括 pending）
      const res = await numberTypeAPI.getAll('approved,pending');
      setNumberTypes((res as { data: NumberTypeItem[] }).data || []);
    } catch (err: Error) {
      setError(err.message || '申请失败');
    } finally {
      setRequestLoading(false);
    }
  };

  // 复制编号到剪贴板
  const copyToClipboard = useCallback(async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedNumber(number);
      setTimeout(() => setCopiedNumber(null), 2000);
    } catch {
      // 降级方案
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

  // 倒计时逻辑
  const startCooldown = useCallback((seconds?: number) => {
    const cooldownTime = seconds || cooldownConfig;
    setIsCoolingDown(true);
    setCooldownSeconds(cooldownTime);
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCoolingDown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.applicant_name || !formData.project_code || !formData.number_type) {
      setError('请填写所有必填字段');
      return;
    }

    if (!capToken) {
      setError('请完成人机验证');
      return;
    }

    // 倒计时检查
    if (isCoolingDown) {
      setError(`请等待 ${cooldownSeconds} 秒后可再次取号`);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 保存到 localStorage
      localStorage.setItem('userInfo', JSON.stringify({
        name: formData.applicant_name,
      }));

      const response = await applicationAPI.create({ ...formData, capToken } as { applicant_name: string; project_code: string; number_type: string; capToken: string });
      const fullNumber = (response as { data: { full_number: string } }).data?.full_number || '申请成功';
      setResult(fullNumber);

      // 通知父组件刷新列表
      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }

      // 启动倒计时
      startCooldown();

      // 清空表单和验证token
      setFormData(prev => ({
        ...prev,
        project_code: '',
        number_type: '',
      }));
      setCapToken(null);
      setCaptchaKey(prev => prev + 1); // 强制重置验证码组件
    } catch (err: Error & { response?: { status: number; data?: { retryAfter?: number } } }) {
      if (err.response?.status === 429) {
        const retryAfter = err.response?.data?.retryAfter || cooldownConfig;
        setError(`请求过于频繁，请等待 ${retryAfter} 秒后再次取号`);
        startCooldown(retryAfter);
      } else {
        setError(err.message || '提交申请失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>编号申请</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        {result && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-md mb-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-sm font-medium">✓ 生成的编号:</span>
                <span className="ml-2 font-bold text-lg">{result}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 shrink-0"
                onClick={() => copyToClipboard(result)}
                title="点击复制"
              >
                {copiedNumber === result ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {copiedNumber === result && (
              <div className="text-xs text-green-600 mt-1">已复制到剪贴板</div>
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              申请人姓名 *
            </label>
            <Input
              value={formData.applicant_name}
              onChange={(e) => setFormData(prev => ({ ...prev, applicant_name: e.target.value }))}
              placeholder="请输入申请人姓名"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium leading-none">
                项目代号 *
              </label>
              {(featureToggles.allow_request_project || isAdmin) && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => setShowProjectRequest(!showProjectRequest)}
                >
                  {showProjectRequest ? '取消申请' : '申请新项目'}
                </Button>
              )}
            </div>
            {showProjectRequest ? (
              <div className="space-y-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                <Input
                  placeholder="项目代号"
                  value={newProject.project_code}
                  onChange={(e) => setNewProject(prev => ({ ...prev, project_code: e.target.value }))}
                />
                <Input
                  placeholder="项目名称"
                  value={newProject.project_name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, project_name: e.target.value }))}
                />
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  loading={requestLoading}
                  onClick={() => handleProjectRequest()}
                >
                  提交申请
                </Button>
              </div>
            ) : (
              <FilterableProjectSelector
                projects={projects}
                value={formData.project_code}
                onChange={(code) => setFormData(prev => ({ ...prev, project_code: code }))}
                placeholder="请选择项目"
              />
            )}
          </div>

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
                  placeholder="类型代码"
                  value={newNumberType.type_code}
                  onChange={(e) => setNewNumberType(prev => ({ ...prev, type_code: e.target.value }))}
                />
                <Input
                  placeholder="类型名称"
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
                  onClick={() => handleNumberTypeRequest()}
                >
                  提交申请
                </Button>
              </div>
            ) : (
              <Select
                value={formData.number_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, number_type: value }))}
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

          {/* 人机验证 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">人机验证 *</label>
            <CapVerification
              key={captchaKey}
              endpoint="/cap/"
              onSolve={(token) => {
                setCapToken(token);
                setError(null);
              }}
              onReset={handleCaptchaReset}
              onError={(msg) => {
                setCapToken(null);
                setError(msg);
              }}
            />
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full" disabled={isCoolingDown || loading || !capToken}>
            {isCoolingDown ? `请等待 ${cooldownSeconds}s 后可再次取号` : '提交申请'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

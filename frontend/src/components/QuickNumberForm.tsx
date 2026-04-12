import React, { useState, useEffect, useCallback } from 'react';
import { projectAPI, numberTypeAPI, applicationAPI, settingsAPI } from '../services';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FilterableProjectSelector } from './FilterableProjectSelector';
import { CapVerification } from './CapVerification';
import { Card, CardContent } from './ui/card';

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

interface QuickNumberFormProps {
  applicantName: string;
  onApplicationSubmitted: (result: string) => void;
  onError: (error: string) => void;
}

export function QuickNumberForm({
  applicantName,
  onApplicationSubmitted,
  onError
}: QuickNumberFormProps) {
  const [formData, setFormData] = useState({
    project_code: '',
    number_type: '',
  });

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [numberTypes, setNumberTypes] = useState<NumberTypeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showProjectRequest, setShowProjectRequest] = useState(false);
  const [showNumberTypeRequest, setShowNumberTypeRequest] = useState(false);
  const [newProject, setNewProject] = useState({ project_code: '', project_name: '' });
  const [newNumberType, setNewNumberType] = useState({ type_code: '', type_name: '', description: '' });
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [featureToggles, setFeatureToggles] = useState({
    allow_request_project: false,
    allow_request_number_type: false
  });

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownConfig, setCooldownConfig] = useState(10);

  const [capToken, setCapToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleCaptchaReset = useCallback(() => {
    setCapToken(null);
  }, []);

  const loadFeatureToggles = useCallback(async () => {
    try {
      const [togglesRes, cooldownRes] = await Promise.all([
        settingsAPI.getFeatureToggles(),
        settingsAPI.getCooldown(),
      ]);
      const toggles = (togglesRes as { data: typeof featureToggles }).data;
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

  const handleProjectRequest = async () => {
    if (!newProject.project_code.trim()) {
      setError('请填写项目代号');
      return;
    }
    setRequestLoading(true);
    try {
      await projectAPI.request({
        project_code: newProject.project_code,
        project_name: newProject.project_name,
        applicant_name: applicantName || '匿名用户',
      });
      setNewProject({ project_code: '', project_name: '' });
      setShowProjectRequest(false);
      setError(null);
      const res = await projectAPI.getAll('approved,pending');
      setProjects((res as { data: ProjectItem[] }).data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '申请失败');
    } finally {
      setRequestLoading(false);
    }
  };

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
        applicant_name: applicantName || '匿名用户',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.project_code || !formData.number_type) {
      setError('请填写所有必填字段');
      return;
    }

    if (!capToken) {
      setError('请完成人机验证');
      return;
    }

    if (isCoolingDown) {
      setError(`请等待 ${cooldownSeconds} 秒后可再次取号`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await applicationAPI.create({
        applicant_name: applicantName,
        project_code: formData.project_code,
        number_type: formData.number_type,
      } as any);
      const fullNumber = (response as { data: { full_number: string } }).data?.full_number || '申请成功';
      onApplicationSubmitted(fullNumber);

      startCooldown();

      setFormData({ project_code: '', number_type: '' });
      setCapToken(null);
      setCaptchaKey(prev => prev + 1);
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data?: { retryAfter?: number } }; message?: string };
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || cooldownConfig;
        setError(`请求过于频繁，请等待 ${retryAfter} 秒后再次取号`);
        startCooldown(retryAfter);
      } else {
        setError(error.message || '提交申请失败');
      }
      onError(error.message || '提交申请失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="pt-6">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="项目代号 *"
                  value={newProject.project_code}
                  onChange={(e) => setNewProject(prev => ({ ...prev, project_code: e.target.value }))}
                />
                <Input
                  placeholder="项目名称 (可选)"
                  value={newProject.project_name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, project_name: e.target.value }))}
                />
                <Button
                  type="button"
                  size="sm"
                  className="w-full"
                  loading={requestLoading}
                  onClick={handleProjectRequest}
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

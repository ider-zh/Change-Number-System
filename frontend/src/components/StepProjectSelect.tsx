import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FilterableProjectSelector } from './FilterableProjectSelector';
import { projectAPI, settingsAPI } from '../services';

interface ProjectItem {
  id: number;
  code: string;
  name: string;
  status: string;
  created_at: string;
}

interface StepProjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack?: () => void;
  isFirstStep: boolean;
}

export function StepProjectSelect({
  value,
  onChange,
  onNext,
  onBack,
  isFirstStep
}: StepProjectSelectProps) {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [showProjectRequest, setShowProjectRequest] = useState(false);
  const [newProject, setNewProject] = useState({ project_code: '', project_name: '' });
  const [requestLoading, setRequestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [featureToggles, setFeatureToggles] = useState({
    allow_request_project: false,
    allow_request_number_type: false
  });

  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsRes, togglesRes] = await Promise.all([
          projectAPI.getAll('approved,pending'),
          settingsAPI.getFeatureToggles(),
        ]);
        setProjects((projectsRes as { data: ProjectItem[] }).data || []);
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
        applicant_name: '匿名用户',
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
            value={value}
            onChange={onChange}
            placeholder="请选择项目"
          />
        )}
      </div>

      <div className="flex justify-between pt-4">
        {!isFirstStep && onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            上一步
          </Button>
        )}
        <div className={isFirstStep ? 'ml-auto' : ''}>
          <Button type="button" onClick={onNext} disabled={!value}>
            下一步
          </Button>
        </div>
      </div>
    </div>
  );
}

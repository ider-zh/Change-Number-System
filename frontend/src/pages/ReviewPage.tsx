import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI, numberTypeAPI } from '../services';
import type { Project, NumberType } from '../services';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

export function ReviewPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'numberTypes'>('projects');
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [pendingNumberTypes, setPendingNumberTypes] = useState<NumberType[]>([]);
  const [reviewNotes, setReviewNotes] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [projectsRes, numberTypesRes] = await Promise.all([
        projectAPI.getPending(),
        numberTypeAPI.getPending(),
      ]);
      setPendingProjects((projectsRes as { data: Project[] }).data || []);
      setPendingNumberTypes((numberTypesRes as { data: NumberType[] }).data || []);
    } catch (err) {
      console.error('加载数据失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: number, type: 'project' | 'numberType', status: 'approved' | 'rejected') => {
    setProcessing(id);
    try {
      const api = type === 'project' ? projectAPI : numberTypeAPI;
      await api.review(id, {
        status,
        reviewer_note: reviewNotes[id] || '',
      });
      setReviewNotes(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      loadData();
    } catch (err) {
      console.error('审核失败', err);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">审核管理</h2>
        {/* Tab 切换 */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'projects' ? 'default' : 'outline'}
            onClick={() => setActiveTab('projects')}
          >
            项目代号审核
            {pendingProjects.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingProjects.length}</Badge>
            )}
          </Button>
          <Button
            variant={activeTab === 'numberTypes' ? 'default' : 'outline'}
            onClick={() => setActiveTab('numberTypes')}
          >
            编号类型审核
            {pendingNumberTypes.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingNumberTypes.length}</Badge>
            )}
          </Button>
        </div>

        {/* 项目代号审核列表 */}
        {activeTab === 'projects' && (
          <Card>
            <CardHeader>
              <CardTitle>待审核项目代号申请</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingProjects.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">暂无待审核的项目申请</div>
              ) : (
                <div className="space-y-4">
                  {pendingProjects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">项目代号: <Badge>{project.project_code}</Badge></div>
                          <div className="text-sm text-muted-foreground mt-1">项目名称: {project.project_name}</div>
                          <div className="text-sm text-muted-foreground">申请人: {project.user_id}</div>
                          <div className="text-sm text-muted-foreground">申请时间: {new Date(project.created_at).toLocaleString('zh-CN')}</div>
                        </div>
                        <Badge variant="default">待审核</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          placeholder="审核备注 (可选)"
                          value={reviewNotes[project.id] || ''}
                          onChange={(e) => setReviewNotes(prev => ({ ...prev, [project.id]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleReview(project.id, 'project', 'approved')}
                            loading={processing === project.id}
                          >
                            ✓ 通过
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReview(project.id, 'project', 'rejected')}
                            loading={processing === project.id}
                          >
                            ✗ 拒绝
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 编号类型审核列表 */}
        {activeTab === 'numberTypes' && (
          <Card>
            <CardHeader>
              <CardTitle>待审核编号类型申请</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingNumberTypes.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">暂无待审核的编号类型申请</div>
              ) : (
                <div className="space-y-4">
                  {pendingNumberTypes.map((nt) => (
                    <div key={nt.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">类型代码: <Badge>{nt.type_code}</Badge></div>
                          <div className="text-sm text-muted-foreground mt-1">类型名称: {nt.type_name}</div>
                          {nt.description && <div className="text-sm text-muted-foreground">描述: {nt.description}</div>}
                          <div className="text-sm text-muted-foreground">申请人: {nt.user_id}</div>
                          <div className="text-sm text-muted-foreground">申请时间: {new Date(nt.created_at).toLocaleString('zh-CN')}</div>
                        </div>
                        <Badge variant="default">待审核</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <Input
                          placeholder="审核备注 (可选)"
                          value={reviewNotes[nt.id] || ''}
                          onChange={(e) => setReviewNotes(prev => ({ ...prev, [nt.id]: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleReview(nt.id, 'numberType', 'approved')}
                            loading={processing === nt.id}
                          >
                            ✓ 通过
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReview(nt.id, 'numberType', 'rejected')}
                            loading={processing === nt.id}
                          >
                            ✗ 拒绝
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}

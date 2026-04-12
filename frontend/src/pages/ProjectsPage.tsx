import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../services';
import type { Project } from '../services';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ code: '', name: '' });
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login');
      return;
    }
    loadProjects();
  }, [navigate]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await projectAPI.getAll();
      setProjects((res as { data: Project[] }).data || []);
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProject.code.trim()) return;
    setProcessing(0);
    try {
      await projectAPI.create(newProject);
      setNewProject({ code: '', name: '' });
      setShowCreateForm(false);
      loadProjects();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : '创建失败');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此项目吗?')) return;
    setProcessing(id);
    try {
      await projectAPI.delete(id);
      loadProjects();
    } catch (err) {
      console.error('删除失败', err);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive',
    };
    const labels: Record<string, string> = {
      approved: '已通过',
      pending: '待审核',
      rejected: '已拒绝',
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">项目代号管理</h1>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            返回仪表盘
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>项目列表</CardTitle>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? '取消' : '新建项目'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showCreateForm && (
              <div className="border rounded-lg p-4 mb-4 space-y-3 bg-blue-50">
                <div className="flex gap-3">
                  <Input
                    placeholder="项目代号 *"
                    value={newProject.code}
                    onChange={(e) => setNewProject(prev => ({ ...prev, code: e.target.value }))}
                    required
                    className="flex-1"
                  />
                  <Button onClick={handleCreate} loading={processing === 0}>
                    创建
                  </Button>
                </div>
              </div>
            )}

            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="h-12 px-4 text-left font-medium">代号</th>
                    <th className="h-12 px-4 text-left font-medium">状态</th>
                    <th className="h-12 px-4 text-left font-medium">创建时间</th>
                    <th className="h-12 px-4 text-left font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(project => (
                    <tr key={project.id} className="border-b hover:bg-muted/50">
                      <td className="p-4"><Badge>{project.code}</Badge></td>
                      <td className="p-4">{getStatusBadge(project.status)}</td>
                      <td className="p-4 text-muted-foreground">{new Date(project.created_at).toLocaleString('zh-CN')}</td>
                      <td className="p-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                          loading={processing === project.id}
                        >
                          删除
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

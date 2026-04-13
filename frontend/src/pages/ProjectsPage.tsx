import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectAPI } from '../services';
import type { Project } from '../services';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { formatBeijingTime } from '@/utils/timezone';

export function ProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({ code: '', name: '' });
  const [processing, setProcessing] = useState<number | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ code: '', name: '' });
  const [editError, setEditError] = useState('');

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

  const handleEditClick = (project: Project) => {
    setEditProject(project);
    setEditForm({ code: project.code, name: project.name || '' });
    setEditError('');
  };

  const handleEditSave = async () => {
    if (!editProject || !editForm.code.trim()) return;
    setProcessing(editProject.id);
    setEditError('');
    try {
      await projectAPI.update(editProject.id, { code: editForm.code, name: editForm.name });
      setEditProject(null);
      loadProjects();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setProcessing(null);
    }
  };

  const handleEditCancel = () => {
    setEditProject(null);
    setEditForm({ code: '', name: '' });
    setEditError('');
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
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">项目代号管理</h2>
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
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="项目代号 *"
                    value={newProject.code}
                    onChange={(e) => setNewProject(prev => ({ ...prev, code: e.target.value }))}
                    required
                  />
                  <Input
                    placeholder="项目名称 (可选)"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreate} loading={processing === 0}>
                  创建
                </Button>
              </div>
            )}

            {editProject && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                  <h2 className="text-xl font-semibold mb-4">编辑项目</h2>
                  <div className="space-y-3">
                    <Input
                      placeholder="项目代号 *"
                      value={editForm.code}
                      onChange={(e) => setEditForm(prev => ({ ...prev, code: e.target.value }))}
                      required
                    />
                    <Input
                      placeholder="项目名称"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                    {editError && <div className="text-red-600 text-sm">{editError}</div>}
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <Button variant="outline" onClick={handleEditCancel}>
                      取消
                    </Button>
                    <Button onClick={handleEditSave} loading={processing === editProject.id}>
                      保存
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-md border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="h-12 px-4 text-left font-medium whitespace-nowrap">代号</th>
                    <th className="h-12 px-4 text-left font-medium whitespace-nowrap">名称</th>
                    <th className="h-12 px-4 text-left font-medium whitespace-nowrap">状态</th>
                    <th className="h-12 px-4 text-left font-medium whitespace-nowrap">创建时间</th>
                    <th className="h-12 px-4 text-left font-medium whitespace-nowrap">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map(project => (
                    <tr key={project.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 whitespace-nowrap"><Badge>{project.code}</Badge></td>
                      <td className="p-4 whitespace-nowrap">{project.name || '-'}</td>
                      <td className="p-4 whitespace-nowrap">{getStatusBadge(project.status)}</td>
                      <td className="p-4 text-muted-foreground whitespace-nowrap">{formatBeijingTime(project.created_at)}</td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(project)}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(project.id)}
                            loading={processing === project.id}
                          >
                            删除
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

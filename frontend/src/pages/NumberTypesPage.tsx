import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { numberTypeAPI } from '../services';
import type { NumberType } from '../services';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';

export function NumberTypesPage() {
  const navigate = useNavigate();
  const [numberTypes, setNumberTypes] = useState<NumberType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newType, setNewType] = useState({ type_code: '', type_name: '', description: '' });
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login');
      return;
    }
    loadNumberTypes();
  }, [navigate]);

  const loadNumberTypes = async () => {
    setLoading(true);
    try {
      const res = await numberTypeAPI.getAll();
      setNumberTypes((res as { data: NumberType[] }).data || []);
    } catch (err) {
      console.error('加载失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newType.type_code || !newType.type_name) return;
    setProcessing(0);
    try {
      await numberTypeAPI.create(newType);
      setNewType({ type_code: '', type_name: '', description: '' });
      setShowCreateForm(false);
      loadNumberTypes();
    } catch (err: Error) {
      alert(err.message || '创建失败');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此编号类型吗?')) return;
    setProcessing(id);
    try {
      await numberTypeAPI.delete(id);
      loadNumberTypes();
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
          <h1 className="text-2xl font-bold text-gray-800">编号类型管理</h1>
          <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
            返回仪表盘
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>编号类型列表</CardTitle>
              <Button onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? '取消' : '新建编号类型'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showCreateForm && (
              <div className="border rounded-lg p-4 mb-4 space-y-3 bg-blue-50">
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    placeholder="类型代码"
                    value={newType.type_code}
                    onChange={(e) => setNewType(prev => ({ ...prev, type_code: e.target.value }))}
                  />
                  <Input
                    placeholder="类型名称"
                    value={newType.type_name}
                    onChange={(e) => setNewType(prev => ({ ...prev, type_name: e.target.value }))}
                  />
                  <Input
                    placeholder="描述"
                    value={newType.description}
                    onChange={(e) => setNewType(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreate} loading={processing === 0}>
                  创建
                </Button>
              </div>
            )}

            <div className="rounded-md border">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="h-12 px-4 text-left font-medium">代码</th>
                    <th className="h-12 px-4 text-left font-medium">名称</th>
                    <th className="h-12 px-4 text-left font-medium">描述</th>
                    <th className="h-12 px-4 text-left font-medium">状态</th>
                    <th className="h-12 px-4 text-left font-medium">创建时间</th>
                    <th className="h-12 px-4 text-left font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {numberTypes.map(nt => (
                    <tr key={nt.id} className="border-b hover:bg-muted/50">
                      <td className="p-4"><Badge>{nt.type_code}</Badge></td>
                      <td className="p-4">{nt.type_name}</td>
                      <td className="p-4 text-muted-foreground">{nt.description || '-'}</td>
                      <td className="p-4">{getStatusBadge(nt.status)}</td>
                      <td className="p-4 text-muted-foreground">{new Date(nt.created_at).toLocaleString('zh-CN')}</td>
                      <td className="p-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(nt.id)}
                          loading={processing === nt.id}
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

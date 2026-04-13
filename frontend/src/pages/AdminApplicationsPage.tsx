import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationAPI, adminAPI } from '../services';
import type { Application } from '../services';
import { Layout } from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { formatBeijingTime } from '@/utils/timezone';
import { Trash2 } from 'lucide-react';

export function AdminApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filters, setFilters] = useState({ keyword: '', applicant_name: '', ip_address: '' });
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate, pagination.page, filters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await applicationAPI.getAll({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      const data = (res as { data: { data: Application[]; pagination: typeof pagination } }).data;
      setApplications(data?.data || []);
      setPagination(data?.pagination || pagination);
    } catch (err) {
      console.error('加载数据失败', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  const handleDelete = async (id: number, applicantName: string) => {
    if (!confirm(`确定要删除 "${applicantName}" 的申请记录吗？此操作不可撤销。`)) {
      return;
    }

    setDeletingId(id);
    try {
      await adminAPI.deleteApplication(id);
      loadData();
    } catch (err) {
      console.error('删除失败', err);
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({ ...prev, page: 1 }));
    setFilters(prev => ({ ...prev, keyword: e.target.value }));
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">加载中...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">申请记录管理</h2>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>所有申请记录</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-6">
              <Input
                type="text"
                placeholder="搜索申请人/项目/编号..."
                value={filters.keyword}
                onChange={handleSearch}
                className="flex-1"
              />
            </div>

            {applications.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">暂无申请记录</div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-md border mb-6">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="h-12 px-4 text-left font-medium whitespace-nowrap">完整编号</th>
                        <th className="h-12 px-4 text-left font-medium whitespace-nowrap">申请人</th>
                        <th className="h-12 px-4 text-left font-medium whitespace-nowrap">项目代号</th>
                        <th className="h-12 px-4 text-left font-medium whitespace-nowrap">编号类型</th>
                        <th className="h-12 px-4 text-left font-medium whitespace-nowrap">申请时间</th>
                        <th className="h-12 px-4 text-left font-medium whitespace-nowrap">IP 地址</th>
                        <th className="h-12 px-4 text-left font-medium whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map(app => (
                        <tr key={app.id} className="border-b hover:bg-muted/50">
                          <td className="p-4 whitespace-nowrap">
                            <Badge variant="default">{app.full_number}</Badge>
                          </td>
                          <td className="p-4 whitespace-nowrap">{app.applicant_name}</td>
                          <td className="p-4 whitespace-nowrap">{app.project_code}</td>
                          <td className="p-4 whitespace-nowrap">
                            <Badge variant="secondary">{app.number_type}</Badge>
                          </td>
                          <td className="p-4 text-muted-foreground whitespace-nowrap">
                            {formatBeijingTime(app.created_at)}
                          </td>
                          <td className="p-4 text-muted-foreground whitespace-nowrap">{app.ip_address || '-'}</td>
                          <td className="p-4 whitespace-nowrap">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(app.id, app.applicant_name)}
                              loading={deletingId === app.id}
                              className="gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              删除
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-center items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                  >
                    上一页
                  </Button>
                  <span className="text-muted-foreground">
                    {pagination.page} / {pagination.totalPages || 1} (共 {pagination.total} 条)
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                  >
                    下一页
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

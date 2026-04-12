import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { applicationAPI, projectAPI, numberTypeAPI } from '../services';
import type { Project, NumberType } from '../services';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { settingsAPI } from '../services';

interface StatsData {
  total: number;
  byType?: Array<{ number_type: string; count: number }>;
}

interface FeatureToggles {
  allow_request_project: boolean;
  allow_request_number_type: boolean;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [pendingProjects, setPendingProjects] = useState(0);
  const [pendingNumberTypes, setPendingNumberTypes] = useState(0);
  const [loading, setLoading] = useState(true);

  // 功能开关状态
  const [featureToggles, setFeatureToggles] = useState<FeatureToggles>({
    allow_request_project: false,
    allow_request_number_type: false
  });
  const [updatingToggle, setUpdatingToggle] = useState<string | null>(null);
  
  // 冷却时间状态
  const [cooldownSeconds, setCooldownSeconds] = useState(10);
  const [updatingCooldown, setUpdatingCooldown] = useState(false);
  
  // 通知状态
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }

    const loadData = async () => {
      try {
        const [statsRes, projectsRes, numberTypesRes, togglesRes, cooldownRes] = await Promise.all([
          applicationAPI.getStats(),
          projectAPI.getAll('pending'),
          numberTypeAPI.getAll('pending'),
          settingsAPI.getFeatureToggles(),
          settingsAPI.getCooldown(),
        ]);
        setStats((statsRes as { data: StatsData }).data || null);
        setPendingProjects(((projectsRes as { data: Project[] }).data || []).length);
        setPendingNumberTypes(((numberTypesRes as { data: NumberType[] }).data || []).length);
        const togglesData = (togglesRes as { data: FeatureToggles }).data;
        if (togglesData) {
          setFeatureToggles(togglesData);
        }
        setCooldownSeconds((cooldownRes as { data: { cooldown_seconds: number } }).data?.cooldown_seconds || 10);
      } catch (err) {
        console.error('加载数据失败', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  // 处理功能开关变更
  const handleToggleChange = async (key: string, value: boolean) => {
    if (updatingToggle) return; // 防止并发更新

    try {
      setUpdatingToggle(key);
      const response = await settingsAPI.updateFeatureToggles({
        [key]: value
      });

      if ((response as { success: boolean }).success) {
        setFeatureToggles((response as { data: FeatureToggles }).data);
        setNotification({ message: '功能开关已更新', type: 'success' });
      } else {
        setNotification({ message: '更新失败，请重试', type: 'error' });
      }
    } catch (error: Error) {
      console.error(`更新开关 ${key} 失败:`, error);
      setNotification({ message: error.message || '更新失败，请重试', type: 'error' });
    } finally {
      setUpdatingToggle(null);
    }
  };

  // 处理冷却时间变更
  const handleCooldownChange = async (value: number) => {
    if (updatingCooldown || value < 5 || value > 60) return;

    try {
      setUpdatingCooldown(true);
      const response = await settingsAPI.updateCooldown({
        cooldown_seconds: value
      });

      if ((response as { success: boolean }).success) {
        setCooldownSeconds((response as { data: { cooldown_seconds: number } }).data.cooldown_seconds);
        setNotification({ message: '冷却时间已更新', type: 'success' });
      } else {
        setNotification({ message: '更新失败，请重试', type: 'error' });
      }
    } catch (error: Error) {
      console.error('更新冷却时间失败:', error);
      setNotification({ message: error.message || '更新失败，请重试', type: 'error' });
    } finally {
      setUpdatingCooldown(false);
    }
  };

  // 3秒后自动清除通知
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 通知组件 */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {notification.type === 'success' ? '✓ ' : '✗ '}
                {notification.message}
              </span>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                ← 返回主页
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">管理员仪表盘</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            登出
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">总申请数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">待审核项目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{pendingProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">待审核编号类型</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{pendingNumberTypes}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">编号类型</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.byType?.length || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* 快捷操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快捷操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/admin/review">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl">📋</span>
                  <span>审核申请</span>
                  {(pendingProjects + pendingNumberTypes) > 0 && (
                    <Badge variant="destructive">{pendingProjects + pendingNumberTypes} 待审核</Badge>
                  )}
                </Button>
              </Link>
              <Link to="/admin/projects">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl">📁</span>
                  <span>项目管理</span>
                </Button>
              </Link>
              <Link to="/admin/number-types">
                <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl">🏷️</span>
                  <span>编号类型管理</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 按类型统计 */}
        {stats?.byType && (
          <Card>
            <CardHeader>
              <CardTitle>按编号类型统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.byType.map((item: { number_type: string; count: number }) => (
                  <div key={item.number_type} className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-sm text-muted-foreground mb-1">{item.number_type}</div>
                    <div className="text-2xl font-bold text-blue-600">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 功能开关控制 */}
        <Card>
          <CardHeader>
            <CardTitle>功能开关控制</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">用户申请新项目代号</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    关闭后，普通用户将无法看到和访问"申请新项目代号"的入口
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featureToggles.allow_request_project}
                    onChange={(e) => handleToggleChange('allow_request_project', e.target.checked)}
                    disabled={updatingToggle === 'allow_request_project'}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">用户申请新编号类型</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    关闭后，普通用户将无法看到和访问"申请新编号类型"的入口
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featureToggles.allow_request_number_type}
                    onChange={(e) => handleToggleChange('allow_request_number_type', e.target.checked)}
                    disabled={updatingToggle === 'allow_request_number_type'}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                提示：默认情况下这两个功能处于关闭状态。管理员可以根据需要开启或关闭。
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 冷却时间控制 */}
        <Card>
          <CardHeader>
            <CardTitle>取号冷却时间控制</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">重新取号等待时间</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    用户提交一次申请后，需要等待的秒数才能再次取号
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={cooldownSeconds}
                    onChange={(e) => setCooldownSeconds(parseInt(e.target.value) || 10)}
                    onBlur={(e) => {
                      const value = parseInt(e.target.value) || 10;
                      if (value >= 5 && value <= 60) {
                        handleCooldownChange(value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = parseInt((e.target as HTMLInputElement).value) || 10;
                        if (value >= 5 && value <= 60) {
                          handleCooldownChange(value);
                        }
                      }
                    }}
                    disabled={updatingCooldown}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-muted-foreground">秒</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                提示：设置范围为 5-60 秒，默认值为 10 秒。
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

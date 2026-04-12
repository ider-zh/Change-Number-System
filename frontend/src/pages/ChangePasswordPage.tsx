import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('新密码长度至少 6 位');
      return;
    }

    const hasUpperCase = /[A-Z]/.test(formData.newPassword);
    const hasLowerCase = /[a-z]/.test(formData.newPassword);
    const hasNumbers = /\d/.test(formData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('新密码必须包含大小写字母和数字');
      return;
    }

    setLoading(true);
    try {
      await adminAPI.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '修改密码失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/dashboard')}>
              ← 返回仪表盘
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">修改管理员密码</h1>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>密码修改</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
                ✓ 密码修改成功
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">当前密码 *</label>
                <Input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                  placeholder="请输入当前密码"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">新密码 *</label>
                <Input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="请输入新密码（至少 6 位，包含大小写字母和数字）"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">确认新密码 *</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="请再次输入新密码"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" loading={loading} size="lg" className="flex-1">
                  修改密码
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">密码要求：</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 长度至少 6 位</li>
            <li>• 必须包含大写字母（A-Z）</li>
            <li>• 必须包含小写字母（a-z）</li>
            <li>• 必须包含数字（0-9）</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

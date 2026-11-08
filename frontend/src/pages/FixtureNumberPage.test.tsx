import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FixtureNumberPage } from './FixtureNumberPage';
import { fixtureAPI } from '../services';

vi.mock('../components/Layout', () => ({ Layout: ({ children }: { children: ReactNode }) => <div>{children}</div> }));
vi.mock('../components/FixtureNumberForm', () => ({ FixtureNumberForm: () => <div>申请表单</div> }));
vi.mock('../services', () => ({ fixtureAPI: { getRequests: vi.fn(), getStats: vi.fn(), exportCSV: vi.fn() } }));

describe('工装治具申请记录导出', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(fixtureAPI.getRequests).mockResolvedValue({ data: {
      data: [], pagination: { page: 1, limit: 8, total: 0, totalPages: 1 },
    } });
    vi.mocked(fixtureAPI.getStats).mockResolvedValue({ data: [] });
    vi.mocked(fixtureAPI.exportCSV).mockResolvedValue(undefined);
  });

  it('管理员登录后可以导出记录', async () => {
    localStorage.setItem('isAdmin', 'true');
    render(<FixtureNumberPage />);
    const button = await screen.findByRole('button', { name: '导出记录' });
    fireEvent.click(button);
    await waitFor(() => expect(fixtureAPI.exportCSV).toHaveBeenCalledOnce());
  });

  it('未登录管理员时不显示导出入口', async () => {
    render(<FixtureNumberPage />);
    await screen.findByText('暂无记录');
    expect(screen.queryByRole('button', { name: '导出记录' })).not.toBeInTheDocument();
  });
});

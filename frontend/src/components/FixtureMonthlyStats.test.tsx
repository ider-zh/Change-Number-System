import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FixtureMonthlyStats } from './FixtureMonthlyStats';
import { fixtureAPI } from '../services';

vi.mock('../services', () => ({ fixtureAPI: { getRequests: vi.fn() } }));

describe('工装治具月度统计', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fixtureAPI.getRequests).mockResolvedValue({ data: {
      data: [{ id: 1, applicant_name: '张三', quantity: 3, created_at: '2026-11-01 10:00:00', type_code: 'FT', project_code: 'QCI', base_number: 'FT-QCI-01', label: '定位治具', numbers: ['FT-QCI-01-01', 'FT-QCI-01-02', 'FT-QCI-01-03'] }],
      pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
    } });
  });

  it('按申请次数统计，多套编号在明细中完整展示', async () => {
    render(<FixtureMonthlyStats months={['2026-10', '2026-11']} stats={[{ month: '2026-11', type_code: 'FT', applications: 1, numbers: 3 }]} />);
    fireEvent.click(screen.getByTitle('点击查看 2026-11 月工装申请明细'));
    await waitFor(() => expect(fixtureAPI.getRequests).toHaveBeenCalledWith({ month: '2026-11', type_code: undefined, page: 1, limit: 10 }));
    expect(await screen.findByText('FT-QCI-01-03')).toBeInTheDocument();
    expect(screen.getByText('共计 1 条申请记录')).toBeInTheDocument();
  });
});

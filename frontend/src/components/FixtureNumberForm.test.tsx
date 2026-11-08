import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FixtureNumberForm } from './FixtureNumberForm';
import { fixtureAPI } from '../services';

vi.mock('../services', () => ({
  fixtureAPI: { getKinds: vi.fn(), issue: vi.fn() },
}));

vi.mock('./CapVerification', () => ({
  CapVerification: ({ onSolve }: { onSolve: (token: string) => void }) =>
    <button type="button" onClick={() => onSolve('test-token')}>完成验证</button>,
}));

describe('工装治具取号表单', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(fixtureAPI.getKinds).mockResolvedValue({ data: [] });
    vi.mocked(fixtureAPI.issue).mockResolvedValue({ data: { base_number: 'FT-QCI-01', numbers: ['FT-QCI-01-01', 'FT-QCI-01-02'] } });
  });

  it('多套申请会自动启用数量流水号并展示所有结果', async () => {
    render(<FixtureNumberForm />);
    fireEvent.change(screen.getByPlaceholderText('请输入姓名'), { target: { value: '张三' } });
    fireEvent.change(screen.getByPlaceholderText('如 QCI'), { target: { value: 'qci-abc' } });
    fireEvent.click(screen.getByLabelText(/生成数量流水号/));
    fireEvent.change(screen.getByLabelText(/申请数量/), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: '完成验证' }));
    fireEvent.click(screen.getByRole('button', { name: /提交申请/ }));

    await waitFor(() => expect(fixtureAPI.issue).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'new', applicant_name: '张三', project_code: 'QCI-ABC', quantity: 2, include_quantity: true,
    })));
    expect(await screen.findByText('FT-QCI-01-02')).toBeInTheDocument();
  });

  it('已有种类可手动输入基础编号继续取号', async () => {
    render(<FixtureNumberForm />);
    fireEvent.click(screen.getByRole('button', { name: '已有种类' }));
    fireEvent.change(screen.getByPlaceholderText('请输入姓名'), { target: { value: '李四' } });
    fireEvent.change(screen.getByPlaceholderText('如 FT-QCI-01'), { target: { value: 'ft-qci-01' } });
    fireEvent.click(screen.getByRole('button', { name: '完成验证' }));
    fireEvent.click(screen.getByRole('button', { name: /提交申请/ }));

    await waitFor(() => expect(fixtureAPI.issue).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'existing', applicant_name: '李四', base_number: 'FT-QCI-01', quantity: 1,
    })));
  });
});

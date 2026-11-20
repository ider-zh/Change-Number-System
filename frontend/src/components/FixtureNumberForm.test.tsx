import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FixtureNumberForm } from './FixtureNumberForm';
import { fixtureAPI, projectAPI } from '../services';

vi.mock('../services', () => ({
  fixtureAPI: { getKinds: vi.fn(), issue: vi.fn() },
  projectAPI: { getAll: vi.fn() },
}));

vi.mock('./CapVerification', () => ({
  CapVerification: ({ onSolve }: { onSolve: (token: string) => void }) =>
    <button type="button" onClick={() => onSolve('test-token')}>完成验证</button>,
}));

describe('工装治具取号表单', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(projectAPI.getAll).mockResolvedValue({ data: [
      { id: 1, code: 'QCI-ABC', name: '平台项目', status: 'approved', created_at: '2026-11-01' },
    ] });
    vi.mocked(fixtureAPI.getKinds).mockResolvedValue({ data: [] });
    vi.mocked(fixtureAPI.issue).mockResolvedValue({ data: { base_number: 'FT-QCI-01', numbers: ['FT-QCI-01-01', 'FT-QCI-01-02'] } });
  });

  it('多套申请会自动启用数量流水号并展示所有结果', async () => {
    render(<FixtureNumberForm />);
    fireEvent.change(screen.getByPlaceholderText('请输入姓名'), { target: { value: '张三' } });
    await waitFor(() => expect(projectAPI.getAll).toHaveBeenCalledWith('approved,pending'));
    fireEvent.click(screen.getByRole('button', { name: '请选择项目代号' }));
    fireEvent.click(await screen.findByRole('button', { name: /QCI-ABC.*平台项目/ }));
    fireEvent.click(screen.getByLabelText(/生成数量流水号/));
    fireEvent.change(screen.getByLabelText(/申请数量/), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: '完成验证' }));
    fireEvent.click(screen.getByRole('button', { name: /提交申请/ }));

    await waitFor(() => expect(fixtureAPI.issue).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'new', applicant_name: '张三', project_code: 'QCI-ABC', quantity: 2, include_quantity: true,
    })));
    expect(await screen.findByText('FT-QCI-01-02')).toBeInTheDocument();
  });

  it('全新种类未选择项目代号时不能提交', async () => {
    render(<FixtureNumberForm />);
    fireEvent.change(screen.getByPlaceholderText('请输入姓名'), { target: { value: '张三' } });
    fireEvent.click(screen.getByRole('button', { name: '完成验证' }));
    fireEvent.click(screen.getByRole('button', { name: /提交申请/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('请选择项目代号');
    expect(fixtureAPI.issue).not.toHaveBeenCalled();
  });

  it('勾选特殊类别后清空项目并禁止选择项目，仍可取 TL 编号', async () => {
    vi.mocked(fixtureAPI.issue).mockResolvedValue({ data: { base_number: 'TL-02', numbers: ['TL-02-01'] } });
    render(<FixtureNumberForm />);
    fireEvent.change(screen.getByPlaceholderText('请输入姓名'), { target: { value: '张三' } });
    await waitFor(() => expect(projectAPI.getAll).toHaveBeenCalledWith('approved,pending'));
    fireEvent.click(screen.getByRole('button', { name: '请选择项目代号' }));
    fireEvent.click(await screen.findByRole('button', { name: /QCI-ABC.*平台项目/ }));
    fireEvent.change(screen.getByLabelText('类型代码'), { target: { value: 'TL' } });
    fireEvent.click(screen.getByLabelText('特殊类别，不需要选择项目代号'));
    expect(screen.getByRole('button', { name: '特殊类别不选择项目代号' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '完成验证' }));
    fireEvent.click(screen.getByRole('button', { name: /提交申请/ }));

    await waitFor(() => expect(fixtureAPI.issue).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'new', type_code: 'TL', project_code: '', omit_type_separator: true,
    })));
    expect(await screen.findByText('TL-02-01')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('特殊类别，不需要选择项目代号'));
    expect(screen.getByRole('button', { name: '请选择项目代号' })).toBeInTheDocument();
  });

  it('已有种类只展示编号查询，不显示申请数量、人机验证和提交按钮', async () => {
    vi.mocked(fixtureAPI.getKinds).mockResolvedValue({ data: [
      {
        id: 1, type_code: 'FT', project_code: 'CM', base_number: 'FT-CM-01', label: '定位治具',
        created_at: '2026-11-20 08:00:00', max_quantity_serial: 9, issued_count: 9, request_count: 2,
      },
    ] });
    render(<FixtureNumberForm />);
    fireEvent.click(screen.getByRole('button', { name: '已有种类' }));
    fireEvent.change(screen.getByRole('textbox', { name: '搜索已有种类编号' }), { target: { value: 'FT-CM' } });
    await waitFor(() => expect(fixtureAPI.getKinds).toHaveBeenCalledWith('FT-CM'));
    expect(await screen.findByText('FT-CM-01')).toBeInTheDocument();
    expect(screen.queryByText('查找已有种类编号')).not.toBeInTheDocument();
    expect(screen.getByText('工装治具 · FT')).toBeInTheDocument();
    expect(screen.getByText('CM')).toBeInTheDocument();
    expect(screen.getByText('定位治具')).toBeInTheDocument();
    expect(screen.getByText('已发放 9 个')).toBeInTheDocument();
    expect(screen.getByText('申请 2 次')).toBeInTheDocument();
    expect(screen.getByText('最新 FT-CM-01-09')).toBeInTheDocument();
    expect(screen.queryByLabelText('种类编号')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/申请数量/)).not.toBeInTheDocument();
    expect(screen.queryByText('人机验证')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /提交申请/ })).not.toBeInTheDocument();
    expect(fixtureAPI.issue).not.toHaveBeenCalled();
  });

  it('复刻种类仅输入已有完整编号即可取号', async () => {
    vi.mocked(fixtureAPI.issue).mockResolvedValue({ data: { base_number: 'AM-QCI-03', numbers: ['AM-QCI-03-06', 'AM-QCI-03-07'] } });
    render(<FixtureNumberForm />);
    fireEvent.click(screen.getByRole('button', { name: '复刻种类' }));
    fireEvent.change(screen.getByPlaceholderText('请输入姓名'), { target: { value: '张三' } });
    expect(screen.queryByLabelText('类型代码')).not.toBeInTheDocument();
    expect(screen.queryByText('项目代号')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('特殊类别，不需要选择项目代号')).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('如 FT-CM-01'), { target: { value: 'am-qci-03' } });
    expect(screen.getByText('请输入复刻的种类编号，如：FT-CM-XXX')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/申请数量/), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: '完成验证' }));
    fireEvent.click(screen.getByRole('button', { name: /提交申请/ }));

    await waitFor(() => expect(fixtureAPI.issue).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'replica', base_number: 'AM-QCI-03', quantity: 2, include_quantity: true,
    })));
    expect(vi.mocked(fixtureAPI.issue).mock.calls[0][0]).not.toHaveProperty('type_code');
    expect(vi.mocked(fixtureAPI.issue).mock.calls[0][0]).not.toHaveProperty('project_code');
    expect(vi.mocked(fixtureAPI.issue).mock.calls[0][0]).not.toHaveProperty('omit_type_separator');
    expect(await screen.findByText('AM-QCI-03-07')).toBeInTheDocument();
  });
});

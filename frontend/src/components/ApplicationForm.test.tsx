import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ApplicationForm } from './ApplicationForm';
import * as services from '../services';

// Mock services
vi.mock('../services', () => ({
  projectAPI: {
    getAll: vi.fn(),
    request: vi.fn(),
  },
  numberTypeAPI: {
    getAll: vi.fn(),
    request: vi.fn(),
  },
  applicationAPI: {
    create: vi.fn(),
  },
}));

describe('ApplicationForm 组件测试', () => {
  const mockProjects = [
    { id: 1, code: 'ALPHA01', name: 'Alpha Project', status: 'approved' },
    { id: 2, code: 'BETA88', name: 'Beta Project', status: 'approved' },
  ];

  const mockNumberTypes = [
    { id: 1, type_code: 'CR', type_name: 'Change Request', status: 'approved' },
    { id: 2, type_code: 'DCP', type_name: 'Design Change Proposal', status: 'approved' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(services.projectAPI.getAll).mockResolvedValue({ data: mockProjects });
    vi.mocked(services.numberTypeAPI.getAll).mockResolvedValue({ data: mockNumberTypes });
  });

  it('应该正确渲染表单', async () => {
    render(<ApplicationForm />);

    expect(screen.getByPlaceholderText('请输入申请人姓名')).toBeInTheDocument();
    expect(screen.getByText('编号申请')).toBeInTheDocument();
  });

  it('应该加载项目和编号类型数据', async () => {
    render(<ApplicationForm />);

    await waitFor(() => {
      expect(services.projectAPI.getAll).toHaveBeenCalled();
      expect(services.numberTypeAPI.getAll).toHaveBeenCalled();
    });
  });

  it('应该从 localStorage 加载缓存的用户信息', async () => {
    localStorage.setItem('userInfo', JSON.stringify({ name: '张三' }));

    render(<ApplicationForm />);

    await waitFor(() => {
      const applicantInput = screen.getByPlaceholderText('请输入申请人姓名');
      expect(applicantInput).toHaveValue('张三');
    });
  });

  it('应该显示申请新项目弹窗', async () => {
    render(<ApplicationForm />);

    const requestProjectBtn = screen.getByText('申请新项目');
    fireEvent.click(requestProjectBtn);

    expect(screen.getByPlaceholderText('项目代号')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('项目名称')).toBeInTheDocument();
  });

  it('应该显示申请新编号类型弹窗', async () => {
    render(<ApplicationForm />);

    const requestNumberTypeBtn = screen.getByText('申请新编号类型');
    fireEvent.click(requestNumberTypeBtn);

    expect(screen.getByPlaceholderText('类型代码')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('类型名称')).toBeInTheDocument();
  });

  it('应该成功提交申请', async () => {
    vi.mocked(services.applicationAPI.create).mockResolvedValue({
      data: { full_number: 'CR-ALPHA01-0001' },
    });

    render(<ApplicationForm />);

    await waitFor(() => {
      const applicantInput = screen.getByPlaceholderText('请输入申请人姓名');
      fireEvent.change(applicantInput, { target: { value: '张三' } });
    });

    // 模拟选择项目
    const projectTrigger = screen.getByText('请选择项目');
    fireEvent.click(projectTrigger);

    await waitFor(() => {
      const projectOption = screen.getByText('ALPHA01 - Alpha Project');
      fireEvent.click(projectOption);
    });

    // 模拟选择编号类型
    const numberTypeTrigger = screen.getByText('请选择编号类型');
    fireEvent.click(numberTypeTrigger);

    await waitFor(() => {
      const numberTypeOption = screen.getByText('CR - Change Request');
      fireEvent.click(numberTypeOption);
    });

    // 提交表单
    const submitButton = screen.getByText('提交申请');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(services.applicationAPI.create).toHaveBeenCalledWith({
        applicant_name: '张三',
        project_code: 'ALPHA01',
        number_type: 'CR',
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/✓ 生成的编号: CR-ALPHA01-0001/)).toBeInTheDocument();
    });
  });

  it('应该显示表单验证错误', async () => {
    render(<ApplicationForm />);

    const submitButton = screen.getByText('提交申请');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('请填写所有必填字段')).toBeInTheDocument();
    });
  });

  it('应该保存用户信息到 localStorage', async () => {
    vi.mocked(services.applicationAPI.create).mockResolvedValue({
      data: { full_number: 'CR-ALPHA01-0001' },
    });

    render(<ApplicationForm />);

    await waitFor(() => {
      const applicantInput = screen.getByPlaceholderText('请输入申请人姓名');
      fireEvent.change(applicantInput, { target: { value: '张三' } });
    });

    const submitButton = screen.getByText('提交申请');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const cachedUser = JSON.parse(localStorage.getItem('userInfo') || '{}');
      expect(cachedUser.name).toBe('张三');
    });
  });
});

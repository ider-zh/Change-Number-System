import { z } from 'zod';

// 申请记录验证
export const applicationSchema = z.object({
  applicant_name: z
    .string()
    .min(1, '申请人姓名不能为空')
    .max(50, '申请人姓名不能超过50个字符'),
  project_code: z
    .string()
    .min(1, '项目代号不能为空'),
  number_type: z
    .string()
    .min(1, '编号类型不能为空'),
});

// 项目申请验证
export const projectRequestSchema = z.object({
  project_code: z
    .string()
    .min(1, '项目代号不能为空')
    .max(20, '项目代号不能超过20个字符')
    .regex(/^[A-Z0-9]+$/, '项目代号只能包含大写字母和数字'),
  project_name: z
    .string()
    .min(1, '项目名称不能为空')
    .max(100, '项目名称不能超过100个字符'),
});

// 编号类型申请验证
export const numberTypeRequestSchema = z.object({
  type_code: z
    .string()
    .min(1, '类型代码不能为空')
    .max(10, '类型代码不能超过10个字符')
    .regex(/^[A-Z]+$/, '类型代码只能包含大写字母'),
  type_name: z
    .string()
    .min(1, '类型名称不能为空')
    .max(50, '类型名称不能超过50个字符'),
  description: z
    .string()
    .max(200, '描述不能超过200个字符')
    .optional(),
});

// 管理员登录验证
export const adminLoginSchema = z.object({
  username: z
    .string()
    .min(1, '用户名不能为空'),
  password: z
    .string()
    .min(1, '密码不能为空'),
});

// 审核验证
export const reviewSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reviewer_note: z
    .string()
    .max(500, '备注不能超过500个字符')
    .optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;
export type ProjectRequestData = z.infer<typeof projectRequestSchema>;
export type NumberTypeRequestData = z.infer<typeof numberTypeRequestSchema>;
export type AdminLoginData = z.infer<typeof adminLoginSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;

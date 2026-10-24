// 技术文件取号类别（8 类 + 记录表单）
export const TECH_CATEGORIES = [
  { code: 'PRODUCT_TECH', name: '产品技术文件', format: 'QTD-项目代号-6位流水号', needProject: true, hint: '工艺流程图、工艺规程、使用说明书属于此类' },
  { code: 'GENERAL_TECH', name: '通用技术', format: 'QTD-CM-6位流水号', needProject: true, hint: '通用技术指南、技术规范、规定、标准属于此类' },
  { code: 'DHF', name: 'DHF', format: 'DHF-项目代号-6位流水号', needProject: true, hint: 'M0-M5开发过程文件，如《产品需求规格说明书》《系统设计方案》等属于此类' },
  { code: 'SOP', name: 'SOP', format: 'SOP-项目代号-6位流水号', needProject: true, hint: '产品装配/调试/检验/售后/来料检验/设备操作规程/治具操作规程等属于此类' },
  { code: 'PROGRAM', name: '程序', format: 'SOFT-项目代号-S1+6位流水号', needProject: true, hint: '固件、应用软件、工具驱动、配置参数、软件清单等属于此类' },
  { code: 'BOM', name: 'BOM', format: 'BOM-子类型-项目代号-6位流水号', needProject: true, hint: '仪器、模块、PCBA、软件等属于此类', hasSubType: true },
  { code: 'OTHER_DRAWING', name: '其他图纸', format: 'DRW-CM-6位流水号', needProject: false, hint: '指除机械图纸、线材图纸外，不在规范内的图纸' },
  { code: 'OTHER_QUALITY_SYSTEM', name: '其他质量体系文件', format: 'QST-关键代号-4位流水号', needProject: false, hint: '其他质量体系文件：任何没有编号规则的质量体系内的文件都可以参考' },
  { code: 'RECORD_FORM', name: '记录表单', format: '源文件编号-R001', needProject: false, hint: '从产品技术文件/通用技术/DHF/SOP 类文件中引出记录表单，编号为 源文件编号-R001' },
] as const;

// 记录表单可派生的源文件类别
export const RECORD_FORM_SOURCE_TYPES = ['PRODUCT_TECH', 'GENERAL_TECH', 'DHF', 'SOP'];

// BOM 子类型（2 类）
export const BOM_SUBTYPES = [
  { code: 'BOM', name: '仪器/模块/软件清单', format: 'BOM-项目代号-6位流水号', legacyCodes: ['BOM_ASSE', 'BOM_SOFT'] as string[] },
  { code: 'BOM_PCBA', name: 'PCBA', format: 'BOM-PCBA-6位流水号', legacyCodes: [] as string[] },
] as const;

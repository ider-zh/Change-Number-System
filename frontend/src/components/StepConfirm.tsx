import { Button } from './ui/button';
import { NumberPreviewCard } from './NumberPreviewCard';

interface StepConfirmProps {
  projectCode: string;
  projectName?: string;
  numberType: string;
  numberTypeName?: string;
  applicantName: string;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
  isCoolingDown: boolean;
  cooldownSeconds: number;
}

export function StepConfirm({
  projectCode,
  projectName,
  numberType,
  numberTypeName,
  applicantName,
  onBack,
  onSubmit,
  loading,
  error,
  isCoolingDown,
  cooldownSeconds
}: StepConfirmProps) {
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">确认申请信息</h3>
        
        <div className="space-y-2 p-4 bg-muted/50 rounded-md">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-muted-foreground">申请人</div>
            <div className="font-medium">{applicantName}</div>
            
            <div className="text-muted-foreground">项目代号</div>
            <div className="font-medium">{projectCode}{projectName ? ` - ${projectName}` : ''}</div>
            
            <div className="text-muted-foreground">编号类型</div>
            <div className="font-medium">{numberType}{numberTypeName ? ` - ${numberTypeName}` : ''}</div>
          </div>
        </div>

        <NumberPreviewCard
          projectCode={projectCode}
          projectName={projectName}
          numberType={numberType}
          numberTypeName={numberTypeName}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          上一步
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onSubmit}
          loading={loading}
          disabled={isCoolingDown || loading}
        >
          {isCoolingDown ? `请等待 ${cooldownSeconds}s 后可再次取号` : '提交申请'}
        </Button>
      </div>
    </div>
  );
}

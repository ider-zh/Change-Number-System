import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface NumberPreviewCardProps {
  projectCode?: string;
  projectName?: string;
  numberType?: string;
  numberTypeName?: string;
  sequencePlaceholder?: string;
}

export function NumberPreviewCard({
  projectCode,
  projectName,
  numberType,
  numberTypeName,
  sequencePlaceholder = '???'
}: NumberPreviewCardProps) {
  const hasSelection = projectCode || numberType;

  if (!hasSelection) {
    return null;
  }

  // 构建预览格式
  const parts: string[] = [];
  
  if (projectCode) {
    parts.push(projectCode);
  } else {
    parts.push('???');
  }

  if (numberType) {
    parts.push(numberType);
  } else {
    parts.push('???');
  }

  parts.push(sequencePlaceholder);

  const previewFormat = parts.join('-');

  return (
    <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">编号格式预览</span>
            <Badge variant="secondary" className="text-xs">预览</Badge>
          </div>
          
          <div className="font-mono text-2xl font-bold text-center py-3 bg-background/50 rounded-md border border-border/50">
            {previewFormat}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            {projectCode && (
              <div className="flex flex-col">
                <span className="font-medium text-foreground">项目代号</span>
                <span>{projectCode}{projectName ? ` - ${projectName}` : ''}</span>
              </div>
            )}
            {numberType && (
              <div className="flex flex-col">
                <span className="font-medium text-foreground">编号类型</span>
                <span>{numberType}{numberTypeName ? ` - ${numberTypeName}` : ''}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

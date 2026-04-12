import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Copy, Check, RotateCw, List } from 'lucide-react';

interface NumberResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  resultNumber: string | null;
  onAgain: () => void;
  onViewRecords: () => void;
  isCoolingDown?: boolean;
  cooldownSeconds?: number;
}

export function NumberResultModal({
  isOpen,
  resultNumber,
  onAgain,
  onViewRecords,
  isCoolingDown = false,
  cooldownSeconds = 0
}: NumberResultModalProps) {
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedNumber(number);
      setTimeout(() => setCopiedNumber(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = number;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedNumber(number);
      setTimeout(() => setCopiedNumber(null), 2000);
    }
  }, []);

  if (!isOpen || !resultNumber) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
      <div
        className="bg-background rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-4">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-xl font-bold">编号申请成功！</h2>
          
          <div className="py-4 px-6 bg-primary/5 rounded-md border border-primary/20">
            <div className="text-sm text-muted-foreground mb-2">您的编号</div>
            <div className="font-mono text-3xl font-bold text-primary">{resultNumber}</div>
          </div>

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => copyToClipboard(resultNumber)}
          >
            {copiedNumber === resultNumber ? (
              <>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                已复制
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                复制编号
              </>
            )}
          </Button>

          {isCoolingDown && (
            <div className="text-sm text-muted-foreground">
              冷却时间：{cooldownSeconds} 秒
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onAgain}
            >
              <RotateCw className="mr-2 h-4 w-4" />
              再次取号
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={onViewRecords}
            >
              <List className="mr-2 h-4 w-4" />
              查看记录
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { CapWidget } from './ui/cap-widget';

interface CapVerificationProps {
  endpoint: string;
  onSolve: (token: string) => void;
  onReset?: () => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * CapVerification 包装组件
 * 携带中文 locale 和配置的 CapWidget
 */
export function CapVerification({ endpoint, onSolve, onReset, onError, disabled, className }: CapVerificationProps) {
  const [error, setError] = useState<string | null>(null);

  const handleSolve = useCallback((token: string) => {
    setError(null);
    onSolve(token);
  }, [onSolve]);

  const handleError = useCallback((message: string) => {
    setError(message);
    onError?.(message);
  }, [onError]);

  if (disabled) {
    return null;
  }

  return (
    <div className={className}>
      <CapWidget
        endpoint={endpoint}
        workerCount={navigator.hardwareConcurrency || 8}
        override={{
          wasmUrl: '/cap_wasm_bg.wasm',
        }}
        onSolve={handleSolve}
        onReset={onReset}
        onError={handleError}
        locale={{
          initial: '我不是机器人',
          verifying: '验证中...',
          solved: '验证成功 \u2713',
          error: '验证失败，请重试',
          wasmDisabled: '您的浏览器不支持 WebAssembly',
          verifyingAria: '正在进行人机验证',
          solvedAria: '验证已完成',
          errorAria: '验证失败，请重试',
        }}
      />
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
}

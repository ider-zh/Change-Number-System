import React from 'react';
import { Button } from './ui/button';
import { CapVerification } from './CapVerification';

interface StepVerificationProps {
  onVerify: (token: string) => void;
  onBack: () => void;
  token: string | null;
}

export function StepVerification({
  onVerify,
  onBack,
  token
}: StepVerificationProps) {
  const [captchaKey, _setCaptchaKey] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  const handleReset = React.useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">人机验证 *</label>
        <CapVerification
          key={captchaKey}
          endpoint="/cap/"
          onSolve={(t) => {
            onVerify(t);
            setError(null);
          }}
          onReset={handleReset}
          onError={(msg) => {
            setError(msg);
          }}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          上一步
        </Button>
        <Button type="button" disabled={!token}>
          下一步
        </Button>
      </div>
    </div>
  );
}

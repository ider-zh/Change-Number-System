import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Check, Zap } from 'lucide-react';
import { StepProjectSelect } from './StepProjectSelect';
import { StepNumberTypeSelect } from './StepNumberTypeSelect';
import { StepVerification } from './StepVerification';
import { StepConfirm } from './StepConfirm';
import { NumberResultModal } from './NumberResultModal';
import { QuickNumberForm } from './QuickNumberForm';
import { applicationAPI, settingsAPI } from '../services';

interface ProjectItem {
  code: string;
  name?: string;
}

interface NumberTypeItem {
  type_code: string;
  type_name?: string;
}

interface NumberCreationWizardProps {
  applicantName: string;
  onApplicationSubmitted?: () => void;
  onSwitchTab?: (tab: string) => void;
}

type WizardStep = 'project' | 'numberType' | 'verification' | 'confirm';

const steps: { id: WizardStep; label: string }[] = [
  { id: 'project', label: '选择项目' },
  { id: 'numberType', label: '选择类型' },
  { id: 'verification', label: '验证' },
  { id: 'confirm', label: '确认' },
];

export function NumberCreationWizard({
  applicantName,
  onApplicationSubmitted,
  onSwitchTab
}: NumberCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('project');
  const [isQuickMode, setIsQuickMode] = useState(false);

  // Form data
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedNumberType, setSelectedNumberType] = useState<NumberTypeItem | null>(null);
  const [capToken, setCapToken] = useState<string | null>(null);

  // Submit state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Cooldown state
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [isCoolingDown, setIsCoolingDown] = useState(false);
  const [cooldownConfig, setCooldownConfig] = useState(10);

  // Load cooldown config
  useEffect(() => {
    const loadCooldown = async () => {
      try {
        const res = await settingsAPI.getCooldown();
        const cooldown = (res as { data: { cooldown_seconds: number } }).data?.cooldown_seconds;
        if (cooldown) {
          setCooldownConfig(cooldown);
        }
      } catch {
        // ignore
      }
    };
    loadCooldown();
  }, []);

  // Cooldown timer
  const startCooldown = useCallback((seconds?: number) => {
    const cooldownTime = seconds || cooldownConfig;
    setIsCoolingDown(true);
    setCooldownSeconds(cooldownTime);
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCoolingDown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [cooldownConfig]);

  // Get current step index
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  // Navigate steps
  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
    setError(null);
  }, []);

  const nextStep = useCallback(() => {
    const idx = steps.findIndex(s => s.id === currentStep);
    if (idx < steps.length - 1) {
      goToStep(steps[idx + 1].id);
    }
  }, [currentStep, goToStep]);

  const prevStep = useCallback(() => {
    const idx = steps.findIndex(s => s.id === currentStep);
    if (idx > 0) {
      goToStep(steps[idx - 1].id);
    }
  }, [currentStep, goToStep]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!selectedProject || !selectedNumberType) {
      setError('请完成所有步骤');
      return;
    }

    if (!capToken) {
      setError('请完成人机验证');
      return;
    }

    if (isCoolingDown) {
      setError(`请等待 ${cooldownSeconds} 秒后可再次取号`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await applicationAPI.create({
        applicant_name: applicantName,
        project_code: selectedProject.code,
        number_type: selectedNumberType.type_code,
      } as any);
      // Attach capToken to request via header or param
      const fullNumber = (response as { data: { full_number: string } }).data?.full_number || '申请成功';
      setResult(fullNumber);
      setShowResultModal(true);

      if (onApplicationSubmitted) {
        onApplicationSubmitted();
      }

      startCooldown();

      // Reset form
      setSelectedProject(null);
      setSelectedNumberType(null);
      setCapToken(null);
      setCurrentStep('project');
    } catch (err: unknown) {
      const error = err as { response?: { status: number; data?: { retryAfter?: number } }; message?: string };
      if (error.response?.status === 429) {
        const retryAfter = error.response?.data?.retryAfter || cooldownConfig;
        setError(`请求过于频繁，请等待 ${retryAfter} 秒后再次取号`);
        startCooldown(retryAfter);
      } else {
        setError(error.message || '提交申请失败');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedProject, selectedNumberType, capToken, applicantName, isCoolingDown, cooldownSeconds, cooldownConfig, onApplicationSubmitted, startCooldown]);

  // Handle result modal actions
  const handleAgain = useCallback(() => {
    setShowResultModal(false);
    setResult(null);
    setCurrentStep('project');
  }, []);

  const handleViewRecords = useCallback(() => {
    setShowResultModal(false);
    if (onSwitchTab) {
      onSwitchTab('records');
    }
  }, [onSwitchTab]);

  // Quick mode submit handler
  const handleQuickSubmit = useCallback((resultNumber: string) => {
    setResult(resultNumber);
    setShowResultModal(true);
  }, []);

  const handleQuickError = useCallback((error: string) => {
    setError(error);
  }, []);

  // Switch to quick mode
  const handleSwitchToQuick = useCallback(() => {
    setIsQuickMode(true);
  }, []);

  // Switch back to wizard mode
  const handleSwitchToWizard = useCallback(() => {
    setIsQuickMode(false);
  }, []);

  // Step change handlers
  const handleProjectSelect = useCallback((value: string) => {
    setSelectedProject(prev => ({ ...prev, code: value } as ProjectItem));
  }, []);

  const handleNumberTypeSelect = useCallback((value: string) => {
    setSelectedNumberType(prev => ({ ...prev, type_code: value } as NumberTypeItem));
  }, []);

  const handleVerify = useCallback((token: string) => {
    setCapToken(token);
  }, []);

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'project':
        return (
          <StepProjectSelect
            value={selectedProject?.code || ''}
            onChange={handleProjectSelect}
            onNext={nextStep}
            onBack={undefined}
            isFirstStep={true}
          />
        );
      case 'numberType':
        return (
          <StepNumberTypeSelect
            value={selectedNumberType?.type_code || ''}
            onChange={handleNumberTypeSelect}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 'verification':
        return (
          <StepVerification
            onVerify={handleVerify}
            onBack={prevStep}
            token={capToken}
          />
        );
      case 'confirm':
        return (
          <StepConfirm
            projectCode={selectedProject?.code || ''}
            projectName={selectedProject?.name}
            numberType={selectedNumberType?.type_code || ''}
            numberTypeName={selectedNumberType?.type_name}
            applicantName={applicantName}
            onBack={prevStep}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            isCoolingDown={isCoolingDown}
            cooldownSeconds={cooldownSeconds}
          />
        );
      default:
        return null;
    }
  };

  // If quick mode, show quick form
  if (isQuickMode) {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">快捷取号</h2>
          <Button variant="outline" size="sm" onClick={handleSwitchToWizard}>
            <Zap className="h-4 w-4 mr-1" />
            引导模式
          </Button>
        </div>
        <QuickNumberForm
          applicantName={applicantName}
          onApplicationSubmitted={handleQuickSubmit}
          onError={handleQuickError}
        />
        <NumberResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          resultNumber={result}
          onAgain={handleAgain}
          onViewRecords={handleViewRecords}
          isCoolingDown={isCoolingDown}
          cooldownSeconds={cooldownSeconds}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">编号申请</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSwitchToQuick}>
            <Zap className="h-4 w-4 mr-1" />
            快捷模式
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isCompleted = idx < currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      isCompleted
                        ? 'bg-primary text-primary-foreground'
                        : isActive
                        ? 'bg-primary/20 text-primary ring-2 ring-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`text-xs mt-1 ${
                    isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                    idx < currentStepIndex ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="border-0 shadow-none">
        <CardContent className="pt-0">
          {error && currentStep !== 'confirm' && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-4">
              {error}
            </div>
          )}
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Result Modal */}
      <NumberResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        resultNumber={result}
        onAgain={handleAgain}
        onViewRecords={handleViewRecords}
        isCoolingDown={isCoolingDown}
        cooldownSeconds={cooldownSeconds}
      />
    </>
  );
}

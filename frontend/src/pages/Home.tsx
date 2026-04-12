import { useState, useCallback, useRef } from 'react';
import { Layout } from '../components/Layout';
import { ApplicationForm } from '../components/ApplicationForm';
import { ApplicationList } from '../components/ApplicationList';
import { ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';

export function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const handleApplicationSubmitted = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    // 提交成功后不强制滚动，让用户看到结果
  }, []);

  const scrollToRecords = () => {
    listRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Layout>
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50 overflow-hidden">
          {/* Subtle Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none -z-10">
            <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto text-center mb-10">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
              自动取号系统
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
              快速申请内部项目编号，规范化管理，一键取号。
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={scrollToRecords}
                className="gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
              >
                查看申请记录
                <ChevronDown size={18} />
              </Button>
            </div>
          </div>

          <div className="max-w-3xl mx-auto relative group">
             {/* Glow effect behind the form */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
              <ApplicationForm onApplicationSubmitted={handleApplicationSubmitted} />
            </div>
          </div>
        </section>

        {/* Records Section */}
        <section ref={listRef} className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full scroll-mt-20">
          <div className="mb-8 border-b border-slate-100 pb-4">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              申请记录
              <span className="text-sm font-normal text-slate-400 ml-2">实时同步全系统申请动态</span>
            </h3>
          </div>
          <div className="transition-all duration-500">
            <ApplicationList key={refreshKey} />
          </div>
        </section>
      </div>
    </Layout>
  );
}

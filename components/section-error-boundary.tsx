'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type SectionErrorBoundaryProps = {
  children: ReactNode;
  sectionLabel: string;
};

type SectionErrorBoundaryState = {
  failed: boolean;
};

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  state: SectionErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The public fallback remains local and does not transmit error details.
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section className="workspace section-error-state" role="alert">
        <AlertTriangle size={24} />
        <small>SECTION LOAD ERROR</small>
        <h1>{this.props.sectionLabel}暂时无法载入</h1>
        <p>本次错误没有上传；可以重新载入本地页面再试。</p>
        <button type="button" onClick={() => window.location.reload()}>
          <RefreshCw size={15} /> 重新载入页面
        </button>
      </section>
    );
  }
}

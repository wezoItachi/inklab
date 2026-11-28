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
  override state: SectionErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The public fallback remains local and does not transmit error details.
  }

  override render() {
    if (!this.state.failed) return this.props.children;

    return (
      <section className="workspace section-error-state" role="alert">
        <AlertTriangle size={24} />
        <small>SECTION LOAD ERROR</small>
        <h1>{this.props.sectionLabel}暂时无法载入</h1>
        <p>本次错误没有上传；可以先重试当前分区，不会清空其他本地状态。</p>
        <div className="section-error-actions">
          <button
            type="button"
            onClick={() => this.setState({ failed: false })}
          >
            <RefreshCw size={15} /> 重试当前分区
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => window.location.reload()}
          >
            重新载入页面
          </button>
        </div>
      </section>
    );
  }
}

import React from 'react';

import { reportRumReactError } from '@/lib/analytics/datadogRum';
import { log } from '@/lib/telemetry';

type ErrorBoundaryProps = { children: React.ReactNode };

export class ErrorBoundary extends React.Component<ErrorBoundaryProps> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    log('ErrorBoundary', error);
    reportRumReactError(error, errorInfo);
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

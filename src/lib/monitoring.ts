// 简单的错误监控和日志记录
export class ErrorMonitor {
  static logError(error: Error, context?: any) {
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    });

    // 在生产环境中，你可以将错误发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 例如：发送到Sentry、LogRocket等服务
      this.sendToMonitoringService(error, context);
    }
  }

  private static sendToMonitoringService(error: Error, context?: any) {
    // 实现发送到监控服务的逻辑
    // 例如：Sentry.captureException(error, { extra: context });
  }

  static logPerformance(name: string, duration: number) {
    console.log(`Performance: ${name} took ${duration}ms`);
    
    if (process.env.NODE_ENV === 'production') {
      // 发送性能数据到监控服务
    }
  }
}
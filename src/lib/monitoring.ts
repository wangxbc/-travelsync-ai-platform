export class ErrorMonitor {
  static logError(error: Error, context?: any) {
    console.error('Application Error:', {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server',
    })

    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(error, context)
    }
  }

  private static sendToMonitoringService(error: Error, context?: any) {}

  static logPerformance(name: string, duration: number) {
    console.log(`Performance: ${name} took ${duration}ms`)

    if (process.env.NODE_ENV === 'production') {
    }
  }
}

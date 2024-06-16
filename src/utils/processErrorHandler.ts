export const handleUncaughtExceptions = () => {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
  });
};

export const handleUnhandledRejections = () => {
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'Reason:', reason);
    process.exit(1);
  });
};

import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: Number(process.env.PORT || 3000),
  gracefulShutdownTimeout: Number(process.env.GRACEFUL_SHUTDOWN_TIMEOUT || 0),
}));

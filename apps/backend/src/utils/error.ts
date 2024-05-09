import { HttpStatus } from './statusCodes';
type AppErrorParameters = {
  name: keyof typeof HttpStatus;
  message: string;
};
export class AppError extends Error {
  message: string;
  statusCode: number;

  constructor({ name, message }: AppErrorParameters) {
    const statusCode = HttpStatus[name];
    super(message);
    this.statusCode = statusCode;
    this.message = message;
  }
}

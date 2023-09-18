import winston, {
    createLogger,
    transports,
    format
} from 'winston';

@staticImplements<IService>()
export default class LogService {
    private static logger: winston.Logger;

    public static async init() {
        const { combine, timestamp, printf, colorize } = format;
        const customFormat = printf(info => `{ ${info.timestamp} | ${info.level}: ${info.message} }`);

        this.logger = createLogger({
            level: process.env.LOG_LEVEL,
            format: combine(
                colorize(),
                timestamp(),
                customFormat
            ),
            transports: [
                new transports.Console({
                    handleExceptions: true
                })
            ],
            exitOnError: false
        });
    }
    // TODO: Fix logging to give more description of where error is
    public static log(type: string, message: string) {
        switch (type) {
            case 'DEBUG':
                this.logger.debug(message);
                break;
            case 'INFO':
                this.logger.info(message);
                break;
            case 'ERROR':
                this.logger.error(message);
                break;
            default:
                this.logger.info(message);
                break;
        }
    }
}

export interface IService {
    init(): void;
}

export function staticImplements<T>() {
    return <U extends T>(constructor: U) => { constructor };
}
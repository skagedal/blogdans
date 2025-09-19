import winston from 'winston';

// Note: don't make this depend on config because we want to be able to use it when setting up the config

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = winston.createLogger({
    format: isDevelopment 
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message, ...meta }) => {
                const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                return `${timestamp} ${level}: ${message}${metaString}`;
            })
          )
        : winston.format.json(),
    transports: [
        new winston.transports.Console(),
        // new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

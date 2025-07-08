import winston from 'winston';

// Note: don't make this depend on config because we want to be able to use it when setting up the config
export const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        // new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

import path from 'path';
import util from 'util';
import { createLogger, format, transports } from 'winston';
import config from '../config/config.js';
import { applicationEnvironment } from '../constant/application.js';
import { red, blue, yellow, green, magenta, bold } from 'colorette';
import 'winston-mongodb';

const __dirname = path.resolve();

const colorizeLevel = (level) => {
    switch (level) {
        case 'ERROR':
            return red(level);
        case 'INFO':
            return blue(level);
        case 'WARN':
            return yellow(level);
        default:
            return level;
    }
};

const consoleLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info;
    const customLevel = colorizeLevel(level.toUpperCase());
    const customTimestamp = green(timestamp);
    const customMessage = bold(message);
    const customMeta = util.inspect(meta, {
        showHidden: false,
        depth: null,
        colors: true
    });
    const customLog = `${customLevel} [${customTimestamp}] ${customMessage}\n${magenta('META')} ${customMeta}\n`;
    return customLog;
});

const consoleTransport = () => {
    if (config.ENV === applicationEnvironment.DEVELOPMENT) {
        return [
            new transports.Console({
                level: 'info',
                format: format.combine(format.timestamp(), consoleLogFormat)
            })
        ];
    }
    return [];
};

const fileLogFormat = format.printf((info) => {
    const { level, message, timestamp, meta = {} } = info;
    const logMeta = {};
    for (const [key, value] of Object.entries(meta)) {
        if (value instanceof Error) {
            logMeta[key] = {
                name: value.name,
                message: value.message,
                trace: value.stack || ''
            };
        } else {
            logMeta[key] = value;
        }
    }
    const logData = {
        level: level.toUpperCase(),
        message,
        timestamp,
        meta: logMeta
    };
    return JSON.stringify(logData, null, 4);
});

const FileTransport = () => {
    return [
        new transports.File({
            filename: path.join(__dirname, 'logs', `${config.ENV}.log`),
            level: 'info',
            format: format.combine(format.timestamp(), fileLogFormat)
        })
    ];
};

const MongodbTransport = () => {
    return [
        new transports.MongoDB({
            level: 'info',
            db: config.DATABASE_URL,
            metaKey: 'meta',
            expireAfterSeconds: 3600 * 24 * 30,
            collection: 'application-logs'
        })
    ];
};

const shouldDisableLogs = config.DISABLE_LOGS === 'true';

export default createLogger({
    defaultMeta: {
        meta: {}
    },
    transports: shouldDisableLogs ? [] : [...FileTransport(), ...MongodbTransport(), ...consoleTransport()]
});

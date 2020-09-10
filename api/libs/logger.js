const path = require('path');
const winston = require('winston');
const morgan = require('morgan');
const moment = require('moment');
const FileStreamRotator = require('file-stream-rotator');
require('winston-daily-rotate-file');

const config = {
  logPath: path.resolve(process.env.APP_LOG_PATH || path.join(__dirname, '../../logs')),
  logFormat:
    'date=:date[iso] | ip=:remote-addr | method=:method | url=:url | status=:status | time=:response-time | bytes=:res[content-length] | referrer=":referrer" | user-agent=":user-agent" | cookie=":req[cookie]"', // eslint-disable-line
};

const isProduction = process.env.NODE_ENV !== 'development';
const isNetlify = process.env.NETLIFY && JSON.parse(process.env.NETLIFY);

morgan.token('date', () => moment().format('YYYY-MM-DD HH:mm:ss'));

// When run in production ECS
if (!global.logger) {
  if (isProduction && !isNetlify) {
    winston.remove(winston.transports.Console);
    const rotateTransport = new winston.transports.DailyRotateFile({
      filename: path.join(config.logPath, 'app.log.%DATE%'),
      datePattern: path.dateFormat,
    });

    global.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(winston.format.timestamp(), winston.format.splat(), winston.format.prettyPrint()),
      transports: [rotateTransport],
    });
  } else {
    // When run in dev/netlify
    global.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.splat(),
        winston.format.simple()
      ),
      transports: [new winston.transports.Console()],
    });
  }
}

module.exports = global.logger;

module.exports.initialize = app => {
  // When run in production ECS
  if (isProduction && !isNetlify) {
    app.use(
      morgan(config.logFormat, {
        stream: FileStreamRotator.getStream({
          date_format: 'YYYY-MM-DD',
          filename: path.join(config.logPath, 'access.log.%DATE%'),
          frequency: 'daily',
          verbose: false,
        }),
      })
    );
  } else {
    // When run in dev/netlify
    app.use(
      morgan((tokens, req, res) => {
        const log = [
          tokens.method(req, res),
          tokens.url(req, res),
          tokens.status(req, res),
          tokens.res(req, res, 'content-length'),
          '-',
          tokens['response-time'](req, res),
          'ms',
        ].join(' ');

        if (isNetlify) {
          logger.info(log);
        }

        return log;
      })
    );
  }
};

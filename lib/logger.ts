import pino from "pino"

const isLoggingEnabled = process.env.ENABLE_API_LOGGING === "true"

export const logger = pino({
  level: isLoggingEnabled ? "info" : "silent",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true
    }
  }
})

export const logApiRequest = (provider: string, payload: any) => {
  logger.info({ provider, payload }, `API Request to ${provider}`)
}

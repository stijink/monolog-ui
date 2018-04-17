import { MonologUiServer } from "./Component/MonologUiServer"
import { DirectoryLogHandler } from "./Component/DirectoryLogHandler"

const port = parseInt(process.env.API_PORT)
const LogHandler = new DirectoryLogHandler('/logfiles/', process.env.LOGFILE_DIR)

const server = new MonologUiServer(LogHandler, port).start()
export { server }
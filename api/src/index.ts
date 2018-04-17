import { MonologUiServer } from "./Component/MonologUiServer"
import { DirectoryLogHandler } from "./Component/DirectoryLogHandler"

const server = new MonologUiServer(new DirectoryLogHandler()).start()
export { server }
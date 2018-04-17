import * as Http from 'http'
import * as socketIo from 'socket.io'

// Interfaces
import { LogHandler } from '../Interface/loghandler.interface'
import { Filter } from '../Interface/filter.Interface'
import { Message } from '../Interface/message.Interface'

export class MonologUiServer
{
    private port: number = 4000
    private httpServer: any
    private socketIo: any
    private LogHandler: LogHandler

    constructor (logHandler: LogHandler)
    {
        this.port = parseInt(process.env.API_PORT)
        this.httpServer = new Http.Server()
        this.socketIo = socketIo(this.httpServer)
        this.LogHandler = logHandler
    }

    public start ()
    {
        this.httpServer.listen(this.port, () => {
            console.log('MonologUiServer started. Listing on Port ' + this.port)
        })

        this.socketIo.on('connect', (socket: any) => {
            console.log('New socket connection: #' + socket.id)

            this.listenForFilesRequest(socket)
            this.listenForMetaRequest(socket)
            this.listenForMessagesReload(socket)
            this.listenForMessagesRequest(socket)
            this.listenForDisconnect(socket)
        })
    }

    private listenForFilesRequest (socket: any)
    {
        socket.on('request-logfiles', () => {
            console.log('files requested')
            this.socketIo.emit('logfiles', this.LogHandler.getLogfiles())
        })
    }

    private listenForMetaRequest (socket: any)
    {
        socket.on('request-meta', (filter: Filter) => {
            console.log('meta requested')
            this.socketIo.emit('meta', this.LogHandler.getLogfileMeta(filter))
        })
    }

    private listenForMessagesRequest (socket: any)
    {
        socket.on('request-messages', (filter: Filter) => {
            console.log('messages requested')
            this.socketIo.emit('requestedMessages', this.getFilteredMessages(filter));
        })
    }

    private listenForMessagesReload (socket: any)
    {
        socket.on('reload-messages', (filter: Filter) => {
            console.log('messages reload')
            filter.start = 0 // Make sure to start with the latest messages
            this.socketIo.emit('reloadedMessages', this.getFilteredMessages(filter));

            // Start watching for new messages
            this.watchForNewMessages(filter)
        })
    }

    private listenForDisconnect (socket: any)
    {
        socket.on('disconnect', () => {
            console.log('client disconnected')
        })
    }

    private watchForNewMessages (filter: Filter)
    {
        this.LogHandler.watchForNewMessages(filter.file, () => {
            console.log('file has changed')
            this.socketIo.emit('fileChanged')
        })
    }

    /**
     * Load messages and apply filters
     *
     * @param   filter
     * @returns Message[]
     */
    private getFilteredMessages (filter: Filter): Message[]
    {
        let messages = this.LogHandler.getMessages(filter.file)
        messages = this.applyFilters(messages, filter)
        messages = this.applyLimits(messages, filter)

        return messages
    }

    /**
     * Apply filters to the messages
     *
     * @param   messages
     * @param   filter
     * @return  Message[]
     */
    private applyFilters(messages: Message[], filter: Filter): Message[]
    {
        // Filter for loglevel
        messages = messages.filter(message => filter.levels.includes(message.level));

        // Filter for channel
        messages = messages.filter(message => filter.channels.includes(message.channel));

        // Filter for searchterm
        if (filter.searchterm.length > 0) {
            messages = messages.filter(
                message => message.text.indexOf(filter.searchterm.toLowerCase()) !== -1
            )
        }

        return messages;
    }

    /**
     * Apply limits to the messages
     *
     * @param   messages
     * @param   filter
     * @return  Message[]
     */
    private applyLimits(messages: Message[], filter: Filter): Message[]
    {
        return messages.slice(filter.start, (filter.start + filter.limit))
    }
}
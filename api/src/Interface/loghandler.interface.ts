import { Files } from '../Interface/files.Interface'
import { Filter } from '../Interface/filter.Interface'
import { Meta } from '../Interface/meta.Interface'
import { Message } from '../Interface/message.Interface'

export interface LogHandler
{
    /**
     * Get a list of logfiles
     *
     * @returns Files
     */
    getLogfiles (): Files

    /**
     * Get meta informations about the current logfile
     *
     * @param    Filter
     * @returns  Meta
     */
    getLogfileMeta (filter: Filter): Meta

    /**
     * Get messages based on the current filter
     *
     * @param   string filename
     * @returns Message[]
     */
    getMessages (filename: string): Message[]

    /**
     * Watch for new Messages within the current logfile
     *
     * @param filename
     * @param callback
     */
    watchForNewMessages (filename: string, callback)
}
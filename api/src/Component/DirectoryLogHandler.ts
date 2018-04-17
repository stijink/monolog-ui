import * as Filesystem from 'fs'
import * as MomentJs from 'moment'
import * as FileWatcher from 'chokidar'

// Interfaces
import { LogHandler } from '../Interface/loghandler.interface'
import { Files } from '../Interface/files.Interface'
import { Filter } from '../Interface/filter.Interface'
import { Meta } from '../Interface/meta.Interface'
import { Message } from '../Interface/message.Interface'

export class DirectoryLogHandler implements LogHandler
{
    private watcher = null

    constructor(private logfilePathLocal: string, private logfilePathOnHost: string) {}

    /**
     * Get a list of logfiles within a configured path
     *
     * @returns Files
     */
    public getLogfiles (): Files
    {
        const logfiles = {
            path: this.logfilePathOnHost,
            files: []
        }

        const files = Filesystem.readdirSync(this.logfilePathLocal);

        files.forEach(filename => {
            if (! filename.includes('.log')) {
                return
            }

            const fileStats = Filesystem.statSync(this.logfilePathLocal + filename);

            logfiles.files.push({
                name: filename,
                size: (fileStats.size / 1000000.0).toFixed(2),
                changed: fileStats.mtime
            });
        });

        return logfiles
    }

    /**
     * Get meta informations about the current logfile
     *
     * @param    Filter
     * @returns  Meta
     */
    public getLogfileMeta (filter: Filter): Meta
    {
        const messages = this.getMessages(filter.file)

        // First and last date, number of days
        const lastDate  = MomentJs(messages[0].date);
        const firstDate = MomentJs(messages[messages.length - 1].date);
        const days      = lastDate.diff(firstDate, 'days');

        // Determine the avaiable levels
        let levels = messages.map(message => message.level);
        levels = levels.filter(level => level);
        levels = Array.from(new Set(levels));

        // Determine the avaiable levels
        let channels = messages.map(message => message.channel);
        channels = channels.filter(channel => channel);
        channels = Array.from(new Set(channels));

        // Determine the size of the log file
        const fileStats = Filesystem.statSync(this.logfilePathLocal + filter.file);
        const filesize_in_mb = fileStats.size / 1000000.0;

        return {
            logfile_name: filter.file,
            logfile_size: filesize_in_mb.toFixed(2),
            total: messages.length,
            levels: levels,
            channels: channels,
            first_date: firstDate.toDate(),
            last_date: lastDate.toDate(),
            days: days
        }
    }

    /**
     * Get messages based on the current filter
     *
     * @param   string filename
     * @returns Message[]
     */
    public getMessages (filename: string): Message[]
    {
        const fullFilename = this.logfilePathLocal + filename
        const logfile  = this.readLogfile(fullFilename)

        return this.parseMessages(logfile)
    }

    /**
     * Watch for new Messages within the current logfile
     *
     * @param filename
     * @param callback
     */
    public watchForNewMessages (filename: string, callback)
    {
        const fullFilename = this.logfilePathLocal + filename

        if (this.watcher !== null) {
            this.watcher.close()
        }

        this.watcher = FileWatcher.watch(fullFilename).on('change', callback)
    }

    /**
     * Read a logfile and return it as a single string
     *
     * @param filename
     * @returns string
     */
    private readLogfile (filename: string): string
    {
        return Filesystem.readFileSync(filename, 'utf8').toString().trim()
    }

    /**
     * Parse the plain logfile into an array of Message Objects
     *
     * @param logfile
     * @returns Message[]
     */
    private parseMessages (logfile: string): Message[]
    {
        const messages = [];
        const rawMessages = logfile.split("\n");

        for(let index in rawMessages) {
            messages.push(this.parseMessage(rawMessages[index]));
        }

        return messages.reverse();
    }

    /**
     * Parse a raw message string into an Message Object
     *
     * @param   rawMessage
     * @returns Message
     */
    private parseMessage (rawMessage: string): Message
    {
    // Parse date
    const date = rawMessage.substring(1, 20)

    // Parse channel
    const channel = rawMessage.substring(22, rawMessage.indexOf('.'))

    // Parse level
    const level = rawMessage.substring(rawMessage.indexOf('.') + 1, rawMessage.indexOf(':', 22))

    // Parse Message Text
    const text = rawMessage
        .substring(rawMessage.indexOf(level) + 2 + level.length)
        .replace(/\[\]/g, '')
        .trim()

        return {
            date: date,
            channel: channel,
            level: level,
            text: text
        }
    }
}
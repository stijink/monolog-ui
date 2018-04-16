export interface Filter
{
    file: string,
    start: number,
    limit: number,
    searchterm: string,
    levels: Array<string>,
    channels: Array<string>
}
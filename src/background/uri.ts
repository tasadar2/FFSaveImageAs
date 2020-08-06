class Uri {
    public segments: string[];
    public query?: string;
    public protocol: string;
    public host: string;
    public domain: string;
    public port?: string;
    public url: string;

    constructor(url: string) {
        this.url = url.toLowerCase();

        const protocolParts = this.url.split("://");
        this.protocol = protocolParts[0];
        const queryParts = protocolParts[1].split("?", 2);
        this.segments = queryParts[0].split("/");
        if (queryParts.length > 1) {
            this.query = queryParts[1];
        }

        let domainParts = this.segments[0].split(":");
        if (domainParts.length > 1) {
            this.port = domainParts[1];
        }

        domainParts = domainParts[0].split("@");
        this.host = domainParts[domainParts.length - 1];
        domainParts = this.host.split(".");
        let domain = domainParts[domainParts.length - 1];
        if (domainParts.length > 1) {
            domain = domainParts[domainParts.length - 2] + "." + domain;
        }
        this.domain = domain;
    }
}

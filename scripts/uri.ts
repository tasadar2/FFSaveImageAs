class Uri {
    public segments: string[];
    public protocol: string;
    public host: string;
    public domain: string;
    public port: string;
    public url: string;

    constructor(url: string) {
        this.processUrl(url);
    }

    private processUrl(url: string): void {
        this.url = url.toLowerCase();

        const protocolParts = this.url.split("//");
        this.protocol = protocolParts[0];
        this.segments = protocolParts[1].split("/");

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

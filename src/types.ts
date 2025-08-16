import net from "net";

export type ResponseSendData = {
  statusCode: number;
  keepAlive: boolean;
};

export const ContentTypes = {
  TEXT_PLAIN: "text/plain",
  TEXT_HTML: "text/html",
  TEXT_CSS: "text/css",
  TEXT_JAVASCRIPT: "text/javascript",
  TEXT_XML: "text/xml",
  TEXT_CSV: "text/csv",
  TEXT_MARKDOWN: "text/markdown",

  APPLICATION_JSON: "application/json",
  APPLICATION_XML: "application/xml",
  APPLICATION_YAML: "application/x-yaml",
  APPLICATION_JAVASCRIPT: "application/javascript",
  APPLICATION_XHTML_XML: "application/xhtml+xml",
  APPLICATION_FORM_URLENCODED: "application/x-www-form-urlencoded",
  MULTIPART_FORM_DATA: "multipart/form-data",

  IMAGE_PNG: "image/png",
  IMAGE_JPEG: "image/jpeg",
  IMAGE_GIF: "image/gif",
  IMAGE_SVG_XML: "image/svg+xml",
  IMAGE_WEBP: "image/webp",
  IMAGE_X_ICON: "image/x-icon",
  IMAGE_BMP: "image/bmp",
  IMAGE_TIFF: "image/tiff",
  IMAGE_HEIC: "image/heic",

  AUDIO_MPEG: "audio/mpeg",
  AUDIO_WAV: "audio/wav",
  AUDIO_OGG: "audio/ogg",
  AUDIO_MP4: "audio/mp4",
  AUDIO_WEBM: "audio/webm",

  VIDEO_MP4: "video/mp4",
  VIDEO_WEBM: "video/webm",
  VIDEO_OGG: "video/ogg",
  VIDEO_QUICKTIME: "video/quicktime",

  APPLICATION_PDF: "application/pdf",
  APPLICATION_ZIP: "application/zip",
  APPLICATION_GZIP: "application/gzip",
  APPLICATION_X_TAR: "application/x-tar",
  APPLICATION_MSWORD: "application/msword",
  APPLICATION_VND_OPENXML_WORD:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  APPLICATION_VND_EXCEL: "application/vnd.ms-excel",
  APPLICATION_VND_OPENXML_EXCEL:
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  APPLICATION_VND_POWERPOINT: "application/vnd.ms-powerpoint",
  APPLICATION_VND_OPENXML_POWERPOINT:
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  FONT_TTF: "font/ttf",
  FONT_OTF: "font/otf",
  FONT_WOFF: "font/woff",
  FONT_WOFF2: "font/woff2",

  APPLICATION_OCTET_STREAM: "application/octet-stream",
  APPLICATION_JSONLD: "application/ld+json",
  APPLICATION_RTF: "application/rtf",
} as const;

export class HttpResponse {
  private readonly _socket: net.Socket;
  public headers: Record<string, string> = {};
  private _statusCode: number = 200;
  private _keepAlive: boolean = true;

  constructor(socket: net.Socket) {
    this._socket = socket;
  }

  private get _getTextCode() {
    switch (this._statusCode) {
      case 400:
        return "Bad Request";
      case 200:
        return "OK";
      case 500:
        return "Internal Server Error";
      default:
        "";
    }
  }

  keepAlive(value: boolean) {
    this._keepAlive = value;

    return this;
  }

  statusCode(code: number) {
    this._statusCode = code;

    return this;
  }

  setContentType(type: string) {
    this.headers["Content-Type"] = type;
  }

  setHeader(key: string, value: string) {
    this.headers[key] = value;

    return this;
  }

  send(text: string) {
    this.setContentType(ContentTypes.TEXT_PLAIN);
    this._writeResponse(Buffer.from(text));
  }

  json(data: unknown) {
    this.setContentType(ContentTypes.APPLICATION_JSON);
    this._writeResponse(Buffer.from(JSON.stringify(data)));
  }

  html(html: string) {
    this.setContentType(ContentTypes.TEXT_HTML);
    this._writeResponse(Buffer.from(html));
  }

  private _writeResponse(content: Buffer) {
    const headers = Object.entries(this.headers)
      .map(([key, value]) => `${key}:${value}`)
      .join("\r\n");

    this._socket.write(
      `HTTP/1.1 ${this._statusCode} ${this._getTextCode}\r\n` +
        `${headers}\r\n` +
        `Content-Length: ${content.length}\r\n` +
        `Connection: ${this._keepAlive ? "keep-alive" : "close"}\r\n` +
        `\r\n`
    );

    this._socket.write(content);

    if (!this._keepAlive) return this._socket.end();
  }
}

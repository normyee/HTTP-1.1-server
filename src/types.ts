import net from "net";

export type ResponseSendData = {
  statusCode: number;
  keepAlive: boolean;
};

export class HttpResponse {
  private _socket: net.Socket;

  private _getTextCode(code: number) {
    switch (code) {
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

  constructor(socket: net.Socket) {
    this._socket = socket;
  }

  send({ statusCode, keepAlive }: ResponseSendData) {
    this._socket.write(
      `HTTP/1.1 ${statusCode} ${this._getTextCode(statusCode)}\r\n` +
        `Content-Length: 0\r\n` +
        `Connection: ${keepAlive ? "keep-alive" : "close"}\r\n` +
        `\r\n`
    );

    if (!keepAlive) return this._socket.end();
  }
}

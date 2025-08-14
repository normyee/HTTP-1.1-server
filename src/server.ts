import net from "net";
import { BadRequestError } from "./errors";
import { ResponseSendData } from "./types";

const PORT = 8181;

class HttpResponse {
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

export class FayuServerApplication {
  private _app: net.Server;

  private _getHttpResponse(socket: net.Socket) {
    return new HttpResponse(socket);
  }

  private _getHttpRequest(clientRequest: Buffer<ArrayBufferLike>) {
    const requestLine = clientRequest.toString().split("\r\n")[0];
    const [method, path, version] = requestLine.split(" ");

    if (!method || !path || !version)
      throw new BadRequestError("Missing method, path or version");

    return {
      method,
      path,
      version,
    };
  }

  constructor() {
    this._app = net.createServer((socket) => {
      console.log(
        `TCP connection established from ${socket.remoteAddress}:${socket.remotePort}`
      );

      socket.on("data", (data) => {
        let response = this._getHttpResponse(socket);
        try {
          console.log(
            `Received data: 
            ${data.toString()}
            `
          );
          const request = this._getHttpRequest(data);
        } catch (error) {
          if (error instanceof BadRequestError)
            return response.send({ statusCode: error.code, keepAlive: false });
        }
      });

      socket.on("end", () => {
        console.log(
          `Connection from ${socket.remoteAddress}:${socket.remotePort} ended`
        );
      });
    });
  }

  start() {
    this._app.listen(PORT, () => {
      console.log(`TCP server is listening on port 8080`);
    });
  }
}

const server = new FayuServerApplication();

server.start();

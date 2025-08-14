import net from "net";
import { BadRequestError } from "./errors";

const PORT = 8181;

type ResponseSendData = {
  statusCode: number;
};

class HttpResponse {
  private _socket: net.Socket;
  constructor(socket: net.Socket) {
    this._socket = socket;
  }

  send({ statusCode }: ResponseSendData) {
    if (statusCode === 400)
      this._socket.write(
        `HTTP/1.1 ${statusCode} Bad Request\r\n` +
          `Content-Length: 0\r\n` +
          `Connection: close\r\n` +
          `\r\n`
      );
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
          console.log(request);
        } catch (error) {
          if (error instanceof BadRequestError)
            return response.send({ statusCode: error.code });
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

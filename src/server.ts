import net from "net";
import { BadRequestError } from "./errors";

const PORT = 8181;

export class FayuServerApplication {
  private _app: net.Server;

  private _decodeHttpRequest(clientRequest: Buffer<ArrayBufferLike>) {
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
        try {
          console.log(
            `Received data: 
            ${data.toString()}
            `
          );

          const decodedHttpRequest = this._decodeHttpRequest(data);
          console.log(decodedHttpRequest);
        } catch (error) {
          if (error instanceof BadRequestError) {
            socket.write(
              `HTTP/1.1 ${error.code} Bad Request\r\n` +
                `Content-Length: 0\r\n` +
                `Connection: close\r\n` +
                `\r\n`
            );

            socket.end();
          }
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

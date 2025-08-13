import net from "net";
import { BadRequestError } from "./errors";

const PORT = 8181;

export class FayuServerApplication {
  private _app: net.Server;

  private _decodeHttpRequest(
    clientRequest: Buffer<ArrayBufferLike>,
    client: net.Socket
  ) {
    try {
      const requestLine = clientRequest.toString().split("\r\n")[0];
      const [method, path, version] = requestLine.split(" ");

      if (!method || !path || !version)
        throw new BadRequestError("Missing method, path or version");

      return {
        method,
        path,
        version,
      };
    } catch (error) {
      console.error(error);
      if (error instanceof BadRequestError) {
        client.write(
          "HTTP/1.1 400 Bad Request\r\n" +
            "Content-Length: 0\r\n" +
            "Connection: close\r\n" +
            "\r\n"
        );

        client.end();
      }
    }
  }

  constructor() {
    this._app = net.createServer((socket) => {
      console.log(
        `TCP connection established from ${socket.remoteAddress}:${socket.remotePort}`
      );

      socket.on("data", (data) => {
        console.log(
          `Received data: 
            ${data.toString()}
            `
        );

        const decodedHttpRequest = this._decodeHttpRequest(data, socket);
        console.log(decodedHttpRequest);
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

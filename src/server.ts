import net from "net";
import { BadRequestError } from "./errors";

const PORT = 8181;

export class FayuServer {
  private _app: net.Server;

  private _decodeHttpRequest(clientRequest: Buffer<ArrayBufferLike>) {
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
      //IDK GONNA FIGURE IT OUT
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

        const decodedHttpRequest = this._decodeHttpRequest(data);
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

const server = new FayuServer();

server.start();

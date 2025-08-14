import net from "net";
import { BadRequestError, ServerPortError } from "./errors";
import { HttpResponse } from "./types";

export class FayuxApplication {
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
          console.log(data.toString());
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

  start(PORT: number, callback: () => void) {
    if (!PORT) throw new ServerPortError("Server port is needed");
    this._app.listen(PORT, callback);
  }
}

const PORT = 8181;
const server = new FayuxApplication();

server.start(PORT, () => {
  console.log(`TCP server is listening on port ${PORT}`);
});

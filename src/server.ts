import net from "net";
import { BadRequestError, ServerPortError } from "./errors";
import { HttpResponse } from "./types";

// próximos passos

// 1 - pegar os headers e body no request
// 2 - aprender os headers principais para manipulação
// 3 - roteamento
// 4 - middlewares
// 5 - padronizar erros
// 6 - técnicas de performance: pré-compilação, radix tree, estudar outras técnicas de performance que fastify usa
// 7 - response precisa de métodos como: setHeader,

//preciso criar retorno Response para Handler
type Handler = (request: any, response: HttpResponse) => void;

export class FayuxApplication {
  private _app: net.Server;

  private _routes: Record<string, Record<string, Handler>> = {};

  private _getHttpResponse(socket: net.Socket) {
    return new HttpResponse(socket);
  }

  private _getHttpRequest(clientRequest: Buffer<ArrayBufferLike>) {
    const requestLines = clientRequest.toString().split("\r\n");
    const [method, path, version] = requestLines[0].split(" ");
    const headers = [];

    for (let i = 1; i < requestLines.length; i++) {
      if (requestLines[i] === "") break;
      const [key, value] = requestLines[i].split(":");
      headers.push(`${key}:${value}`);
    }

    if (!method || !path || !version)
      throw new BadRequestError("Missing method, path or version");

    return {
      method,
      path,
      version,
      headers,
    };
  }

  constructor() {
    this._app = net.createServer((socket) => {
      socket.on("data", (data) => {
        let response = this._getHttpResponse(socket);
        try {
          console.log(data.toString());
          const request = this._getHttpRequest(data);

          console.log(request);
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

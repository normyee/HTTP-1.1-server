import net from "net";
import { BadRequestError, ServerPortError } from "./errors";
import { HttpResponse } from "./types";

//preciso criar retorno Response para Handler
type Handler = (request: any, response: HttpResponse) => void;

export class FayuxApplication {
  private _app: net.Server;

  private _routes: Record<string, Record<string, Handler>> = {};

  private _registerRoute(method: string, path: string, handler: Handler) {
    const m = method.toUpperCase();

    if (!this._routes[m]) this._routes[m] = {};

    this._routes[m][path] = handler;
  }

  private _getHttpResponse(socket: net.Socket) {
    return new HttpResponse(socket);
  }

  private _getHttpRequest(clientRequest: Buffer<ArrayBufferLike>) {
    const requestLines = clientRequest.toString().split("\r\n");
    const [method, path, version] = requestLines[0].split(" ");
    const headers: Record<string, string> = {};

    for (let i = 1; i < requestLines.length; i++) {
      const line = requestLines[i];
      if (line === "") break;

      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) continue;

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();

      headers[key] = value;
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

  private async _onRequest(req: any, res: HttpResponse) {
    const method = req.method.toUpperCase();
    const path = req.path;
    const route = this._routes[method][path];

    if (!route) return res.send({ statusCode: 404, keepAlive: false });

    try {
      await Promise.resolve(route(req, res));
    } catch (error) {
      return res.send({ statusCode: 500, keepAlive: false });
    }
  }

  constructor() {
    this._app = net.createServer((socket) => {
      socket.on("data", async (data) => {
        let response = this._getHttpResponse(socket);
        try {
          const request = this._getHttpRequest(data);

          await this._onRequest(request, response);
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

  public start(PORT: number, callback: () => void) {
    if (!PORT) throw new ServerPortError("Server port is needed");
    this._app.listen(PORT, callback);
  }

  public get(path: string, handler: Handler) {
    this._registerRoute("GET", path, handler);
  }

  public post(path: string, handler: Handler) {
    this._registerRoute("POST", path, handler);
  }

  public delete(path: string, handler: Handler) {
    this._registerRoute("DELETE", path, handler);
  }

  public put(path: string, handler: Handler) {
    this._registerRoute("PUT", path, handler);
  }
}

const PORT = 8181;
const server = new FayuxApplication();

server.get("/users", (req: any, res: HttpResponse) => {
  console.log("teste", req.headers);
});

server.start(PORT, () => {
  console.log(`TCP server is listening on port ${PORT}`);
});

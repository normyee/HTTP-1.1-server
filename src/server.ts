import net from "net";

const PORT = 8181;

const server = net.createServer((socket) => {
    console.log(`TCP connection established from ${socket.remoteAddress}:${socket.remotePort}`);

    socket.on("data", (data) => {
        console.log(`Received data: ${data.toString()}`);

    });

    socket.on("end", () => {
        console.log(`Connection from ${socket.remoteAddress}:${socket.remotePort} ended`);
    })
});

server.listen(PORT, () => {
    console.log(`TCP server is listening on port 8080`);
});
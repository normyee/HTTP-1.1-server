HTTP roda sobre TCP. Ou seja, criaremos um servidor que escuta uma porta e aceita conexões.

```
const server = net.createServer(socket => {
    //socket é a conexão com o cliente. é baseado em eventos
    //escutaremos eventos pelo método 'on'
    //evento 'data' são dados que recebemos do cliente. 'end' é fim da conexão TCP
})
```

HTTP - estudos para entender como funciona low-level

ESTRUTURA BÁSICA:
```
<Request-Line>
<Headers>
<Blank line> //é quem separa headers do body
<Optional Body>
```

REQUEST LINE -> método, path, versão (GET /index.html, HTTP/1.1)
*toda request HTTP/1 tem pelo menos uma request line.
*path é a endpoint/recurso

\r -> volta para início da linha
\n -> quebra linha
\r\n -> garantimos que a quebra de linha funcione tanto para WINDOWS quanto outros OS
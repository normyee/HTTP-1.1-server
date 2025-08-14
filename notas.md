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

REQUEST:
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

RESPONSE
Uma resposta http/1.1 típica tem três partes principais:
```
<status-line>\r\n
<header1>\r\n
<header2>\r\n
...
\r\n
<body>
```
*status line informa a versão e o código de status -> HTTP/1.1 400 Bad Request
*headers → dão contexto pro cliente (tipo tamanho do corpo, tipo de conteúdo, se vai fechar a conexão…)

Cabeçalho de Response:
Content-Length: 0 -> indica o tamanho do body

Connection: close -> fecha a conexão.
OBS: o HTTP/1.1, por padrão, as conexões são persistentes (keep-alive). ou seja, o cliente pode enviar várias requisições pelo mesmo socket sem precisar abrir uma nova conexão. Em caso de erro, faz mais sentido fechar a conexão.


O socket é uma conexão TCP bruta. tudo que você escreve nele é uma sequência de bytes que vai pro cliente.

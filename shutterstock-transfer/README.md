# IWAN Shutterstock Transfer

Flow: UPLOAD -> FTPS -> FILE_TRANSFERRED -> buka Shutterstock Contributor -> paste metadata -> FINAL SUBMIT manual.

Server membutuhkan Node.js dengan outbound TCP/TLS ke ftps.shutterstock.com:21.

Environment variables:
- SHUTTERSTOCK_FTPS_USERNAME
- SHUTTERSTOCK_FTPS_PASSWORD
- SHUTTERSTOCK_FTPS_HOST (optional)
- SHUTTERSTOCK_FTPS_PORT (optional)

Jangan pernah menaruh password Shutterstock di source code, frontend, GitHub, atau chat.

FILE_TRANSFERRED hanya dikembalikan setelah server menerima completion reply FTP 226/250. Status ini bukan SUBMITTED.

Endpoint POST /transfer menerima multipart field "image".
# Parsers

### Notice
- "Parsers" can be seen as an *extension* of the `Connection` class and thus **MAY** access private members.
- Every "Parser" function **MUST HAVE** the following signature: `(conn: Connection, reader: MessageReader): void`

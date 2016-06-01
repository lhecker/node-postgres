# Parsers

### Notice
- "Parsers" can be seen as an *extension* of the `Connection` class and thus **MAY** access private members.
- They do not use `this`, because using `.call(this, ...)` is about twice as slow as a direct function call.
- Every "Parser" function **MUST HAVE** the following signature: `(conn: Connection, reader: MessageReader): void`.

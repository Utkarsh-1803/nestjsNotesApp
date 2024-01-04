# NestJS Notes App

**Overview: **

This NestJS project serves as a backend API for a notes application, providing endpoints for note creation, updating, deletion, and sharing. It includes JWT authentication and rate limiting for enhanced security.

**Features:**

1) Authentication: JWT-based authentication ensures secure access to the application.
2) Rate Limiting: Protects against abuse and ensures fair usage by implementing rate limiting.
3) Note Operations: Endpoints for creating, updating, and deleting notes, as well as sharing notes with others.
4) Search Functionality: Enables searching for notes based on a query parameter.

**Project Structure: **

src/authModule: Contains authentication-related files.

auth.controller.ts: Manages user authentication endpoints.
auth.service.ts: Provides authentication-related services.
authDto.ts: Data transfer objects for authentication.

src/notesModule: Manages notes-related functionality.

notes.controller.ts: Handles note-related endpoints.
notes.service.ts: Implements note-related services.
notesDto.ts: Data transfer objects for notes.

src/shared: Shared utilities and decorators.

allow-anonymous.decorator.ts: Decorator for allowing anonymous access.


## Installation
git clone https://github.com/Utkarsh-1803/nestjsNotesApp.git

```bash
cd nestjsNotesApp
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

**Contributing**

Feel free to contribute to the project by submitting issues or pull requests. Please follow the Contribution Guidelines.

**License**
This project is licensed under the MIT License.


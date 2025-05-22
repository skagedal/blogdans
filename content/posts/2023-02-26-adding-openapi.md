---
layout: post
title: "Adding an OpenAPI spec"
summary: "I'd like to have a few different clients for the Habit Tracker API, and so I'm adding an OpenAPI spec to generate them from."
---

In a [few](/posts/2023-02-21-adding-apis) [recent](/posts/2023-02-23-finish-up-the-api) [posts](/posts/2023-02-24-finishing-apis), we have added a little API to track habits. Now I'd like to have some clients for this. And there's actually a couple of things I have in mind. I want a command line tool, and I am unsure of which language I want to implement it in – maybe Java, maybe Rust. I want an iOS app, and I might want a React app. 

So there's a couple of different clients. It would be sweet to be able to generate them from a single source of truth. So I'm thinking, it would be fun to write an OpenAPI spec and play around with [openapi-generator](https://github.com/OpenAPITools/openapi-generator) to generate the clients. Let's do that. 

So first, the spec. The latest version of the [OpenAPI spec](https://github.com/OAI/OpenAPI-Specification) at this time of writing is [v3.1.0](https://spec.openapis.org/oas/v3.1.0); however, it seems that tooling has not quite caught up with that yet. For example, IntelliJ IDEA wouldn't preview it, which is a really neat thing to have. So I'll use [v3.0.3](https://spec.openapis.org/oas/v3.0.3). 

I create an `openapi.yaml` file. As a first step I'm just adding the "list habits" and "create habits" endpoitns:

```yaml
openapi: 3.0.3
info:
  title: Hahabit API
  description: API for the Hahabit Habit Tracker
  version: 0.1.0
servers:
  - url: 'https://hahabit.skagedal.tech/api'
    description: Production
  - url: 'http://localhost:8080/api'
    description: Local
paths:
  /habits:
    get:
      summary: Get all habits
      description: Get all habits
      operationId: getHabits
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  habits:
                    type: array
                    items:
                      $ref: '#/components/schemas/Habit'
        '401':
          description: Unauthorized
    post:
      summary: Create a new habit
      description: Create a new habit
      operationId: createHabit
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/HabitCreateRequest'
        required: true
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                properties: {}
        '400':
          description: Bad Request
        '401':
          description: Unauthorized
components:
  schemas:
    Habit:
      type: object
      properties:
        id:
          type: integer
          example: 13
        ownedBy:
          type: string
          example: simon
        description:
          type: string
          example: Do the dishes
        createdAt:
          type: string
          format: date-time
    HabitCreateRequest:
      type: object
      properties:
        description:
          type: string
          example: Brush my teeth
    ListHabitsResponse:
      type: array
      items:
        $ref: '#/components/schemas/Habit'
    Error:
      type: object
      properties:
        message:
          type: string
  securitySchemes:
    basicAuth:
      type: http
      scheme: basic
security:
  - basicAuth: []
```

I expect the API to change at any time, hence the 0.1 version. 

It would be neat to publish the generated HTML somewhere, but for now, if you're really curious, you can open up a Swagger UI instance locally using the `show-docs.sh` script I put together:

```shell
#!/usr/bin/env bash

docker pull swaggerapi/swagger-ui
docker run -d -p 100:8080 \
    -e SWAGGER_JSON=/docs/openapi.yaml \
    -v .:/docs \
    swaggerapi/swagger-ui
sleep 1
open http://localhost:100/
```

Let's continue with generating some clients tomorrow.
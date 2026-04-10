# Contributing

This is an open project, and I would love help building it.

If you want to try something, improve something, or clean something up, you are welcome here.

## What Matters

Please keep the scope of the project in mind:

- clear and transparent AI architecture based on Pi
- no hidden features and no unnecessary complexity
- a real focus on small models
- always think about learners who are not yet confident with code
- keep the architecture modular so features can stay optional, more like plugins than hard requirements
- avoid extra dependencies unless there is a very strong reason

## How To Contribute

- Prefer small, focused pull requests.
- Keep solutions straightforward and understandable.
- Reuse what is already in the repo before adding new abstractions.
- If a change affects the user experience or architecture, update the docs nearby.

## Local Checks

Before opening a pull request, please run what makes sense for your change:

```sh
bun run check
bunx biome check .
bun run test:unit -- --run
bun run build
```

## Unsure?

Open an issue or draft PR and describe the idea. That is completely fine.

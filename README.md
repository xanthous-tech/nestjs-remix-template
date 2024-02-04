## NestJS + Remix Template

This is a template that integrates [Remix](https://remix.run) into a [NestJS](https://nestjs.com) application.

On the NestJS side, we stripped out the default build tools, formatter, and went for the following:
- [tsup](https://tsup.egoist.dev/) for building
- [biome](https://biomejs.dev) for formatting / linting

We also stripped out the test code for simplicity.

On the Remix side, we added the following toolchain / UI libraries:

- [TailwindCSS](https://tailwindcss.com)
- [Shadcn UI](https://ui.shadcn.com)

Between these two, we have injected `AppService` into the Remix app load context, so you can use it in the loaders and actions. Feel free to use this as a starting point for your own projects.

We also added these functional pieces to speed up development of various projects:
- [x] Drizzle ORM
- [x] Lucia Auth
- [x] BullMQ (with Bull Board)

# Athazagoraphobia server

## Stack

```txt
Prisma
Koa
Apollo GraphQL
```

## Prisma

### Production Migration

[Instructions are here](https://www.prisma.io/docs/concepts/components/prisma-migrate).

### Dev Migration

To enter docker-compose container, run following command.

```sh
$ docker exec -ti api /bin/ash
```

Now you need to run migrate.

```sh
$ npx prisma migrate dev
$ npx prisma db seed
```

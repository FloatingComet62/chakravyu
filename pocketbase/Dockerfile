FROM alpine:latest

ARG PB_VERSION=0.31.0
RUN apk add --no-cache \
    unzip \
    ca-certificates
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# this shit will copy the tables and schema changes, so it is important
# if you don't copy this, your server pocketbase will have no tables and no api rules
COPY ./pb_migrations /pb/pb_migrations

EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--origins=https://decypher.ccstiet.com"]

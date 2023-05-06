FROM golang:1.20.4-alpine

ENV GOPATH=/go/src
ENV WORKSPACE=${GOPATH}/tonkatsu
RUN mkdir -p ${WORKSPACE}

COPY . ${WORKSPACE}

WORKDIR ${WORKSPACE}

RUN go mod tidy

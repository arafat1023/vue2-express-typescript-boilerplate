FROM node:16.13
LABEL maintainer=encryptioner.github.io

RUN apt-get update && apt-get install apt-transport-https apt-utils -y

ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=DontWarn

RUN apt-get update && apt-get install mongo-tools -y

RUN yarn global add @vue/cli

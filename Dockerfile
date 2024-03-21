FROM node:alpine3.19
WORKDIR /home/node
COPY ./backend/. .
RUN npm install
EXPOSE 80
ENTRYPOINT ["node", "./app.js"]


# ENV NODE_VERSION=19.3.0
# docker pull node:current-alpine3.17
# /home/node


# docker build -t node-authentication:1.7 .
# docker tag node-authentication:1.7 adomargon/node-authentication:1.7
# docker push adomargon/node-authentication:1.7
# docker run --name authentication-server -p 80:80 node-authentication:1.7
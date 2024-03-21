FROM node:alpine3.19
WORKDIR /home/node
COPY ./backend/. .
RUN npm install
EXPOSE 80
ENTRYPOINT ["node", "./app.js"]


# ENV NODE_VERSION=19.3.0
# docker pull node:current-alpine3.17
# /home/node


# sudo docker build -t node-authentication:1.8 .
# sudo docker tag node-authentication:1.8 adomargon/node-authentication:1.8
# sudo docker push adomargon/node-authentication:1.8
# sudo docker run --name authentication-server -p 80:80 adomargon/node-authentication:1.8
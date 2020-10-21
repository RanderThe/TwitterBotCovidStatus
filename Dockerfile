# Build env
FROM node:12-alpine AS build-env
WORKDIR /app

COPY . ./

# Build project
RUN npm install
RUN npm run build

# Build docker production image
FROM node:12-alpine

WORKDIR /app

COPY --from=build-env /app/build ./dist
COPY --from=build-env /app/node_modules ./node_modules
COPY --from=build-env /app/covid19-cb3fb0151bc2414bb144176bb0a05cfc.csv ./covid19-cb3fb0151bc2414bb144176bb0a05cfc.csv

ENTRYPOINT [ "node", "dist/bot.js" ]

FROM node:22-alpine

# Create app user if it doesn't exist
RUN addgroup -S app && \
    adduser -S -G app app

USER app
WORKDIR /app

COPY --chown=app:app package*.json ./
RUN npm install

COPY --chown=app:app . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

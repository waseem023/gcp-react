# Step 1: Build React
FROM node:18 as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve via serve
FROM node:18

WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/build ./build

EXPOSE 3000

# Always serve on port 3000
CMD ["serve", "-s", "build", "-l", "3000"]

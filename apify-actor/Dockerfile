# Use the Apify Puppeteer base image (includes Chrome, Node 20)
FROM apify/actor-node-puppeteer-chrome:20

# Copy package files first for layer caching
COPY package.json ./

RUN npm install --omit=dev

# Copy source
COPY . ./

CMD ["node", "src/main.js"]

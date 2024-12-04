FROM node
#What proggrams have to be installed
WORKDIR /app
#root folder of the docker image
COPY package*.json ./

COPY . .
#copy files from the prject root '.'  to image root '.'
COPY .env ./

RUN npm i
#add the modules
# RUN npm run build
#collct TS in js and create dist folder
EXPOSE 3000
#pointing the port
CMD ["npm", "run", "start:dev"]
#start comand 'node app' needs to point each word ass the array element
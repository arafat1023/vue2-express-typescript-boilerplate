## Mongodb

### Without docker


**Ububntu**

1. Follow [this](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/)
2. Run `sudo service mongod stop` to stop possibly running mongodb
3. Run `sudo services mongod start`. MOngodb will start at default port `27017`, unless it is not changed

**Mac**

1. Follow [this](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)
2. Run `brew services list` to see running services
3. Make sure `mongo` is in ur path so u can access it from terminal.

### With docker
1. It will run on default port `27017`
2. Mongodb image and container is defined in `docker-compose` file

### Config
1. In `packages/server/src/configs/server.config.json`,
   - `dbServer` should define the the database server name
   - It is `tb-mongodb` while running on docker
   - It is `localhost:27017` while running outside docker in development
   - For production it can be set as connection url for mongodb database

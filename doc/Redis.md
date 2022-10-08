## Redis

### Without docker


**Ububntu**

1. Follow this link to instal redis 6 on ubuntu without the config update part. the  https://otodiginet.com/database/how-to-install-and-configure-redis-6-0-on-ubuntu-20-04-lts/
2. Run `sudo service redis-server stop` to stop possibly running redis server
3. Run `sudo redis-server`. Redis will start at default port `6379`, unless it is not changed

**Mac**

1. Follow [this](https://gist.github.com/tomysmile/1b8a321e7c58499ef9f9441b2faa0aa8)
2. Run `brew services list` to see running services

### With docker
1. It will run on default port `6379`
2. Redis image and container is defined in `docker-compose` file

### Config
1. In `packages/server/src/configs/server.config.json`, 
   - `redisPort` should define used redis port
   - `suppressQueue` truthy/falsy value define weather queue will run or not

## Only Docker For MongoDB (Ubuntu)
1. Run `sudo apt-get install docker.io` If u have no installed docker
2. Run `sudo docker pull mongo:VERSION`
3. Note: `VERSION === 3.2.12` here. So Replace `VERSION` with `3.2.12` 
4. Run `sudo docker run -d -p 27017-27019:27017-27019 --name mymongo_VERSION mongo:VERSION`
5. Run `sudo service mongod stop` to stop possibly running mongodb service
6. If error relating to port  Run `sudo docker ps` & find if there is any running docker container. 
7. If any Run `sudo docker container stop CONTAINER_ID`
8. Run `sudo docker run -d -p 27017-27019:27017-27019 --name mymongo_VERSION mongo:VERSION`
9. Only below commands are necessary after container's initial setup
   1. Run `sudo docker container start mymongo_VERSION`
   2. Run `sudo docker exec -it mymongo_VERSION bash`
   3. Run `mongo` inside docker bash
   4. Then follow command for Run `### Without Docker`
   5. Run `exit` inside docker bash To close container
   6. Then Run `sudo docker container stop mymongo_VERSION`

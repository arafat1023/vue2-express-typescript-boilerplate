# Typescript Boilerplate (Vue + Node + Express + Mongodb)

## Tech Stack
- Environment `Node@^16`
- Backend
    - `express@~4.16`
- Database
    - `mongodb@5.0`
    - `redis@6.0`
- Frontend Framework
    - `vue@^2.6`
- Dev tools 
    - `yarn@^1.22`
    - `vue-cli`
    - `docker>=19.03`
    - `docker-compose>=1.25`
- Unit Testing
    - `jest`


## Project setup

It is recommended to use `docker` for your dev environment. 
To start a `docker` container, run the following.
```sh
./shell/deploy.sh # for unix
```
Or
```cmd
shell\deploy.bat && REM # for windows
```
Or
```sh
./shell/deploy-mac.sh # for mac
```

**NOTE:** 
1. Ensure mongo service is not running before running docker 
2. docker has enough resource like RAM (at least 4 GB), CPU, swap memory etc. 


If you decide not to install `docker`, 
then install `node`, `mongodb`, `yarn` with version mentioned in Section [Tech Stack](#Tech Stack).

Follow `doc/Redis.md` for redis instruction
Follow `doc/Mongodb.md` for mongodb instruction

Make sure you have `@vue/cli` globally installed & `yarn` is in your $PATH
```sh
yarn global add @vue/cli
```

To run only `mongodb` on docker follow `doc/Mongodb-Docker.md`


To install the dependencies, run
```sh
yarn
```

**Note:** 
1. if any error from `sharp` in `mac` while running this command,
   install vips first by running `brew install vips` 
2. If any error from `sharp` in `ubuntu` regarding `python`,
   ensure `python` command runs in terminal.
3. if there is any error regarding `‘remove_cv_t’ is not a member of ‘std’;` to install the dependencies, run
```sh
CXXFLAGS="--std=c++14" yarn
```

### Configurations

#### 1. Go to packages/server/src/configs folder and do the following according to the example file

1. Copy `server.config.example.json` as `server.config.json`
2. To get & set the `Google OAuth2 keys & secret` follow `doc/Google-Api.md`
3. To get & set the `Fb Api key & secret` follow `doc/FB-Api.md`

#### 2. In `packages/server/src/configs/server.config.json`
1. Update values if necessary. Match these values with docker compose if project is running in `docker`
2. `suppressApiLogging=1` will suppress api logging in console
3. `redisPort` is where the redis server is running. It is necessary if `suppressQueue !==1`
4. If `baseServerUrl` is empty string, it will be calculated from `req`. Otherwise it will take value from config
5. if `baseClientUrl` is empty string, it will be calculated from `req`. Otherwise it will take value from config

#### 4. In `packages/utilities/configs/utilities.config.json`
1. `devPort` & `prodPort` defines in which port backend will run.

#### 5. Copy `.env.example` as `.env`
1. `NODE_ENV` is `development` for development. Set `production` for production environment

#### 6. Copy `packages/client/src/configs/client.config.example.json` as `client.config.json` and update values 
1. In a restricted memory, `vueBuildMemory` can be set lower than `2048` MB, otherwise, keep it as example
2. On build to point client side in different base path `vuePublicPath` can be used. In general, in local environment it should be kept empty string. [See more](https://cli.vuejs.org/config/#publicpath)
3. If `baseServerUrl` is empty string, it will be calculated `window.location`. Otherwise it will take value from config

#### 7. Restart the app after changing the config files


### Start Server

If u update `utilities` or `dto` workspace, restart the app, restart the IDE or run
```sh
yarn build:others
```

To start the development server, run
```sh
yarn serve
```

if vue hot reload doesn't work without docker, To start the development server, run
```sh
yarn serve:local
```

This will start the `@vue/cli` server at [https://localhost:8080](http://localhost:8080)
and `express` server at [https://localhost:3000](http://localhost:3000).

**NOTE:** 
If someone is running the projects first time they should set all the entry in `scripts` collection as `isExecuted: true`. 
Those are one time scripts, so for new setup, there is no need to execute those scripts.


> The backend server uses a certificate from `node_modules/webpack-dev-server/ssl` directory. This certificate is dynamically generated when the front-end server starts. Thus, if the backend server fails to start properly, then wait for the frontend server to start completely (and generate the certificate), and type `rs` and press `Enter` to restart the backend server.

Now, visit [https://localhost:8080](http://localhost:8080).


### Compile and minify the Vue app for production
Generally you won't be needed to run this in development environment.
However, if you want to do so for some reason, you can by running
```sh
yarn build
```


### Run your unit tests

To run unit test
```sh
yarn test
```
This will run both client & server side tests.

To run client side tests only, run
```sh
yarn test:client
```
> Note that while running client side test, you may see a warning saying
> ```
> [Vuetify] Multiple instances of Vue detected
> See https://github.com/vuetifyjs/vuetify/issues/4068
> ```
> You can safely ignore this warning.

To run the server side tests only, run
```sh
yarn test:server
```
> Note that don't run server test while server is running in watch mode 


### Lints
To run client side linting, run
```
yarn lint:client
```
To run server side linting, run
```
yarn lint:server
```

### Debug in deployment

We have added two commands to debug in deployment

- `vuex`: If you don't have access to Vue Devtool, you can access the Vuex state by typing `vuex` in the console
  and pressing enter.
- `jsonVuex`: Typing `jsonVuex` in the console and pressing enter will provide the same data as `vuex` 
  but as JSON string.
- `user`: Typing `user` in the console and pressing enter will output the logged in user as JSON string.
- `state`: Typing `state` in the console and pressing enter will output the state of each component
  as a hierarchical tree.
- `getStateOf`: You can use `getStateOf(componentName: string)` to find the state of a specific component.
  Since the same component can exist in multiple places in a DOM, this function will return an array.

### Note
1. Run `yarn upgrade-interactive --latest` to upgrade package after first setup if needed.

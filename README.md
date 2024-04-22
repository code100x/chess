## Chess

Building a platform where people can

1. Sign up
2. Create a new match/get connected to an existing match
3. During the match, let users play moves
4. Have a rating system that goes up and down similar to standard chess rating

## Tech stack

Let's keep it simple

1. React for Frontend
2. Node.js for Backend
3. Typescript as the language
4. Separate Websocket servers for handling real time games
5. Redis for storing all moves of a game in a queue



#Build and Run Docker Containers 

- Open your terminal or command prompt and navigate to the root directory of your project where the docker-compose.yml file is located.

- Run the following command to build and start the Docker containers:
-  ``` docker-compose up --build ```
  
- Once the containers are up and running, you can access the services at the following URLs:
  

 ```  Backend: http://localhost:3000 ``` 
 ```  Frontend: http://localhost:5173 ``` 
  ```  WebSocket: ws://localhost:8080   ```
 


- Stop and Remove Containers : 

 To stop the running containers, press ```Ctrl+C``` in the terminal or command prompt where you started the containers.


- To remove the containers, run the following command: 

``` docker-compose down ``` 

- Make Changes and Rebuild:
If you make any changes to your source code, you'll need to rebuild the Docker images and restart the containers : 

Run the following command to rebuild and restart the containers:

 ``` docker-compose up --build ```
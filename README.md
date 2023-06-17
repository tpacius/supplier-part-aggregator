## Aggregate Part Information from Different Suppliers

## Getting Started


In order to run this project, you should first have the latest LTS version of Node (v18.16) and NPM installed 


Once Node is installed, to run the project enter the backend directory 

`$ cd supplier-backend/`

Install dependencies and run the NestJS server

`$ npm i`

`$ npm run start:dev`

Once the NestJS service is running, enter the frontend directory

`$ cd ../supplier-client/`

Install the dependencies and run the client

`$ npm i`

`$ npm run dev`


## Notes

I thought this was an interesting challenge with an reasonable level of ambiguity

To expand on it I would:
-   Implement an database layer and set up TypeORM in the backend
-   Add the rest of the basic CRUD functionality
-   Abstract the part aggregatation to help make it more generically applicable to multiple parts and suppliers
- Use the persisted data to actually write unit tests r
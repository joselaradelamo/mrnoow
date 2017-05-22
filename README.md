# Project name

There we have a project that makes a request to an API of `human care` information

# Features
## getColaboration
Here, we have a endpoint to get that information. Is divided in two differents functionalities: 
First, we check the previous data that we have saved in a mongodb database. 
If that data corresponds to the same country as we want to check, and the last update was more than a day ago, we ask again for the data to save it updated.
If the data corresponds to the same country as we want, but was from the last day, we take it from the database.

## Helper
In the `model-helper.js` file, we have some functions, but the most important of them are the next ones
- `getData`: Here, we start, calling to `createEndpoint`function to mount the endpoint that we need for get the information, making a call to a a request calling to the function `doRequest`, and calling `saveResponse` to be able to save that response in an array that we are going to use to save all the data.
- `saveResponse: In this function, we do three things. First of all, we check if the request give as a correct response and with no errors. If not, we return an error. If everything goes well, we pick the information of the body from the response, and save it in an array. Finally, we check if there is more information pending in the request response. If we still having data, we call to the `getData` function again, adding to the `offset` the value that we have as a `limit` variable. If not, we return a callback with the full array of responses.
- `mapData`: With the data that we have saved in the previous function, we need to save only the information that we want: The years, the organization and the value. Thats what we have in that function, and we save it in the next JSON structure
```{
	"year"; {
		"organization": "value"
	}
}```
- `orderData`: Finnaly, with the data that we have mapped previously, we need to order from descending order of contributions. When we have it, we return the correct formed and ordered JSON in the API response

## Install

To install the project dependencies, run:

```
npm install
```

It installs the `node_modules` dependencies.

We also need a mongodb instance running in the port 27017 and nodeJS version 6 or higher

## Running

- To run the api, use go.bat if you are using windows, and go.sh if you are using unix

## Explorer

- You can find the models and try it in https://localhost:3000/explorer/


## Testing

- To run units tests, use `npm run test`.
- Also, there is a lint task to clean the code with the airbnb rules that you can find in https://github.com/airbnb/javascript

## License
In the [License](./LICENSE) file you can read the MIT license to that project

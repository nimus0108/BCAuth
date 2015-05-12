# BCAuth
### An easy to use interface for BCA student developers to manage student Bergen account authentication.
#### Built with io.js, Zombie.js, and Express.js.

Allowing students to log into your application using their existing Bergen accounts **sucks**. 

Not only is there no existing API that does this, attempting to create your own API can be a pain in the ass especially if you're messing around with new languages or technologies.

BCAuth remedies this pain by simplifying the user verification process down to a simple HTTP POST request.

## How BCAuth Works
BCAuth uses the io.js platform with the Express framework to run the API. Zombie is used in order to attempt logging in with the provided username and password on BCA's PowerSchool site. Although it seems excessive and not what Zombie was intended for, it was the only solution available that I could find. If you can find a better solution, please contact me so I can make improvements.

## Making the Request
Whenever a student wants to log into your application, just send a POST request containing JSON to https://robertkim.io/bcauth/api/login (**NOTE:** You **MUST** use HTTPS or else you will receive an error). Your JSON body should only contain 2 key/values: `username` and `password`. Also, set your `Content-Type` header as `application/json`.

Example POST body:
`{ "username" : "RobKim", "password" : "hunter2" }` 

That's it! You should then receive a JSON response with a code and message.

## Receiving the Response
The response you receive from the URL above will be in the form of JSON. There will be 1 key/value `status` for the response status.

Example response:
`{ "status" : 0 }`

### Status Codes
* 0: Login was successful. User was authenticated.
* 1: POST body contained invalid JSON.
* 2: Too many key/values in the POST body.
* 3: The `username` or `password` was missing from the POST body.
* 4: There was an error connecting to PowerSchool for authentication.
* 5: The username or password was invalid.
* 6: The connection timed out.

Once your application has received the response, you can do as you please with the status and message for your application.

##### If you have any questions or concerns regarding BCAuth, feel free to reach out to me.

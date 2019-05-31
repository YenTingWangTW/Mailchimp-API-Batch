# Mailchimp RESTful API - Batch Operation
## In Node.js only

### Task:
* Update existing email accounts status (Subscribed/Unsubscribed/Cleaned)
* Add (Remove) Tags to existing email accounts
* `All the above have to be done through batch operation`

### Approach:
* Create a Mailchimp API request template - generic function - **doBatch**
* Create **Status & Tag Update scripts** using this generic function (update-users-status.js & update-users-tags.js)
  * Use module **inquirer** and **commander** to interact with users and parse info through terminal
  * **Data Validity Check** before storing the info
  * **Confirm Action** to proceed after checking the data correctly captured
  * Proceed to make API request through **doBatch** function


### Resources:  
* [Mailchimp API Docs](https://developer.mailchimp.com/documentation/mailchimp/reference/overview/)
* [Mailchimp Website](http://mailchimp.com/)


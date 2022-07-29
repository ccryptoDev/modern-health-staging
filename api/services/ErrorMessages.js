'use strict';
var mappings = {
  /**************************** User Controller **************************/
  DEVICE_REQUIRED: 'deviceId is required',
  PHONENUMBER_REQUIRED: 'phoneNumber is required',
  PHONENUMBER_LENGTH_INVALID: 'Please enter a valid 10 digit phone number.',
  PHONENUMBER_INVALID: 'Phone number should contain only numbers',
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  USER_NOT_FOUND: 'User not found',
  USER_INVALID_AUTH: 'User is invalid',
  VERIFICATIONCODE_REQUIRED: 'Verification Code is invalid',
  PHONE_VERIFICATION_ERROR: 'The phone verification was not found with the parameters provided',
  VERIFICATION_CODE_ERROR: 'verification Code is not valid',
  VERIFICATION_CODE_CREATE_ERROR: 'Could not create the verification Code',
  INVALID_REQUEST_ERROR: 'The number is invalid',
  DEFAULT_ERROR: 'Could not process the verification Code',
  LOGIN_EMAIL_REQUIRED: 'Login email is required',
  LOGIN_PASSWORD_REQUIRED: 'Login password is required',
  REGISTER_PASSWORD_REQUIRED: 'Password is required',
  REGISTER_EMAIL_ALREADY: 'Email already exist',
  CHANGE_PASSWORD_EMAIL_REQUIRED: 'Email is required',
  CHANGE_PASSWORD_REQUIRED:'Password is required',
  CHANGE_CONFIRM_PASSWORD_REQUIRED:'Confirm password is required',
  PASSWORD_MISMATCH:'Password and Confirm password mismatch',
  CURRENT_PASSWORD_REQUIRED:'Current password is required',
  SOCIAL_NETWORK_TYPE_REQUIRED: 'Social network type is required',
  SOCIAL_NETWORK_ID_REQUIRED: 'Social network id is required',
  
  /************UserAgreementController***************/
  DOCUMENTKEY_REQUIRED: 'document Key is required',
  DOCUMENTKEY_MUST_BE_ALPHANUMERIC_ONLY: 'Document key must contain alpha-numeric characters only',
  DOCUMENTNAME_REQUIRED: 'document name is required',
  DOCUMENTVERSION_REQUIRED: 'document version is required',
  DOCUMENTBODY_REQUIRED: 'document body is required',
  ACTIVE_REQUIRED: 'active is required',
  USERNAME_REQUIRED: 'user name cannot be blank',
  PASSWORD_REQUIRED: 'password cannot be blank',
  INSTITUTION_TYPE_REQUIRED: 'please enter the name of the bank',
  TOKEN_REQUIRED: 'please provide the token',
  MFA_REQUIRED: 'please enter the mfa',
  ID_REQUIRED: 'please enter a valid id',

  /************CategoryController***************/
  CATEGORY_NAME_REQUIRED: 'category name cannot be blank',
  CATEGORY_ALREADY_EXISTS: 'category already exists please try some ',
  CATEGORY_NOT_FOUND: 'Category not found',
  /************StoryController***************/
  REQUESTEDAMOUNT_REQUIRED: 'amount needs to be provided',
  BACKGROUND_IMAGE_REQUIRED: 'image needs to be selected',
  BACKGROUND_IMAGE_URL_INVALID: 'Image Url is Invalid',
  CAPTION_REQUIRED: 'provide the caption',
  CATEGORYID_REQUIRED: 'category needed',
  USER_REQUIRED: 'user needed',
  STORYID_REQUIRED: 'storyId is required',
  MFAERROR: 'Sorry, This account requires MFA authentication...!',
  STORY_LOAN_EXISTS: 'There is a on going loan, new story cannot be created',
  STORY_ID_MANDATORY: 'Story id is mandatory',
  REQUESTEDAMOUNT_FLOAT: 'Amount should be decimal',
  LOAN_INITIATED_ERROR: 'Loan is already initiated please create a new story',
  KEYS_REQUIRED: 'keys are mandatory',
  ACCOUNT_NOT_FOUND: 'Account not found',
  ACCOUNTID_REQUIRED: 'Please enter a valid id',
  PLAID_USER_NOT_FOUND: 'No Plaid users found',
  STORY_NOT_FOUND: 'Story not Found',
  ACCOUNT_NAME_REQUIRED: 'Account name is  required',
  ACCOUNT_NUMBER_LAST_FOUR_REQUIRED: 'Account last four digit is required',
  UNAUTHORIZED_USER: 'User account is not linked or Terms not accepted or Amount not approved',
  DOCUMENTPATH_REQUIRED: 'Enter the  document path',

  STORY_CREATED: 'Congrats your story has been created',
  STORY_APPROVED: 'Your story is now approved',
  CANNOT_APPROVE_STORY: 'The story is not approved for transfer',
  /*******************AmountTransfer**************************************/
  STANDARDENTRYCLASSCODE_REQUIRED: 'please enter a valid standard entry class code',
  KEY_REQUIRED:'please enter the key',
  TRANSACTIONTYPE_REQUIRED: 'please enter a valid transaction type',
  FROMROUTING_REQUIRED: 'please enter routing',
  FROMNAME_REQUIRED: 'please enter name',
  FROMIDENTIFICATION_REQUIRED: 'enter id',
  // DESCRIPTION_REQUIRED:'please enter whats it for',
  ACCOUNT_NOT_APPROVED: 'Due to insufficient fund not approved',
  AMOUNT_REQUIRED: 'enter ur amount',
  ACCOUNT_ALREADY_LINKED: 'Account has been linked already',
  TOROUTING_REQUIRED: 'please enter the routing',
  TOACCOUNTTYPE_REQUIRED: 'enter the acc number',
  TONAME_REQUIRED: 'enter the name',
  TOIDENTIFICATION_REQUIRED: 'enter the id',

  /*******************MessagesController*********************************/
  MESSAGE_NOT_FOUND: 'Message with given referenceId not found',
  MESSAGE_TITLE_REQUIRED: 'please enter the title',
  MESSAGE_MESSAGE_REQUIRED: 'please enter the message',
  MESSAGE_CATEGORY_REQUIRED: 'please select the category',
  
  /********************************FluidCardController***************************************/
  FLUID_CARD_NOTFOUND: 'please connect with bank detail as no card found',

  /*****************University********************************/
  UNIVERSITY_NAME_REQUIRED: 'University name is required',
  UNIVERSITY_CITY_REQUIRED: 'University city is required',
  UNIVERSITY_REFERENCEID_REQUIRED: 'University referenceId is required',
  UNIVERSITY_NOT_FOUND: 'University not found',

  /*****************Transactions******************************/
  NO_TRANSACTIONS_FOUND: 'No transactions found',

  /*******************Institution*******************/
  INSTITUTION_NOT_FOUND: 'Institution of given id not found',

  STORY_STATUS_CANNOT_UPDATE: 'Story cannot be updated to this status',
  ACCESS_TOKEN_REQUIRED: 'Access token is required',
  MARQETA_USER_NOT_FOUND: 'Marqeta user not found',

  USER_BANK_ACCOUNT_NOT_FOUND: 'Userbank account not found',
  ACCOUNT_INVALID_ACCOUNT_DATA: 'Account invalid account data',
  USER_BANK_ACCOUNT_ID_REQUIRED: 'User Bank Account ID required',
  PLAID_ITEM_ID_REQUIRED: 'Plaid Item Id Required',
  PLAID_ACCOUNT_ID_REQUIRED: 'Plaid Account Id required',
  SCREEN_NAME_TAKEN: 'Screen Name is Taken, Choose a different name',
  NO_LINKED_ACCOUNT_FOR_USER: 'No linked account for user',
  INSUFFICIENT_FUNDS: 'No sufficient funds present in User Accounts',
  UNAUTHORIZED_BY_PRICING_ENGINE: 'Unauthorized for story Approval by Pricing Engine',
  NOT_ENOUGH_TRANSACTIONS: 'Not Enough Transactions',

  INVALID_INPUT: 'Sorry please enter the current credential',
  QUEUE_IS_EMPTY: 'There is nothing to process in the queue',
  TRANSACTION_NOT_FOUND: 'Transaction not found for the id',
  NO_ACTIVE_LOANS: 'There are no active loans for user',

  INVALID_EMAILID: 'Please enter .edu email',
  UNIVERSITY_INVALID: 'Please enter valid emailId',
  INVALID_STORY_REQUEST: 'Story could not be approved',

  NO_STORIES_IN_DB: 'No stories present in database',
  NO_FLUID_CARD_FOUND_FOR_USER: 'No fluid card found for user',
  VALID_EMAILID: 'Please enter .edu email',

  STORY_CANNOT_BE_CREATED: 'Story cannot be created',
  EMAIL_REQUIRED: 'Email is required',

  ACH_ERROR: "Sorry Ach call could not be completed",
  PAYMENT_DOES_NOT_EXIST: "Sorry no payment does not exist",

UNIVERSITYID_REQUIRED: "Please enter a valid university Id",
PAYMENT_ACTIVITY_NOTFOUND: "Kindly confirm the story to get loan status",

  USER_PROFILE_UPDATE_REQUIRED: 'Please update profile to apply for new loan',
  USER_EMAIL_NOT_VERIFIED: 'Please verify your email address to apply for new loan',

  USER_ACCOUNT_EMPTY: 'Please add atleast one checking account to apply for loan',
  TITLE_REQUIRED: 'Cannot be empty',
  DESCRIPTION_REQUIRED: 'Cannot be empty',
  INVALID_TOKEN: 'Invalid Token',
  
  /*******************AchController*******************/
  SUBJECT_REQUIRED: 'Please enter subject',
  COMMENTS_REQUIRED: 'Please enter coments',
  DOCUMENT_NAME_REQUIRED: 'Please enter document name',
  
  ADMINUSER_NAME_REQUIRED: 'Please enter name',
  ADMINUSER_EMAIL_REQUIRED: 'Please enter email',
  ADMINUSER_PHONE_NUMBER_REQUIRED: 'Please enter phonenumber',
  ADMINUSER_ROLE_REQUIRED: 'Please select role',
  
  PRODUCT_TYPE_REQUIRED: 'Please enter product type',
  STATE_REQUIRED: 'Please select state',
  MINIMIM_AMOUNT_REQUIRED: 'Please enter valid minimum amount',
  MAXIMUM_AMOUNT_REQUIRED: 'Please enter valid maximum amount',
  LOAN_TERM_REQUIRED: 'Please enter loan term',
  LOAN_INTERESTRATE_REQUIRED: 'Please enter loan interest rate',
  LOAN_FUNDINGFEE_REQUIRED: 'Please enter loan funding fee',
  LOAN_BALANCEAVAIL_REQUIRED: 'Please enter loan balance available check',
  LOAN_STATUS_REQUIRED: 'Please select loan status',
  
  CARD_NUMBER_REQUIRED: 'Card number required',
  EXPIRY_YEAR_REQUIRED: 'Expiry year required',
  EXPIRY_MONTH_REQUIRED: 'Expiry month required',
  CARD_CVV_REQUIRED: 'Card cvv required',
  DOB_REQUIRED: 'Date of birth required',
  ADDRESS_REQUIRED: 'Address required',
  CITY_REQUIRED: 'Cityrequired',
  STATE_REQUIRED: 'State required',
  ZIPCODE_REQUIRED:'Zipcode required',
  
  /**************************** Practice Controller **************************/
  CONTACT_USERNAME_REQUIRED: 'User name cannot be blank',
  INVALID_EMAIL_ID: 'Invalid email ID',
  PASSWORD_REQUIRED: 'Password is required',
  CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required',
  FIRSTNAME_REQUIRED:'Firstname is required',
  LASTNAME_REQUIRED:'Lastname is required',
  STREET_REQUIRED:'Street address is required',
  PHONENUMBER_REQUIRED:'Phonenumber is required',
  ZIPCODE_REQUIRED:'Zipcode is required',
  STATE_REQUIRED:'State is required',
  CITY_REQUIRED:'City is required',
};


module.exports = {
  mappings: mappings
};

/**
 * Created by vishal on 28/9/16.
 */
const form = require( "express-form" );
const field = form.field;
const validate = form.validate;
const filter = form.filter;

module.exports = form(
	field( "firstname" ),
	field( "middlename" ),
	field( "lastname" ),
	field( "email" ),
	field( "phone" ),
	field( "password" ),
	field( "practicemanagement" ),
	validate( "firstname" ).required( "", "FIRST_NAME_REQUIRED" ),
	validate( "lastname" ).required( "", "LAST_NAME_REQUIRED" ),
	validate( "email" ).required( "", "EMAIL_REQUIRED" ),
	validate( "phone" ).required( "", "PHONE_NUMBER_REQUIRED" ),
	validate( "password" ).required( "", "PASSWORD_REQUIRED" ),
	validate( "practicemanagement" ).required( "", "PRACTICE_REQUIRED" )
);

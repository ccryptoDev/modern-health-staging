/**
 * Created by Ramaraj on 06/08/18.
 */
var  moment = require('moment');
var in_array = require('in_array');

module.exports = function (req, res, next) {

	var userpageArray	 =	['userinformationfull','userinformationfulldata','userinfofullmanualdata','financeinformation','financeinformationdata','applicationoffer','loanofferdetails','saveapplicationoffer','loanpromissorynote','createloanpromissorypdf','createloanapplication','loansuccess','loanfailure','savecoborrower'];
	var consentpageArray 			=	['signupstart','userinformation','clicktosave','onclicktosave',"savebankinfo"];
	var	otherpromissoryPagesArray	=	['createloanpromissorypdf','createloanapplication','loansuccess','loanfailure'];
	var	postfrontPagesArray	=	['loanofferdetails','saveapplicationoffer','createloanpromissorypdf','savecoborrower','clicktosave','onclicktosave',"savebankinfo"];
	var	postfrontajaxRequest	=	['estimatemonthlypay','continueApplication','saveSignature','updateuserAnticipatedAmount',"savebankinfo"];
 	var urlpath 		 = 	req.path;
	var urlpathArray     = 	urlpath.split("/");
	var	pagename		 =	req.path.substr(1);
	var methodType		 =  req.method;

	/*sails.log.info("urlpathArray:",urlpathArray);
	sails.log.info("pagename:",pagename);
	sails.log.info("methodType:",methodType);*/
	sails.log.info( "req.session::", req.session );

	//-- Added for get started page check
	req.session.getStartedPage = '';

    if ("undefined" !== typeof req.session.appPracticeId && req.session.appPracticeId!='' && req.session.appPracticeId!=null && "undefined" !== typeof req.session.appPracticeSlug && req.session.appPracticeSlug!='' && req.session.appPracticeSlug!=null )
	{
		var  appPracticeSlug = req.session.appPracticeSlug;
		if(urlpathArray.length > 0 && (in_array(pagename,userpageArray)))
		{
			//sails.log.info("Enter first if loop",req.session.applicationuserId);
			if ("undefined" !== typeof req.session.applicationuserId && req.session.applicationuserId!='' && req.session.applicationuserId!=null && in_array(pagename, userpageArray) )
			{
				User
				.findOne({id: req.session.applicationuserId})
				.then(function(appuserData) {

					if(appuserData)
					{

						//--To avoid change loan issue applied from backend
						Screentracking.count({user: req.session.applicationuserId}).exec(function countCB(error, screentrackingcount) {

							//sails.log.info("Get screentrackingcount",screentrackingcount)
							if(screentrackingcount>1)
							{
								return res.redirect('/'+appPracticeSlug);
							}
							else
							{
								//-- Added to block loan flow in application wizard
								var screenCriteria	=	{user: req.session.applicationuserId};
								Screentracking
								.findOne(screenCriteria)
								.sort("createdAt DESC")
								.then(function(screendata){
									var borrowerapplication =0;
									if(screendata.borrowerapplication)
									{
										if(screendata.borrowerapplication==1)
										{
											borrowerapplication=1;
										}
									}

									if(screendata.iscompleted == 1)
									{
										if(pagename=='userinfofullmanualdata')
										{
											var json = {
												status: 400,
												message:'Application completed already',
												leveltype:0
											};
											res.contentType('application/json');
											res.json(json);
										}
										else
										{
											return res.redirect('/');
										}
									}
									else if(borrowerapplication == 1)
									{
										if(pagename=='userinfofullmanualdata')
										{
											var json = {
												status: 400,
												message:'Application completed already',
												leveltype:0
											};
											res.contentType('application/json');
											res.json(json);
										}
										else
										{
											return res.redirect('/');
										}
								 	}
									else
									{
										if("undefined" !== typeof req.session.loanpromissorynoteselected && req.session.loanpromissorynoteselected!='' && req.session.loanpromissorynoteselected!=null && pagename != 'loanpromissorynote' &&  !in_array(pagename,otherpromissoryPagesArray) )
										{
											return res.redirect('/loanpromissorynote');
										}
										else
										{
											return next();
										}
									}
								});
								//sails.log.info("Enter session loop");
							}
						});
					}
					else
					{
						return res.redirect('/'+appPracticeSlug);
					}
				})
				.catch(function(err) {
						return res.redirect('/'+appPracticeSlug);
				});
			}
			else if ("undefined" !== typeof req.session.isplaidEmpty && req.session.isplaidEmpty!='' && req.session.isplaidEmpty!=null && "undefined" !== typeof req.session.tempplaidID && req.session.tempplaidID!='' && req.session.tempplaidID!=null && "undefined" !== typeof req.session.tempuserBankAccountID && req.session.tempuserBankAccountID!='' && req.session.tempuserBankAccountID!=null && in_array(pagename, userpageArray) )
			{
				//sails.log.info("Enter session second loop");
				return next();
			}
			else if("undefined" !== typeof req.session.userfilloutmanually && req.session.userfilloutmanually!='' && req.session.userfilloutmanually!=null && req.session.userfilloutmanually==1)
			{
				return next();
			}
			else if( methodType == 'POST' && (in_array(pagename,userpageArray)) )
			{
				//sails.log.info("Enter session third loop");

				if(in_array(pagename, postfrontPagesArray))
				{
					if ("undefined" !== typeof req.session.applicationuserId && req.session.applicationuserId!='' && req.session.applicationuserId!=null && in_array(pagename, userpageArray) )
					{
						//sails.log.info("Post req.session.applicationuserId :: ",req.session.applicationuserId )

						User
						.findOne({id: req.session.applicationuserId})
						.then(function(appuserData) {

							if(appuserData)
							{
								//--To avoid change loan issue applied from backend
								Screentracking.count({user: req.session.applicationuserId}).exec(function countCB(error, screentrackingcount) {

									//sails.log.info("Post screentrackingcount",screentrackingcount)

									if(screentrackingcount>1)
									{
										return res.redirect('/'+appPracticeSlug);
									}
									else
									{
										//-- Added to block loan flow in application wizard
										var screenCriteria	=	{user: req.session.applicationuserId};
										Screentracking
										.findOne(screenCriteria)
										.sort("createdAt DESC")
										.then(function(screendata){

											var borrowerapplication =0;
											if(screendata.borrowerapplication)
											{
												if(screendata.borrowerapplication==1)
												{
													borrowerapplication=1;
												}
											}

											if(screendata.iscompleted == 1)
											{
												if(pagename=='userinfofullmanualdata')
												{
													var json = {
														status: 400,
														message:'Application completed already',
														leveltype:0
													};
													res.contentType('application/json');
													res.json(json);
												}
												else
												{
													return res.redirect('/');
												}
											}
											else if(borrowerapplication == 1)
											{
												if(pagename=='userinfofullmanualdata')
												{
													var json = {
														status: 400,
														message:'Application completed already',
														leveltype:0
													};
													res.contentType('application/json');
													res.json(json);
												}
												else
												{
													return res.redirect('/');
												}
											}
											else
											{
												return next();
											}
										});
										//return next();
									}
								});
							}
							else
							{
								return res.redirect('/'+appPracticeSlug);
							}
						})
						.catch(function(err) {
								return res.redirect('/'+appPracticeSlug);
						});
					}
					else
					{
						return res.redirect('/'+appPracticeSlug);
					}
				}
				else
				{
					return next();
				}
			}
			else
			{
				return res.redirect('/'+appPracticeSlug);
			}
		}
		else if(urlpathArray.length > 0 && (in_array(pagename,consentpageArray)))
		{
			//sails.log.info("Enter second loop");
			if ("undefined" !== typeof req.session.Electronicsign && req.session.Electronicsign!='' && req.session.Electronicsign!=null && in_array(pagename, consentpageArray) )
			{
				return next();
			}
			else if( methodType == 'POST' && (in_array(pagename,consentpageArray)) )
			{
				return next();
			}
			else if( methodType == 'GET' && pagename=='signupstart' )
			{
				return next();
			}
			else
			{
				//return res.redirect('/');
				/*res.view("practice/error/errorpage", {
					code: 404,
					data: 'Page not found',
					layout: 'layout'
				});*/
				return res.redirect('/'+appPracticeSlug);
			}
		}
		else if( methodType == 'GET' && pagename=='paymentcalculator' )
		{
			return next();
		}
		else if( methodType == 'POST' && (in_array(pagename,postfrontajaxRequest)) )
		{
			return next();
		}
		/*else if( methodType == 'POST' && pagename=='estimatemonthlypay' )
		{
			return next();
		}
		else if( methodType == 'POST' && pagename=='continueApplication' )
		{
			return next();
		}*/
		else
		{
			//return res.redirect('/');
			/*res.view("practice/error/errorpage", {
				code: 404,
				data: 'Page not found',
				layout: 'layout'
			});*/
			return res.redirect('/'+appPracticeSlug);
		}
	}
	else
	{
		if( methodType == 'GET' && pagename=='paymentcalculator' )
		{
			return res.redirect('/apply');
		}
		else
		{
			/*res.view("practice/error/errorpage", {
				code: 404,
				data: 'Page not found',
				layout: 'layout'
			});*/
			return res.redirect('/');
		}
	}
};

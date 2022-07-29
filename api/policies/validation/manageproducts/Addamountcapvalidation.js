/**
 * Created by vishal on 28/9/16.
 */
var form = require('express-form'),
  field = form.field,
  validate = form.validate,
  filter = form.filter;

module.exports = form(
  field('minimumcreditscore'),
	field('maximumcreditscore'),
  field('cap'),
	field('product_id'),
	field('loanamountcap_id')
);

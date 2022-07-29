#!/bin/sh

mongoimport --mode=upsert -j 1 -d modern-health -c productlist productlist.js
mongoimport --mode=upsert -j 1 -d modern-health -c loancredittier loancredittier.js
mongoimport --mode=upsert -j 1 -d modern-health -c loansettings loansettings.js

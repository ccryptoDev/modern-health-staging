#!/bin/sh

mongo --eval 'db.infotable.deleteMany({})' modern-health
mongoimport --mode=upsert -j 1 -d modern-health -c infotable infotable.js
mongo --eval 'db.productlist.deleteMany({})' modern-health
mongoimport --mode=upsert -j 1 -d modern-health -c productlist productlist.js
mongo --eval 'db.productrules.deleteMany({})' modern-health
mongoimport --mode=upsert -j 1 -d modern-health -c productrules productrules.js
mongo --eval 'db.loansettings.deleteMany({})' modern-health
mongoimport --mode=upsert -j 1 -d modern-health -c loansettings loansettings.js
mongo --eval 'db.loancredittier.deleteMany({})' modern-health
mongoimport --mode=upsert -j 1 -d modern-health -c loancredittier loancredittier.js
mongo --eval 'db.loaninterestrate.deleteMany({})' modern-health
mongoimport --mode=upsert -j 1 -d modern-health -c loaninterestrate loaninterestrate.js
mongo --eval 'db.agreement.deleteMany({})' modern-health
mongoimport --mode=upsert -j 1 -d modern-health -c agreement agreement.js
mongoimport --mode=upsert -j 1 -d modern-health -c practicemanagement practicemanagement.js

echo "✓ Done!";

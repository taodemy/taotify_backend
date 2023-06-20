# taotify_backend

### **<u>husky</u>**

- clone project from github might not enable husky, you will need to delete `.husky` file and redo the it following the instructions or go to [husky npm](https://www.npmjs.com/package/husky)
- Edit package.json > prepare script and run it once:

```
npm pkg set scripts.prepare="husky install"
npm run prepare
```

- Add a hook:

```
npx husky add .husky/pre-commit "npm run pre-commit"
git add .husky/pre-commit
```

- if you follow the [husky npm](https://www.npmjs.com/package/husky), remember to change the hook command from `npm test` to `npm run pre-commit`, as we use `pre-commit` to trigger husky hook.

- Make a commit:

```
git commit -m "Keep calm and commit"
# `npm run pre-commit` will run
```

### **<u>node mailer</u>**

- please use hot mail to send email, or search the configuration for other service provider, gmail has a higer security control though.
- set the email address and password in `.env` file to use node mailer.

```
EMAIL_HOST = smtp-mail.outlook.com
SENDER = youremail@hotmail.com
SENDER_PASS = your email password
```

### **<u>stripe webhook</u>**

- for use in `dev` / local environment, you need to set up cli and listen to `localhost:3001/v1/stripe/webhook`, the endpoint from dev server, the script is `stripe listen --forward-to localhost:3001/v1/stripe/webhook`, or check the [instructions to set up stripe webhook](https://stripe.com/docs/webhooks/test?shell=true&api=true)
- after setting up cli, you will find the prompt in terminal/shell looks like

```
Ready! You are using Stripe API Version [2020-08-27]. Your webhook signing secret is whsec_******
```
- use the sceret 

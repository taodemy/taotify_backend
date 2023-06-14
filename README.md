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

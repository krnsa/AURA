## **Installed Packages**

Please run this command in the root directory to install the required packages:

```bash
npm install
```

### Notes

- **concurrently**: Used to run multiple scripts concurrently during development.  
  (Note: Running `npm install` will automatically install all dependencies, including `concurrently`, as it is already listed in `devDependencies` in the root `package.json`. If needed, you can manually install it using the following command:

  ````bash
  npm install --save-dev concurrently
  ```)

  ````

- The root `package.json` manages workspaces for both `frontend` and `backend`.  
  Running `npm install` in the root directory will automatically install all dependencies for both workspaces.  
  **You do not need to run `npm install` separately in the `frontend` or `backend` directories.**

Here is a concise guide for using **Teller** with **Google Cloud Secret Manager (GSM)** to automatically inject secrets into `.env` files on project initialization, and ensure those files are safely ignored by Git.

***

### Setup Requirements

1. **Install Teller CLI**

   ```bash
   brew install teller
   ```
   or download from [Teller GitHub releases].[1]

2. **Authenticate with Google Cloud**

   ```bash
   gcloud auth application-default login
   ```
   This enables Teller to use Application Default Credentials for accessing GSM.[2]

3. **Enable Google Cloud Secret Manager API**

   ```bash
   gcloud services enable secretmanager.googleapis.com
   ```

4. **Ensure your project’s service account has**:
   - `roles/secretmanager.secretAccessor`
   - `roles/secretmanager.viewer`

***

### Configure Teller

1. **Create or edit your Teller configuration file** in the root directory:

   ```bash
   teller new
   ```

   Then edit `.teller.yml` as follows:

   ```yaml
   project: my-gcp-project-id
   providers:
     google_secretmanager:
       kind: google_secretmanager
       project: my-gcp-project-id

   env:
     DATABASE_URL:
       path: google_secretmanager#database_url
     STRIPE_API_KEY:
       path: google_secretmanager#stripe_api_key
   ```

   This maps GSM secrets to local environment variables.[3][1]

***

### Auto-Inject Secrets into `.env`

Run Teller in your IDE terminal:

```bash
teller env > .env
```

This command fetches secrets from Google Cloud Secret Manager and writes them to a local `.env` file automatically at initialization.[2]

For project automation, integrate this into your `postinstall` or `prestart` script in `package.json`:

```json
"scripts": {
  "postinstall": "teller env > .env"
}
```

That ensures secrets are loaded every time a new environment is initialized.

***

### Secure .env Files from Git

Immediately after generating `.env`, append an auto-check in your setup script:

```bash
if ! grep -qxF '.env' .gitignore; then
  echo '.env' >> .gitignore
fi
```

This ensures `.env` is always listed in `.gitignore`, preventing accidental commits containing sensitive data.[4][5][6]

Optionally, you can collocate `.gitignore` rules near specific sensitive files (e.g., inside `/config/.gitignore`) for clearer file management in modular repos.[5]

***

### Summary Workflow

| Step | Command | Purpose |
|------|----------|----------|
| 1 | `gcloud auth application-default login` | GCP auth |
| 2 | `teller new` | Create config |
| 3 | `teller env > .env` | Inject secrets |
| 4 | `echo '.env' >> .gitignore` | Protect secrets from Git |

***

### Optional Development Tip

For team-based workflows, consider **G-Man**, which offers similar GSM integration with in-command secret injection for `docker compose` or local server start commands, useful if you prefer runtime injection instead of file-based `.env` handling.[2]

***

This approach ensures:
- Secrets live securely in GSM.
- Teller automates their injection into `.env` during development.
- `.env` files are safely git-ignored to prevent exposure.

[1](https://github.com/tellerops/teller)
[2](https://www.reddit.com/r/googlecloud/comments/1nkb12m/gman_use_gcp_secrets_manager_and_others_to/)
[3](https://b-nova.com/en/home/content/secrets-management-with-teller/)
[4](https://engineering.udacity.com/three-simple-rules-for-putting-secrets-into-git-d47b207852b9)
[5](https://www.bennadel.com/blog/4751-collocating-my-gitignore-configuration-files-with-the-omitted-files.htm)
[6](https://github.com/groda/the_ultimate_gitignore_guide)
[7](https://cloud.google.com/secret-manager/docs/create-secret-quickstart)
[8](https://cloud.google.com/build/docs/securing-builds/use-secrets)
[9](https://stackoverflow.com/questions/74363403/upload-an-existing-env-file-to-google-cloud-secret-manager)
[10](https://blog.gitguardian.com/how-to-handle-secrets-with-google-cloud-secret-manager/)
[11](https://stackoverflow.com/questions/70900771/use-google-cloud-secrets-when-initializing-code)
[12](https://www.reddit.com/r/googlecloud/comments/m0zv8o/how_to_secure_my_environment_variable_file_on/)
[13](https://cloud.google.com/secret-manager/docs/using-other-products)
[14](https://discuss.google.dev/t/how-to-get-variables-from-the-secret-manager-and-apply-them-to-the-build-of-my-app-yaml-file/176095)
[15](https://stackoverflow.com/questions/69314970/retrieving-environment-variables-in-google-cloud-stored-in-secret-manager)
[16](https://docs.keeper.io/en/keeperpam/secrets-manager/integrations/teller)
[17](https://www.youtube.com/watch?v=JIE89dneaGo)
[18](https://breadnet.co.uk/kubernets-secrets-using-google-secret-manager/)
[19](https://configu.com/blog/gcp-secret-manager-the-basics-and-a-quick-tutorial/)
[20](https://stackoverflow.com/questions/52293453/how-to-keep-secret-key-information-out-of-git-repository)
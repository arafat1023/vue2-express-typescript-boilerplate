## To get API key

1. Go to the Google Developer Console and create a new project (it might take a second).
2. Once in the project, click on Library in the APIs & Services sidebar.
3. Search for desired API and click ENABLE.
4. Click on Credentials in the APIs & Services sidebar to open the credentials menu.
5. Select API key in the dropdown menu to generate an API key.
6. Your new API key will appear. It might take second or two before it starts working.
7. Get that API key and use wherever needed

### To get the Google OAuth2 keys

1. Visit [this](https://console.developers.google.com/apis/credentials) link
2. Select Project Name from top left corner and click "New Project"
3. Create the project 
4. Go to "OAuth Consent Screen", select "External" and click "Create"
5. Fill mandatory fields and click "Continue"
6. Click "Add Or Remove Scope". Select email and profile. Click "Update".
7. Click "Save and Continue"
8. Go to Credentials
9. Click "Create Credentials"
10. Select "OAuth2 Client ID"
11. As "Application Type" select "Web Application"
12. Add "https://localhost:8080" as both "JavaScript origins" and "Redirect URIs"
13. Copy the client ID and use it as `googleAuth2ClientId`
    in both `packages/utilities/configs/utilities.config.json`.
14. Copy the client secret and use it as `googleAuth2ClientSecret`
    in `packages/server/src/configs/server.config.json`
15. Visit [this page](https://console.developers.google.com/apis/library/people.googleapis.com),
    select your project and click enable.

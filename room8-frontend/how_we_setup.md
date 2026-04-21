# How to Set Up and Deploy the Room8 App

This document explains every step required to get your Room8 app into a GitHub repository, set up a new Google Cloud project with billing, configure App Engine, and deploy your application. Follow along line-by-line if you're new to these tools!

---

## Table of Contents

1. [Create a GitHub Repository](#1-create-a-github-repository)
2. [Prepare Your Local Room8 Project](#2-prepare-your-local-room8-project)
3. [Push Your Project to GitHub](#3-push-your-project-to-github)
4. [Set Up Google Cloud for Room8](#4-set-up-google-cloud-for-room8)
   - [a. Install and Initialize Google Cloud SDK](#a-install-and-initialize-google-cloud-sdk)
   - [b. Create a New Configuration and Project](#b-create-a-new-configuration-and-project)
   - [c. Attach a Billing Account](#c-attach-a-billing-account)
5. [Create an App Engine Application](#5-create-an-app-engine-application)
6. [Prepare Your App for Deployment](#6-prepare-your-app-for-deployment)
7. [Deploy Your Application to Google Cloud](#7-deploy-your-application-to-google-cloud)
8. [Verify Your Deployment](#8-verify-your-deployment)
9. [Recap and Next Steps](#9-recap-and-next-steps)

---

## 1. Create a GitHub Repository

Before you begin, make sure you have a GitHub account. Then:

1. **Log in to GitHub:**  
   Go to [https://github.com](https://github.com) and sign in.
2. **Create a New Repository:**
   - Click on the “+” icon in the upper-right corner and select **New repository**.
   - Name the repository (for example, `room8`).
   - (Optional) Add a description.
   - **Do not** initialize with a README or .gitignore—this guide will cover that locally.
   - Click **Create repository**.

Now you have an empty GitHub repository ready to receive your code.

---

## 2. Prepare Your Local Room8 Project

Create a project directory on your computer where all your Room8 app files will reside. For example, open your terminal (or command prompt) and run:

```sh
mkdir room8
cd room8
Inside this room8 folder, create the necessary files and directories. A basic Flask app might have a structure like:

room8/
├── app.py
├── app.yaml
├── requirements.txt
├── templates/
│   ├── base.html
│   └── home.html
└── static/
    └── css/
        └── style.css
Example File Contents
app.py
(Create this file with the following content.)

from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template("home.html")

if __name__ == "__main__":
    app.run(debug=True, port=3000)
app.yaml
(This file tells Google App Engine how to run your app.)

runtime: python38
entrypoint: gunicorn -b :$PORT app:app --timeout 120

handlers:
  - url: /static
    static_dir: static
    secure: always
    expiration: "30d"

  - url: /.*
    script: auto
    secure: always
requirements.txt
(List your dependencies.)

Flask==2.0.1
gunicorn==20.1.0
templates/base.html
(Basic HTML layout.)

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Room8</title>
  <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
</head>
<body>
  <header>
    <h1>Room8</h1>
    <nav>
      <a href="/">Home</a>
    </nav>
  </header>
  <main>
    {% block content %}{% endblock %}
  </main>
  <footer>
    <p>&copy; 2025 Room8</p>
  </footer>
</body>
</html>
templates/home.html
(This file will extend the base.html.)

{% extends "base.html" %}

{% block content %}
  <h2>Welcome to Room8!</h2>
  <p>This is a demo Flask app running on Google App Engine.</p>
{% endblock %}
static/css/style.css
(An example stylesheet.)

body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
}
header, footer {
  background-color: #f8f8f8;
  padding: 10px;
  text-align: center;
}
3. Push Your Project to GitHub
Set up Git in your project folder and push your code to the GitHub repository created earlier.

Initialize Git:

git init
Create a README File and Commit:

echo "# Room8" > README.md
git add .
git commit -m "Initial commit: Set up Room8 project structure"
Add the GitHub Remote:

Replace yourusername with your GitHub username:

git remote add origin https://github.com/yourusername/room8.git
Push to GitHub:

git branch -M main
git push -u origin main
You now have your Room8 project backed up in GitHub.

4. Set Up Google Cloud for Room8
a. Install and Initialize Google Cloud SDK
Install the Google Cloud SDK:
Follow the instructions here to install the SDK on your system.

Initialize gcloud:

Open your terminal and run:

gcloud init
b. Create a New Configuration and Project
Since we want a dedicated environment for Room8, we will create a new configuration and a new project.

Choose to Create a New Configuration:
When prompted by gcloud init, select:

[2] Create a new configuration
Name the Configuration:
For example, type: room8

Select Your Google Account:
When prompted, select your account (e.g., [1] andy.tillo@gmail.com).

Create a New Google Cloud Project:
At the project selection step, choose the option to Create a new project (usually listed as a numeric choice like [11] Create a new project).

Enter a Valid Project ID:
The Project ID must be at least 6 characters long. For instance, type:

room8-oly
Follow the prompts to complete the project creation.

Verify Your New Configuration:

Run:

gcloud config list
Ensure that the project is set to room8-oly.

c. Attach a Billing Account
Google Cloud requires a billing account for using App Engine.

Open the Google Cloud Console:
Visit https://console.cloud.google.com and log in if needed.

Navigate to Billing:
Click on the Navigation Menu (☰) in the upper left, then choose Billing.

Attach Billing to Your Project:

In the Billing section, find your project room8-oly.
Click the three-dot menu next to the project and select Change billing account.
Choose a billing account or create one if you haven’t set one up yet.
Confirm the change.
5. Create an App Engine Application
Now that your project is set up and billing is attached, create your App Engine app.

Ensure Your Project is Selected:

gcloud config set project room8-oly
Create the App Engine Application:

In your terminal, run:

gcloud app create
Choose Your Region:
When prompted, select a region. For example, type:

22
(which might correspond to us-west3 as in our example)

You should see a success message indicating that your App Engine application has been created.

6. Prepare Your App for Deployment
Make sure your project directory (which now contains app.py, app.yaml, etc.) is complete and up-to-date as described in section 2.

7. Deploy Your Application to Google Cloud
Now deploy your application using the Google Cloud SDK.

Deploy the App:

In your project directory, run:

gcloud app deploy --quiet
This command reads the app.yaml file and deploys your app to App Engine.

Wait for Deployment to Complete:
After the command finishes, it will display a URL like:

https://room8-oly.uc.r.appspot.com
8. Verify Your Deployment
Open your web browser and navigate to the URL provided in the output (for example, https://room8-oly.uc.r.appspot.com). You should see your Room8 app running live.
```

Additional Changes
Updated app.yaml
Due to the end-of-support status of Python 3.8 on App Engine, we have updated our app.yaml file to use a supported runtime. The new configuration is as follows:

runtime: python39
entrypoint: gunicorn -b :$PORT app:app --timeout 120

handlers:

- url: /static
  static_dir: static
  secure: always
  expiration: "30d"

- url: /.\*
  script: auto
  secure: always
  Permissions Update
  During deployment, an error was encountered because the service account did not have the required access to the staging bucket used by Cloud Build. To address this issue, we granted the necessary permissions to the service account.

The following command was executed to attach the Storage Admin role to the service account room8-oly@appspot.gserviceaccount.com:

gcloud projects add-iam-policy-binding room8-oly \
 --member="serviceAccount:room8-oly@appspot.gserviceaccount.com" \
 --role="roles/storage.admin"
This update ensures that the service account now has the proper access to manage Cloud Build operations, including creating and accessing the staging bucket.

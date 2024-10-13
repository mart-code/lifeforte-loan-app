


---

# Lifeforte (LMS)

This **Loan Management System (LMS)** is a web-based application designed to manage borrower information, track loan applications, and monitor company expenses. It also supports the creation of new branches for the company as needed. The system is built using **HTML**, **CSS**, **JavaScript**, and **Firebase** for the backend. The application is hosted on **Netlify** for easy deployment and access.

## Features

- **Borrower Management**: Track borrower details and loan history.
- **Loan Applications**: Manage loan applications and track their statuses.
- **Expense Reports**: Monitor and record the company’s expenses.
- **Branch Management**: Dynamically create and manage additional branches as needed.
- **Real-Time Data**: Utilizes Firebase for real-time database updates and synchronization.

## Technologies Used

- **HTML** - Structure of the web application.
- **CSS** - Styling and responsive design.
- **JavaScript** - Frontend logic and dynamic interactions.
- **Firebase** - Backend services, including authentication and real-time database.
- **Netlify** - Hosting for the web application, providing continuous deployment and HTTPS support.

## Installation and Setup

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/mart-code/lifeforte-loan-app.git
   ```

2. Navigate to the project directory:
   ```bash
   cd lifeforte-loan-app
   ```

3. Open the `index.html` file in your browser:
   ```bash
   open index.html
   ```

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable Firebase **Authentication** and **Firestore Database**.
3. Copy your Firebase project configuration and replace it in the `firebaseConfig` object in your JavaScript file.

```js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## Deployment

The application is hosted on **Netlify**. You can deploy your own version by:

1. Connecting your repository to Netlify via the [Netlify Dashboard](https://app.netlify.com/).
2. Setting up automatic deployments from your Git repository.
3. Your site will be live with a Netlify URL or a custom domain if configured.

## Usage

1. **Manage Borrowers**: Add, update, and view details about borrowers.
2. **Process Loan Applications**: Submit and track the status of loan applications.
3. **Track Expenses**: Log company expenses for financial tracking.
4. **Add Branches**: Dynamically add new branches and manage their details.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit (`git commit -m 'Add some feature'`).
4. Push the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the MIT License.

---

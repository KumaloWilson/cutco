
### CUTcoin - Digital Campus Currency System





## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)

- [Student Mobile App](#student-mobile-app)
- [Merchant Dashboard](#merchant-dashboard)
- [Admin Dashboard](#admin-dashboard)



- [Technologies](#technologies)
- [Getting Started](#getting-started)

- [Prerequisites](#prerequisites)
- [Installation](#installation)

- [Backend API](#backend-api)
- [Merchant Dashboard](#merchant-dashboard-1)
- [Student Mobile App](#student-mobile-app-1)
- [Admin Dashboard](#admin-dashboard-1)






- [API Documentation](#api-documentation)
- [Usage](#usage)

- [Student Mobile App](#student-mobile-app-2)
- [Merchant Dashboard](#merchant-dashboard-2)
- [Admin Dashboard](#admin-dashboard-2)



- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)


## Overview

CUTcoin is a comprehensive digital campus currency system designed for Chinhoyi University of Technology. The platform enables students to make cashless transactions across campus, merchants to accept digital payments, and administrators to oversee the entire ecosystem.

The system consists of three main components:

1. **Student Mobile App** - For students to manage their CUTcoin wallets and make transactions
2. **Merchant Dashboard** - For campus merchants to process transactions and manage their accounts
3. **Admin Dashboard** - For university administrators to oversee the system, manage users, and generate reports


CUTcoin aims to create a seamless digital payment experience within the campus ecosystem, reducing the need for cash transactions and providing better financial tracking for all stakeholders.

## System Architecture

The CUTcoin system follows a microservices architecture with the following components:

```plaintext
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Student App    │     │ Merchant Panel  │     │  Admin Panel    │
│  (Flutter) │     │  (Next.js)      │     │  (Next.js)      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────┬───────┴───────────────┬───────┘
                         │                       │
                ┌────────▼────────┐     ┌────────▼────────┐
                │  API Gateway    │     │  Authentication │
                │  (Express.js)   │◄────┤  Service        │
                └────────┬────────┘     └─────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼────────┐    ┌─▼─┐    ┌───────▼────────┐
│  Transaction    │    │   │    │  User Service  │
│  Service        │◄───┤DB │◄───┤                │
└─────────────────┘    └───┘    └─────────────────┘
         ▲               ▲               ▲
         │               │               │
┌────────┴────────┐    ┌─┴─┐    ┌───────┴────────┐
│  Payment        │    │   │    │  Notification  │
│  Gateway        │◄───┤DB │◄───┤  Service       │
└─────────────────┘    └───┘    └─────────────────┘
```

- **Frontend Applications**: React Native for the student mobile app, Next.js for the merchant and admin dashboards
- **Backend Services**: Node.js/Express.js RESTful API services
- **Database**: PostgreSQL for relational data storage
- **Authentication**: JWT-based authentication system
- **Payment Processing**: Integration with Paynow payment gateway
- **Notifications**: Push notifications and email alerts


## Features

### Student Mobile App

- **User Authentication**

- Student ID-based registration and login
- Two-factor authentication
- Password recovery



- **Wallet Management**

- View CUTcoin balance
- Transaction history
- Fund wallet via mobile money or bank transfer



- **Transactions**

- Scan QR codes to pay merchants
- Peer-to-peer transfers to other students
- Request money from other users
- View and filter transaction history



- **Profile Management**

- Update personal information
- Change password and security settings
- Notification preferences



- **Notifications**

- Transaction alerts
- Low balance warnings
- Promotional offers from campus merchants





### Merchant Dashboard

- **Authentication System**

- Secure login with merchant credentials
- Two-factor authentication
- Password reset functionality



- **Dashboard Overview**

- Transaction summary and statistics
- Recent transaction activity
- Pending transactions requiring action



- **Transaction Management**

- View all transactions with filtering and search
- Process deposits and withdrawals
- Confirm or reject pending transactions
- Generate transaction reports



- **Wallet Management**

- View current balance
- Deposit funds via Paynow
- Transaction history



- **Profile Management**

- Update business information
- Manage contact details
- Security settings



- **Settings**

- Notification preferences
- Account security options
- Change password





### Admin Dashboard

- **User Management**

- Manage student accounts
- Manage merchant accounts
- Create and manage admin users
- User verification and approval



- **Transaction Oversight**

- Monitor all system transactions
- Investigate disputed transactions
- Cancel or reverse transactions when necessary
- Generate comprehensive transaction reports



- **System Configuration**

- Set transaction fees and limits
- Configure exchange rates
- Manage payment gateway integrations
- System maintenance settings



- **Analytics and Reporting**

- Transaction volume analytics
- User growth metrics
- Revenue reports
- Merchant performance analysis



- **Content Management**

- System announcements
- Terms of service and policies
- FAQ management





## Technologies

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **Sequelize** - ORM for database interactions
- **JWT** - Authentication mechanism
- **Paynow API** - Payment gateway integration
- **Nodemailer** - Email notifications


### Merchant & Admin Dashboards

- **Next.js** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **Recharts** - Charting library
- **Lucide React** - Icon library
- **React Hook Form** - Form validation
- **Zod** - Schema validation


### Student Mobile App

- **Flutter** - Cross-platform mobile framework
- **GET-X** - State management
- **GET-X** - Navigation library
- **DIO** - HTTP client


## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- PostgreSQL (v13 or later)
- Flutter development environment (for mobile app)
- Paynow merchant account


### Installation

#### Backend API

1. Clone the repository


```shellscript
git clone https://github.com/your-organization/cutcoin-api.git
cd cutcoin-api
```

2. Install dependencies


```shellscript
npm install
```

3. Set up environment variables


```shellscript
cp .env.example .env
```

Edit the `.env` file with your database credentials and other configuration settings.

4. Run database migrations


```shellscript
npm run migrate
```

5. Seed the database with initial data


```shellscript
npm run seed
```

6. Start the development server


```shellscript
npm run dev
```

#### Merchant Dashboard

1. Clone the repository


```shellscript
git clone https://github.com/your-organization/cutcoin-merchant.git
cd cutcoin-merchant
```

2. Install dependencies


```shellscript
npm install
```

3. Set up environment variables


```shellscript
cp .env.example .env.local
```

Edit the `.env.local` file with your API URL and other configuration settings.

4. Start the development server


```shellscript
npm run dev
```

5. Build for production


```shellscript
npm run build
```

#### Student Mobile App

1. Clone the repository


```shellscript
git clone https://github.com/your-organization/cutcoin-mobile.git
cd cutcoin-mobile
```

2. Install dependencies


```shellscript
flutter pub get
```

3. Set up environment variables


```shellscript
cp .env.example .env
```

Edit the `.env` file with your API URL and other configuration settings.

4. Start the development server


```shellscript
flutter run
```



#### Admin Dashboard

1. Clone the repository


```shellscript
git clone https://github.com/your-organization/cutcoin-admin.git
cd cutcoin-admin
```

2. Install dependencies


```shellscript
npm install
```

3. Set up environment variables


```shellscript
cp .env.example .env.local
```

Edit the `.env.local` file with your API URL and other configuration settings.

4. Start the development server


```shellscript
npm run dev
```

5. Build for production


```shellscript
npm run build
```

## API Documentation

The CUTcoin API follows RESTful principles and is organized into the following main endpoints:

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify-otp` - Verify OTP for two-factor authentication
- `POST /api/auth/refresh-token` - Refresh authentication token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with code


### Merchant-specific Endpoints

- `POST /api/merchant-auth/login` - Merchant login
- `POST /api/merchant-auth/register` - Merchant registration
- `POST /api/merchant-auth/verify-otp` - Verify merchant OTP
- `GET /api/merchant/profile` - Get merchant profile
- `PUT /api/merchant/profile` - Update merchant profile
- `GET /api/merchant/dashboard/stats` - Get dashboard statistics
- `GET /api/merchant/transactions` - Get merchant transactions
- `GET /api/merchant/transactions/pending` - Get pending transactions
- `POST /api/merchant/transactions/deposit/merchant-confirm` - Confirm deposit
- `POST /api/merchant/transactions/withdraw/merchant-confirm` - Confirm withdrawal


### Payment Endpoints

- `POST /api/payments/merchant/deposit-funds` - Initiate merchant deposit
- `GET /api/payments/merchant/deposits` - Get merchant deposits
- `GET /api/payments/merchant/deposits/:id` - Get specific deposit
- `POST /api/payments/webhooks/paynow/return` - Paynow return webhook


### User Endpoints

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/wallet/balance` - Get wallet balance
- `GET /api/users/transactions` - Get user transactions


### Transaction Endpoints

- `POST /api/transactions/transfer` - Create P2P transfer
- `POST /api/transactions/payment` - Create payment to merchant
- `GET /api/transactions/:id` - Get transaction details


For detailed API documentation, refer to the [API Documentation](https://api-docs.cutcoin.example.com) (replace with actual documentation URL).

## Usage

### Student Mobile App

#### Registration and Login

1. Download the CUTcoin app from the App Store or Google Play
2. Register using your student ID and university email
3. Verify your account through the OTP sent to your email
4. Set up your security preferences


#### Funding Your Wallet

1. Navigate to the Wallet section
2. Tap "Add Funds"
3. Select your preferred payment method (mobile money, bank transfer, etc.)
4. Follow the prompts to complete the payment


#### Making Payments

1. To pay a merchant, tap "Pay" on the home screen
2. Scan the merchant's QR code or enter their merchant ID
3. Enter the amount and confirm the payment
4. Verify the transaction with your PIN or biometrics


#### Sending Money to Other Students

1. Tap "Send" on the home screen
2. Enter the recipient's student ID or scan their QR code
3. Enter the amount and add a note (optional)
4. Confirm the transfer with your PIN or biometrics


### Merchant Dashboard

#### Registration and Onboarding

1. Visit the CUTcoin Merchant website
2. Click "Register" and fill out the merchant application form
3. Verify your account through the OTP sent to your email
4. Complete your business profile


#### Accepting Payments

1. From the dashboard, generate a unique QR code for your business
2. Display the QR code at your point of sale
3. When a student scans your QR code and makes a payment, you'll receive a notification
4. Confirm the payment in the "Pending Transactions" section


#### Depositing Funds

1. Navigate to "Deposit Funds" in the sidebar
2. Enter the amount you wish to deposit
3. Click "Proceed to Payment"
4. Complete the payment through Paynow
5. Once confirmed, the funds will be added to your CUTcoin wallet


#### Withdrawing Funds

1. Navigate to "Wallet" in the sidebar
2. Click "Withdraw Funds"
3. Enter the amount and your bank details
4. Confirm the withdrawal request
5. Funds will be transferred to your bank account within 1-3 business days


### Admin Dashboard

#### User Management

1. Navigate to the "Users" section
2. View, search, and filter users by type (student, merchant, admin)
3. Click on a user to view detailed information
4. Approve, suspend, or delete user accounts as needed


#### Transaction Management

1. Navigate to the "Transactions" section
2. View all system transactions with advanced filtering options
3. Click on a transaction to view details
4. Handle disputed transactions and issue refunds if necessary


#### System Configuration

1. Navigate to the "Settings" section
2. Configure transaction fees, limits, and exchange rates
3. Manage payment gateway integrations
4. Set up system-wide notifications and announcements


## Deployment

### Backend API

The backend API can be deployed to any Node.js-compatible hosting service:

1. **Vercel**

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy with automatic CI/CD



2. **Heroku**

1. `heroku create cutcoin-api`
2. `git push heroku main`
3. Configure environment variables through the Heroku dashboard



3. **AWS Elastic Beanstalk**

1. Create a new application
2. Upload your code or connect to your repository
3. Configure environment variables and scaling options





### Merchant & Admin Dashboards

The Next.js applications can be deployed to:

1. **Vercel**

1. Connect your GitHub repository
2. Configure environment variables
3. Deploy with automatic CI/CD



2. **Netlify**

1. Connect your GitHub repository
2. Configure build settings and environment variables
3. Deploy with automatic CI/CD





### Student Mobile App

The React Native application can be deployed to:

1. **App Store (iOS)**

1. Generate an iOS build using Expo or React Native CLI
2. Create an App Store Connect account
3. Submit your app for review



2. **Google Play Store (Android)**

1. Generate an Android APK or AAB using Expo or React Native CLI
2. Create a Google Play Developer account
3. Submit your app for review





## Security

The CUTcoin system implements several security measures:

- **Authentication**: JWT-based authentication with token expiration and refresh mechanisms
- **Authorization**: Role-based access control for different user types
- **Data Protection**: Encryption of sensitive data in transit and at rest
- **Input Validation**: Server-side validation of all user inputs
- **Rate Limiting**: Protection against brute force attacks
- **Audit Logging**: Comprehensive logging of all system activities
- **Two-Factor Authentication**: Optional 2FA for enhanced account security


## Contributing

We welcome contributions to the CUTcoin project! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


Please ensure your code follows our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

- **Project Coordinator**: [Name] - [[email@example.com](mailto:email@example.com)]
- **Technical Lead**: [Name] - [[email@example.com](mailto:email@example.com)]
- **Support**: [[support@cutcoin.example.com](mailto:support@cutcoin.example.com)]


---

© 2025 Chinhoyi University of Technology. All rights reserved.

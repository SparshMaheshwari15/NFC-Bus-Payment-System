# NFC Bus Payment System

This project is a smart bus payment system that utilizes **NFC cards** to manage bus fares for students. The system consists of an NFC reader(**RC522**) that scans students' NFC cards, deducts fare from their account balance.The system also has features to block NFC cards to prevent misuse.


<!--and sends notifications when the balance is low or money is deducted.--> 

## Features

- **NFC Card Scanning**: Uses the RC522 NFC reader to read card data.
- **Student Account Management**: Maintains student accounts with details such as balance and card status.
- **Payment Processing**: Automatically deducts the fare from the student's account after scanning the NFC card.
<!--
- **Balance Notifications**: Sends a WhatsApp notification to students when their balance is low or after a payment is made.
-->
- **Card Blocking**: Allows admins to block cards to prevent misuse.
<!--
- **User Authentication**: Secure login system for admins and users.
- **UPI Payments**: Integrates UPI payments for bus fare top-up.
-->

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Contributing](#contributing)
- [License](#license)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/NFC-Bus-Payment-System.git
   cd NFC-Bus-Payment-System
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
    - Create a .env file and configure the following variables:

   ```bash
   MONGODB_URI=<your-mongodb-connection-string>
   ESP32TOKEN=<Your secret token for esp32 auth>
   ```
4. **Run the application**:
   ```bash
   nodemon server.js
    ```
## Usage

1. **Registering a New User**:
   - Admins can add new students by registering their NFC card UID, setting their initial balance, and assigning a status (**Enabled** or **Disabled**).
2. **NFC Card Scanning**:
   - When a student enters the bus, their NFC card is scanned. If the balance is sufficient, the fare is deducted.

3. **Blocking a Card**:
   - Admins can block a student's card via the admin interface to prevent further usage.


## Project Structure

```bash
NFC-Bus-Payment-System/
│
├── controllers/        # Business logic for handling card scanning, payments, etc.
├── ESP32 Code/        
├── models/             # Mongoose schemas for MongoDB collections
├── routes/             # Express route handlers
├── views/              # Frontend views for the admin interface
├── public/             # Static files (CSS, JS)
├── server.js              # Main application file
├── .env                # Environment variables configuration file
├── package.json        # Project dependencies and scripts
├── middleware.js
├── schema.js           # For Joi (Schema validations)
└── README.md           # Project documentation
```

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas or Local)
- **NFC Reader**: RC522 connected to an ESP32 microcontroller
- **Validation**: Joi for request validation
- **Frontend**: EJS (for rendering views)
<!--
- **Payment Integration**: UPI for recharging student accounts

- **Messaging**: Twilio WhatsApp API
-->

## Contributing

Feel free to contribute by creating a pull request. Please ensure your changes are well-tested and adhere to the project's coding standards. For larger changes, please open an issue to discuss what you would like to change before making a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


